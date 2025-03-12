import axios from "axios";
import { redisClient } from '../database/db.js';
import { getCoinsFromRedis, getCurrenciesFromRedis } from "../database/dbContext.js";

// API endpoints
const EXCHANGE_RATE_API = 'https://min-api.cryptocompare.com/data/price';
const COINCAP_API = 'https://api.coincap.io/v2/rates';

// Cache duration - 15 minutes instead of 5 seconds
const CACHE_DURATION = 15 * 60; // 15 minutes in seconds

// Fallback rates to use when APIs fail
const FALLBACK_RATES = {
    'TON': 5.25,
    'USDT': 1.0,
    'NOT': 0.05,
    'BTC': 50000,
    'ETH': 3000,
    'SOL': 100,
    'TRX': 0.1,
    'DOGE': 0.15
};

// Fallback fiat rates
const FALLBACK_FIAT_RATES = {
    'USD': 1.0,
    'RUB': 90.0,
    'EUR': 0.92,
    'BYN': 3.2,
    'UAH': 38.5,
    'GBP': 0.78,
    'CNY': 7.2,
    'KZT': 450.0
};

async function getExchangeRatesFromCoinCap() {
    try {
        // Check if we have cached data first
        const cachedData = await redisClient.get('coincap_rates');
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const response = await axios.get(COINCAP_API, {
            headers: {
                'Accept-Encoding': 'gzip'
            }
        });

        if (response.data && response.data.data) {
            // Cache the response
            await redisClient.set('coincap_rates', JSON.stringify(response.data.data), 'EX', CACHE_DURATION);
            return response.data.data;
        }

        return null;
    } catch (error) {
        console.error('Error getting exchange rates from CoinCap:', error.message);

        // Try to use cached data even if expired
        const cachedData = await redisClient.get('coincap_rates');
        if (cachedData) {
            console.log('Using cached exchange rates due to API error');
            return JSON.parse(cachedData);
        }

        return null;
    }
}

async function getExchangeRateFromCryptoCompare(fromCoin) {
    try {
        // Check cache first
        const cacheKey = `cryptocompare_${fromCoin}`;
        const cachedRate = await redisClient.get(cacheKey);
        if (cachedRate) {
            return JSON.parse(cachedRate);
        }

        const response = await axios.get(`${EXCHANGE_RATE_API}?fsym=${fromCoin}&tsyms=USD`);

        if (response.data && response.data.USD) {
            // Cache the response
            await redisClient.set(cacheKey, JSON.stringify(response.data), 'EX', CACHE_DURATION);
            return response.data;
        }

        return null;
    } catch (error) {
        console.error(`Error getting ${fromCoin} exchange rate from CryptoCompare:`, error.message);
        return null;
    }
}

// Function to update exchange rates
async function updateDataFromApi() {
    try {
        console.log('Updating exchange rates...');
        const coins = await getCoinsFromRedis();
        const currencies = await getCurrenciesFromRedis();

        if (!coins || !currencies) {
            throw new Error('Failed to get coins or currencies from Redis');
        }

        // Try to get rates from CoinCap
        let coinCapResponse = await getExchangeRatesFromCoinCap();
        let exchangeRatesUsd = [];
        let fiatRates = {};

        if (coinCapResponse) {
            // Process CoinCap data
            exchangeRatesUsd = coinCapResponse
                .filter(rate => rate.type === 'crypto' && coins.some(coin => coin.symbol === rate.symbol))
                .map(rate => ({
                    coinId: coins.find(c => c.symbol === rate.symbol)?.id,
                    symbol: rate.symbol,
                    rate: parseFloat(rate.rateUsd)
                }));

            fiatRates = coinCapResponse
                .filter(rate => rate.type === 'fiat' && currencies.some(currency => currency.name === rate.symbol))
                .reduce((acc, rate) => ({
                    ...acc,
                    [rate.symbol]: parseFloat(rate.rateUsd)
                }), {});
        }

        // Fill in missing rates or use fallbacks if API failed
        if (exchangeRatesUsd.length === 0) {
            // Use fallback rates
            exchangeRatesUsd = coins.map(coin => ({
                coinId: coin.id,
                symbol: coin.symbol,
                rate: FALLBACK_RATES[coin.symbol] || 1.0
            }));
        } else {
            // Fill in any missing coins from CryptoCompare or fallbacks
            for (const coin of coins) {
                if (!exchangeRatesUsd.some(rate => rate.symbol === coin.symbol)) {
                    // Try CryptoCompare first
                    const cryptoCompareRate = await getExchangeRateFromCryptoCompare(coin.symbol);

                    if (cryptoCompareRate && cryptoCompareRate.USD) {
                        exchangeRatesUsd.push({
                            coinId: coin.id,
                            symbol: coin.symbol,
                            rate: cryptoCompareRate.USD
                        });
                    } else {
                        // Use fallback rate
                        exchangeRatesUsd.push({
                            coinId: coin.id,
                            symbol: coin.symbol,
                            rate: FALLBACK_RATES[coin.symbol] || 1.0
                        });
                    }
                }
            }
        }

        // Use fallback fiat rates if needed
        if (Object.keys(fiatRates).length === 0) {
            fiatRates = FALLBACK_FIAT_RATES;
        }

        // Store in Redis
        await redisClient.set('exchange_rates_usd', JSON.stringify(exchangeRatesUsd), 'EX', CACHE_DURATION);
        await redisClient.set('fiat_rates', JSON.stringify(fiatRates), 'EX', CACHE_DURATION);

        // Update exchange rates in other currencies
        await updateExchangeRatesInOtherCurrencies();

        console.log('Exchange rates updated successfully');
    } catch (error) {
        console.error('Error updating exchange rates:', error.message);
    }
}

async function updateExchangeRatesInOtherCurrencies() {
    try {
        const exchangeRates = [];
        const exchangeRatesUsdStr = await redisClient.get('exchange_rates_usd');

        if (!exchangeRatesUsdStr) {
            throw new Error('USD exchange rates not found in Redis');
        }

        const exchangeRatesUsd = JSON.parse(exchangeRatesUsdStr);
        const currencies = await getCurrenciesFromRedis();
        const fiatRatesStr = await redisClient.get('fiat_rates');

        if (!fiatRatesStr) {
            throw new Error('Fiat rates not found in Redis');
        }

        const fiatRates = JSON.parse(fiatRatesStr);

        for (const coin of exchangeRatesUsd) {
            for (const currency of currencies) {
                const fiatRate = fiatRates[currency.name];
                if (fiatRate) {
                    const exchangeRate = coin.rate / fiatRate;
                    exchangeRates.push({
                        coinId: coin.coinId,
                        currencyId: currency.id,
                        rate: exchangeRate
                    });
                }
            }
        }

        await redisClient.set('exchange_rates', JSON.stringify(exchangeRates), 'EX', CACHE_DURATION);
    } catch (error) {
        console.error('Error updating exchange rates in other currencies:', error.message);
    }
}

// Update every 15 minutes instead of every 5 seconds
const UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes
let updateInterval = null;

// Function to start the update interval
function startUpdateInterval() {
    if (!updateInterval) {
        updateInterval = setInterval(updateDataFromApi, UPDATE_INTERVAL);
        console.log(`Rate update interval set to ${UPDATE_INTERVAL/60000} minutes`);
    }
}

// Function to stop the update interval
function stopUpdateInterval() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
        console.log('Rate update interval stopped');
    }
}

// Start the interval when the module is imported
startUpdateInterval();

export { updateDataFromApi, startUpdateInterval, stopUpdateInterval };