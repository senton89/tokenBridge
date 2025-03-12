// controllers/exchangeController.js
import express from 'express';
import { pgPool, redisClient } from '../database/db.js';
import {
    getCoinsFromRedis,
    getCurrenciesFromRedis,
    getUserById,
    getUserBalance,
    updateUserBalance,
    addTransaction,
    getAllExchangeRates
} from '../database/dbContext.js';

const router = express.Router();

router.use(express.json());

// Get all available coins
router.get('/coins', async (req, res) => {
    try {
        const coins = await getCoinsFromRedis();
        res.json(coins);
    } catch (error) {
        console.error('Error fetching coins:', error);
        res.status(500).json({ error: 'Failed to fetch coins' });
    }
});

// Get all available currencies
router.get('/currencies', async (req, res) => {
    try {
        const currencies = await getCurrenciesFromRedis();
        res.json(currencies);
    } catch (error) {
        console.error('Error fetching currencies:', error);
        res.status(500).json({ error: 'Failed to fetch currencies' });
    }
});

// Get wallet balance
router.get('/wallet/balance', async (req, res) => {
    try {
        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        const coins = await getCoinsFromRedis();
        const balances = {};

        for (const coin of coins) {
            const balance = await getUserBalance(userId, coin.id);
            balances[coin.symbol] = balance ? parseFloat(balance.balance) : 0;
        }

        res.json(balances);
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});

// Get transaction history
router.get('/wallet/transactions', async (req, res) => {
    try {
        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        const query = `
      SELECT t.id, t.type, c.symbol as currency, t.amount, 
             CASE WHEN t.status IS NULL THEN 'completed' ELSE t.status END as status, 
             t.timestamp, t.tx_hash as "txHash"
      FROM transactions t
      JOIN coins c ON t.coin_id = c.id
      WHERE t.user_id = $1
      ORDER BY t.timestamp DESC
    `;

        const result = await pgPool.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Exchange currency
router.post('/wallet/exchange', async (req, res) => {
    try {
        const { fromCurrency, toCurrency, fromAmount } = req.body;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // Find coin ids
        const coins = await getCoinsFromRedis();
        const fromCoin = coins.find(c => c.symbol === fromCurrency);
        const toCoin = coins.find(c => c.symbol === toCurrency);

        if (!fromCoin || !toCoin) {
            return res.status(400).json({ error: 'Invalid currency' });
        }

        // Check if user has enough balance
        const userBalance = await getUserBalance(userId, fromCoin.id);

        if (!userBalance || parseFloat(userBalance.balance) < parseFloat(fromAmount)) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Get exchange rate using the same logic as in market/exchange-rate endpoint
        let rateValue;

        // Try to get direct rate from database first
        const exchangeRates = await getAllExchangeRates();
        const dbRate = exchangeRates.find(r =>
            r.from_coin_id === fromCoin.id && r.to_coin_id === toCoin.id
        );

        if (dbRate) {
            rateValue = parseFloat(dbRate.rate);
        } else {
            // If direct rate not found, calculate through USD rates
            // Get USD rates for both currencies from Redis
            const fromUsdRateKey = `rate:${fromCurrency}`;
            const toUsdRateKey = `rate:${toCurrency}`;

            let fromUsdRate = await redisClient.get(fromUsdRateKey);
            let toUsdRate = await redisClient.get(toUsdRateKey);

            // If rates not in Redis, get from exchange_rates_usd in Redis
            if (!fromUsdRate || !toUsdRate) {
                const exchangeRatesUsdStr = await redisClient.get('exchange_rates_usd');

                if (exchangeRatesUsdStr) {
                    const exchangeRatesUsd = JSON.parse(exchangeRatesUsdStr);

                    const fromRateObj = exchangeRatesUsd.find(r => r.symbol === fromCurrency);
                    const toRateObj = exchangeRatesUsd.find(r => r.symbol === toCurrency);

                    fromUsdRate = fromRateObj ? fromRateObj.rate : null;
                    toUsdRate = toRateObj ? toRateObj.rate : null;
                }
            } else {
                // Parse string values from Redis
                fromUsdRate = parseFloat(fromUsdRate);
                toUsdRate = parseFloat(toUsdRate);
            }

            // If we still don't have rates, use fallback rates
            if (!fromUsdRate || !toUsdRate) {
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

                fromUsdRate = FALLBACK_RATES[fromCurrency] || 1.0;
                toUsdRate = FALLBACK_RATES[toCurrency] || 1.0;
            }

            // Calculate cross rate: fromCurrency to USD to toCurrency
            rateValue = fromUsdRate / toUsdRate;

            // Cache this calculated rate for future use
            const rateKey = `rate:${fromCurrency}:${toCurrency}`;
            await redisClient.set(rateKey, rateValue.toString(), 'EX', 900); // Cache for 15 minutes
        }


        if (!rateValue) {
            return res.status(400).json({ error: 'Exchange rate not available' });
        }

        // Calculate exchange amount
        // const rateValue = parseFloat(rate.rate);
        const toAmount = parseFloat(fromAmount) * rateValue;

        // Calculate fee (example: 0.5% fee)
        const fee = parseFloat(fromAmount) * 0.005;

        // Update user balances
        await updateUserBalance(userId, fromCoin.id, parseFloat(userBalance.balance) - parseFloat(fromAmount));

        const toBalance = await getUserBalance(userId, toCoin.id);
        if (toBalance) {
            await updateUserBalance(userId, toCoin.id, parseFloat(toBalance.balance) + toAmount);
        } else {
            // Create new balance record if it doesn't exist
            await pgPool.query(
                'INSERT INTO user_balances (user_id, coin_id, balance) VALUES ($1, $2, $3)',
                [userId, toCoin.id, toAmount]
            );
        }

        // Create transaction records
        const fromTransaction = await addTransaction(userId, fromCoin.id, -fromAmount, 'exchange');
        const toTransaction = await addTransaction(userId, toCoin.id, toAmount, 'exchange');

        res.json({
            id: fromTransaction.id,
            fromCurrency,
            toCurrency,
            fromAmount: parseFloat(fromAmount),
            toAmount,
            rate: rateValue,
            fee,
            status: 'completed',
            timestamp: fromTransaction.timestamp
        });
    } catch (error) {
        console.error('Error processing exchange:', error);
        res.status(500).json({ error: 'Failed to process exchange' });
    }
});

// Get market prices
router.get('/market/prices', async (req, res) => {
    try {
        const { currency = 'USD' } = req.query; // Default to USD if not specified

        // Get all coins and currencies
        const coins = await getCoinsFromRedis();
        const currencies = await getCurrenciesFromRedis();

        // Find the requested currency
        const targetCurrency = currencies.find(c => c.name === currency);
        if (!targetCurrency) {
            return res.status(400).json({ error: 'Invalid currency' });
        }

        // Get all exchange rates
        const exchangeRates = await getAllExchangeRates();
        const prices = {};

        // Calculate price for each coin in the requested currency
        for (const coin of coins) {
            // Find the rate for this coin to the requested currency
            const rate = exchangeRates.find(r =>
                r.coinId === coin.id && r.currencyId === targetCurrency.id
            );

            if (rate) {
                prices[coin.symbol] = parseFloat(rate.rate);
            } else {
                // If no rate found, try to find a rate through another currency (e.g., USD)
                // This is a simplified approach - in production you might want a more sophisticated conversion
                prices[coin.symbol] = null;
            }
        }

        // Fill in any missing prices with mock data if needed
        const mockPrices = {
            'TON': 5.25,
            'USDT': 1.0,
            'NOT': 0.05,
            'BTC': 90000,
            'ETH': 3000,
            'SOL': 100,
            'TRX': 0.1,
            'DOGE': 0.15
        };

        for (const coin of coins) {
            if (prices[coin.symbol] === null) {
                prices[coin.symbol] = mockPrices[coin.symbol] || 1.0;
            }
        }

        res.json({
            data: prices
        });
    } catch (error) {
        console.error('Error fetching prices:', error);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

// Get price changes (24h)
router.get('/market/price-changes', async (req, res) => {
    try {
        const coins = await getCoinsFromRedis();
        const changes = {};

        // Mock data for price changes
        const mockChanges = {
            'TON': 2.5,
            'USDT': 0.0,
            'NOT': -1.2,
            'BTC': 1.8,
            'ETH': -0.5,
            'SOL': 3.2,
            'TRX': -0.8,
            'DOGE': 5.0
        };

        for (const coin of coins) {
            changes[coin.symbol] = mockChanges[coin.symbol] || 0;
        }

        res.json(changes);
    } catch (error) {
        console.error('Error fetching price changes:', error);
        res.status(500).json({ error: 'Failed to fetch price changes' });
    }
});

// Get exchange rate
router.get('/market/exchange-rate', async (req, res) => {
    try {
        const { fromCurrency, toCurrency } = req.query;

        // Find coin ids
        const coins = await getCoinsFromRedis();
        const fromCoin = coins.find(c => c.symbol === fromCurrency);
        const toCoin = coins.find(c => c.symbol === toCurrency);

        if (!fromCoin || !toCoin) {
            return res.status(400).json({ error: 'Invalid currency' });
        }

        // Try to get direct rate from database first
        const exchangeRates = await getAllExchangeRates();
        const dbRate = exchangeRates.find(r =>
            r.from_coin_id === fromCoin.id && r.to_coin_id === toCoin.id
        );

        if (dbRate) {
            return res.json({
                fromCurrency,
                toCurrency,
                rate: parseFloat(dbRate.rate)
            });
        }

        // If direct rate not found, calculate through USD rates
        // Get USD rates for both currencies from Redis
        const fromUsdRateKey = `rate:${fromCurrency}`;
        const toUsdRateKey = `rate:${toCurrency}`;

        let fromUsdRate = await redisClient.get(fromUsdRateKey);
        let toUsdRate = await redisClient.get(toUsdRateKey);

        // If rates not in Redis, get from exchange_rates_usd in Redis
        if (!fromUsdRate || !toUsdRate) {
            const exchangeRatesUsdStr = await redisClient.get('exchange_rates_usd');

            if (exchangeRatesUsdStr) {
                const exchangeRatesUsd = JSON.parse(exchangeRatesUsdStr);

                const fromRateObj = exchangeRatesUsd.find(r => r.symbol === fromCurrency);
                const toRateObj = exchangeRatesUsd.find(r => r.symbol === toCurrency);

                fromUsdRate = fromRateObj ? fromRateObj.rate : null;
                toUsdRate = toRateObj ? toRateObj.rate : null;
            }
        } else {
            // Parse string values from Redis
            fromUsdRate = parseFloat(fromUsdRate);
            toUsdRate = parseFloat(toUsdRate);
        }

        // If we still don't have rates, use fallback rates
        if (!fromUsdRate || !toUsdRate) {
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

            fromUsdRate = FALLBACK_RATES[fromCurrency] || 1.0;
            toUsdRate = FALLBACK_RATES[toCurrency] || 1.0;
        }

        // Calculate cross rate: fromCurrency to USD to toCurrency
        // If fromUsdRate is the price of fromCurrency in USD,
        // and toUsdRate is the price of toCurrency in USD,
        // then the cross rate is: fromUsdRate / toUsdRate
        const crossRate = fromUsdRate / toUsdRate;

        // Cache this calculated rate for future use
        const rateKey = `rate:${fromCurrency}:${toCurrency}`;
        await redisClient.set(rateKey, crossRate.toString(), 'EX', 900); // Cache for 15 minutes

        res.json({
            fromCurrency,
            toCurrency,
            rate: crossRate
        });

    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        res.status(500).json({ error: 'Failed to fetch exchange rate' });
    }
});

export default router;