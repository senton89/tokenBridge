import express from 'express';
import { pgPool, redisClient } from '../database/db.js';
import {
    getCoinsFromRedis,
    getCurrenciesFromRedis,
    getAllExchangeRates,
    getAllCommissions,
    getUserById,
    getUserBalance,
    updateUserBalance,
    addTransaction
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

// Get deposit address
router.get('/wallet/deposit/:currency', async (req, res) => {
    try {
        const { currency } = req.params;
        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // This would typically generate or retrieve a wallet address
        // For now, we'll return a mock address
        const mockAddresses = {
            'TON': 'UQCXJvvom3Z1GuOUVYnDYU6e1862WHR9ZI9HeuECW113d1T',
            'USDT': 'UQCXJvvom3Z1GuOUVYnDYU6e1862WHR9ZI9HeuECW113d1T',
            'NOT': 'UQCXJvvom3Z1GuOUVYnDYU6e1862WHR9ZI9HeuECW113d1T',
            'BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            'ETH': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            'SOL': '5Uj9qHaGVRs2MhGEeQkUJJ5jXJwLGYAuGNxz9zZZTXt1',
            'TRX': 'TJYeasTPa6gpEEfYqJGtuFLmqQNEJ2Ey2u',
            'DOGE': 'D8vHdKZxfhtrw3MWrqMUN94VfmEtoDJ1Np'
        };

        const minDeposits = {
            'TON': 0.01,
            'USDT': 1,
            'NOT': 10,
            'BTC': 0.0001,
            'ETH': 0.01,
            'SOL': 0.01,
            'TRX': 1,
            'DOGE': 1
        };

        res.json({
            address: mockAddresses[currency] || 'address_not_available',
            currency,
            network: currency,
            minDeposit: minDeposits[currency] || 0.01
        });
    } catch (error) {
        console.error('Error getting deposit address:', error);
        res.status(500).json({ error: 'Failed to get deposit address' });
    }
});

// Create withdrawal request
router.post('/wallet/withdraw', async (req, res) => {
    try {
        const { currency, amount, address } = req.body;
        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // Find coin id
        const coins = await getCoinsFromRedis();
        const coin = coins.find(c => c.symbol === currency);

        if (!coin) {
            return res.status(400).json({ error: 'Invalid currency' });
        }

        // Check if user has enough balance
        const userBalance = await getUserBalance(userId, coin.id);

        if (!userBalance || parseFloat(userBalance.balance) < parseFloat(amount)) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Calculate fee (example: 1% fee)
        const fee = parseFloat(amount) * 0.01;
        const totalAmount = parseFloat(amount) + fee;

        // Update user balance
        await updateUserBalance(userId, coin.id, parseFloat(userBalance.balance) - totalAmount);

        // Create transaction record
        const transaction = await addTransaction(userId, coin.id, amount, 'withdrawal');

        // In a real app, you would initiate the actual blockchain transaction here

        res.json({
            id: transaction.id,
            currency,
            amount: parseFloat(amount),
            fee,
            address,
            status: 'pending',
            timestamp: transaction.timestamp
        });
    } catch (error) {
        console.error('Error processing withdrawal:', error);
        res.status(500).json({ error: 'Failed to process withdrawal' });
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

        // Get exchange rate
        const exchangeRates = await getAllExchangeRates();
        const rate = exchangeRates.find(r =>
            r.from_coin_id === fromCoin.id && r.to_coin_id === toCoin.id
        );

        if (!rate) {
            return res.status(400).json({ error: 'Exchange rate not available' });
        }

        // Calculate exchange amount
        const rateValue = parseFloat(rate.rate);
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

// Get minimum withdrawal amounts
router.get('/wallet/min-withdrawal-amounts', async (req, res) => {
    try {
        const coins = await getCoinsFromRedis();
        const minAmounts = {};

        coins.forEach(coin => {
            // These would typically come from a database
            const defaults = {
                'TON': 0.09,
                'USDT': 1,
                'NOT': 80,
                'BTC': 0.00015,
                'ETH': 0.003,
                'SOL': 0.01,
                'TRX': 10,
                'DOGE': 7
            };

            minAmounts[coin.symbol] = defaults[coin.symbol] || 0.01;
        });

        res.json(minAmounts);
    } catch (error) {
        console.error('Error fetching minimum withdrawal amounts:', error);
        res.status(500).json({ error: 'Failed to fetch minimum withdrawal amounts' });
    }
});

// Get market prices
router.get('/market/prices', async (req, res) => {
    try {
        const { currencies } = req.query;
        const coins = await getCoinsFromRedis();
        const prices = {};

        // These would typically come from an external API or database
        const mockPrices = {
            'TON': 5.25,
            'USDT': 1.0,
            'NOT': 0.05,
            'BTC': 50000,
            'ETH': 3000,
            'SOL': 100,
            'TRX': 0.1,
            'DOGE': 0.15
        };

        coins.forEach(coin => {
            prices[coin.symbol] = mockPrices[coin.symbol] || 1.0;
        });

        res.json(prices);
    } catch (error) {
        console.error('Error fetching prices:', error);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

// Get price changes
router.get('/market/price-changes', async (req, res) => {
    try {
        const { currencies } = req.query;
        const coins = await getCoinsFromRedis();
        const changes = {};

        // These would typically come from an external API or database
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

        coins.forEach(coin => {
            changes[coin.symbol] = mockChanges[coin.symbol] || 0.0;
        });

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

        // Get exchange rate
        const exchangeRates = await getAllExchangeRates();
        const rate = exchangeRates.find(r =>
            r.from_coin_id === fromCoin.id && r.to_coin_id === toCoin.id
        );

        if (!rate) {
            return res.status(400).json({ error: 'Exchange rate not available' });
        }

        res.json({
            fromCurrency,
            toCurrency,
            rate: parseFloat(rate.rate)
        });
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        res.status(500).json({ error: 'Failed to fetch exchange rate' });
    }
});

// Get historical data
router.get('/market/historical', async (req, res) => {
    try {
        const { currency, period } = req.query;

        // This would typically come from a database or external API
        // For now, we'll generate mock data
        const now = new Date();
        const data = [];

        // Generate data points based on period
        let points = 24;
        let interval = 60 * 60 * 1000; // 1 hour in milliseconds

        if (period === 'week') {
            points = 7;
            interval = 24 * 60 * 60 * 1000; // 1 day
        } else if (period === 'month') {
            points = 30;
            interval = 24 * 60 * 60 * 1000; // 1 day
        } else if (period === 'year') {
            points = 12;
            interval = 30 * 24 * 60 * 60 * 1000; // 1 month (approx)
        }

        // Base price depends on currency
        let basePrice = 1.0;
        switch (currency) {
            case 'BTC': basePrice = 50000; break;
            case 'ETH': basePrice = 3000; break;
            case 'TON': basePrice = 5.25; break;
            case 'SOL': basePrice = 100; break;
            case 'DOGE': basePrice = 0.15; break;
            case 'TRX': basePrice = 0.1; break;
            case 'NOT': basePrice = 0.05; break;
        }

        for (let i = points - 1; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - i * interval);
            // Generate a random price variation within ±5%
            const variation = (Math.random() * 10 - 5) / 100;
            const price = basePrice * (1 + variation);

            data.push({
                timestamp: timestamp.toISOString(),
                price: price.toFixed(currency === 'BTC' || currency === 'ETH' ? 2 : 4)
            });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching historical data:', error);
        res.status(500).json({ error: 'Failed to fetch historical data' });
    }
});

// P2P endpoints
// Get buy listings
router.post('/p2p/listings/buy', async (req, res) => {
    try {
        const filters = req.body;

        // This would typically come from a database
        // For now, we'll return mock data
        const listings = [
            {
                id: 1,
                type: 'buy',
                crypto: 'BTC',
                price: 50000,
                available: 0.5,
                currency: 'RUB',
                minAmount: 10000,
                maxAmount: 100000,
                paymentMethods: ['Сбербанк', 'Тинькофф'],
                user: {
                    name: 'Dashing Shark',
                    deals: 156,
                },
                instructions: 'Получатель: Куксенко Д.А'
            },
            {
                id: 3,
                type: 'buy',
                crypto: 'TON',
                price: 250,
                available: 100,
                currency: 'RUB',
                minAmount: 5000,
                maxAmount: 50000,
                paymentMethods: ['Сбербанк', 'QIWI'],
                user: {
                    name: 'Crypto Master',
                    deals: 89,
                },
                instructions: 'Оплата только с личного счета'
            }
        ];

        // Apply filters if provided
        let filteredListings = listings;

        if (filters) {
            if (filters.crypto) {
                filteredListings = filteredListings.filter(l => l.crypto === filters.crypto);
            }
            if (filters.currency) {
                filteredListings = filteredListings.filter(l => l.currency === filters.currency);
            }
            if (filters.paymentMethod) {
                filteredListings = filteredListings.filter(l =>
                    l.paymentMethods.includes(filters.paymentMethod)
                );
            }
        }

        res.json(filteredListings);
    } catch (error) {
        console.error('Error fetching buy listings:', error);
        res.status(500).json({ error: 'Failed to fetch buy listings' });
    }
});

// Get sell listings
router.post('/p2p/listings/sell', async (req, res) => {
    try {
        const filters = req.body;

        // This would typically come from a database
        // For now, we'll return mock data
        const listings = [
            {
                id: 2,
                type: 'sell',
                crypto: 'ETH',
                price: 3000,
                available: 2,
                currency: 'RUB',
                minAmount: 5000,
                maxAmount: 50000,
                paymentMethods: ['QIWI', 'Yandex.Money'],
                user: {
                    name: 'Crypto Master',
                    deals: 89
                },
                instructions: 'Оплата только с личного счета'
            },
            {
                id: 4,
                type: 'sell',
                crypto: 'TON',
                price: 240,
                available: 50,
                currency: 'RUB',
                minAmount: 2000,
                maxAmount: 20000,
                paymentMethods: ['Тинькофф', 'Сбербанк'],
                user: {
                    name: 'TON Trader',
                    deals: 45
                },
                instructions: 'Перевод в течение 15 минут'
            }
        ];

        // Apply filters if provided
        let filteredListings = listings;

        if (filters) {
            if (filters.crypto) {
                filteredListings = filteredListings.filter(l => l.crypto === filters.crypto);
            }
            if (filters.currency) {
                filteredListings = filteredListings.filter(l => l.currency === filters.currency);
            }
            if (filters.paymentMethod) {
                filteredListings = filteredListings.filter(l =>
                    l.paymentMethods.includes(filters.paymentMethod)
                );
            }
        }

        res.json(filteredListings);
    } catch (error) {
        console.error('Error fetching sell listings:', error);
        res.status(500).json({ error: 'Failed to fetch sell listings' });
    }
});

export default router;