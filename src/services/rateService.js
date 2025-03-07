import {redisClient} from '../database/db.js';
import axios from "axios";
import {getCoinsFromRedis, getCurrenciesFromRedis} from "../database/dbContext.js";

const EXCHANGE_RATE_API = 'https://min-api.cryptocompare.com/data/price';
const COINCAP_API = 'https://api.coincap.io/v2/rates';

async function getExchangeRatesFromCoinCap() {
    try {
        const response = await axios.get(COINCAP_API);
        return response.data.data;
    } catch (error) {
        console.error('Ошибка получения курсов обмена из CoinCap:', error);
    }
}

async function getExchangeRateFromCryptoCompare(fromCoin) {
    try {
        const response = await axios.get(`${EXCHANGE_RATE_API}?fsym=${fromCoin}&tsyms=USD`);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения курса обмена из Cryptocompare:', error);
    }
}

// Функция для получения данных от API
async function updateDataFromApi() {
    try {
        const coinCapResponse = await getExchangeRatesFromCoinCap();
        const coins = await getCoinsFromRedis();
        const currencies = await getCurrenciesFromRedis();

        const exchangeRatesUsd = coinCapResponse
            .filter((rate) => rate.type === 'crypto' && coins.some((coin) => coin.symbol === rate.symbol))
            .map((rate) => ({ coinId: rate.symbol, rate: rate.rateUsd }));
        const fiatRates = coinCapResponse
            .filter((rate) => rate.type === 'fiat' && currencies.some((currency) => currency.name === rate.symbol))
            .reduce((acc, rate) => ({ ...acc, [rate.symbol]: rate.rateUsd }), {});

        const exchangeRatesUsdWithCryptoCompare = [];

        for (const coin of coins) {
            const cryptoRate = exchangeRatesUsd.find((rate) => rate.symbol === coin.symbol);
            if (cryptoRate) {
                exchangeRatesUsdWithCryptoCompare.push({ coinId: coin.id, rate: cryptoRate.rateUsd });
            } else {
                const cryptoCompareRate = await getExchangeRateFromCryptoCompare(coin.symbol);
                if (cryptoCompareRate && (!cryptoCompareRate.Response || cryptoCompareRate.Response !== "Error")) {
                    exchangeRatesUsdWithCryptoCompare.push({ coinId: coin.id, rate: cryptoCompareRate.USD });
                } else {
                    console.log("Error when getting CryptoCompare Rate");
                }
            }
        }

        await redisClient.set('exchange_rates_usd', JSON.stringify(exchangeRatesUsdWithCryptoCompare));
        await redisClient.set('fiat_rates', JSON.stringify(fiatRates));

        await updateExchangeRatesInOtherCurrencies();
    } catch (error) {
        console.error('Ошибка получения данных от API:', error);
    }
}

async function updateExchangeRatesInOtherCurrencies() {
    try {
        const exchangeRates = [];
        const exchangeRatesUsd = await redisClient.get('exchange_rates_usd');
        const exchangeRatesUsdJson = JSON.parse(exchangeRatesUsd);

        const currencies = await getCurrenciesFromRedis();
        const fiatRates = await redisClient.get('fiat_rates');
        const fiatRatesJson = JSON.parse(fiatRates);

        for (const coin of exchangeRatesUsdJson) {
            for (const currency of currencies) {
                const fiatRate = fiatRatesJson[currency.name];
                if (fiatRate) {
                    const exchangeRate = coin.rate / fiatRate;
                    exchangeRates.push({ coinId: coin.coinId, currencyId: currency.id, rate: exchangeRate });
                }
            }
        }

        await redisClient.set('exchange_rates', JSON.stringify(exchangeRates));
    } catch (error) {
        console.error('Ошибка обновления курсов обмена в других валютах:', error);
    }
}

setInterval(updateDataFromApi, 5000); // Обновляем курсы обмена каждые 5 секунд

export { updateDataFromApi };