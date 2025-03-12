// routes/walletRoutes.js
import express from 'express';
import { pgPool } from '../database/db.js';
import {
    getUserById,
    getUserBalance,
    updateUserBalance,
    addTransaction,
    getCoinsFromRedis
} from '../database/dbContext.js';
import walletManager from '../services/WalletManager.js';

const router = express.Router();

// Generate deposit address for user
router.get('/wallet/deposit-address/:currency', async (req, res) => {
    try {
        const { currency } = req.params;
        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // Create or get temporary wallet
        const { address } = await walletManager.createTemporaryWallet(userId, currency);

        // Get minimum deposit amount
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
            address,
            currency,
            network: currency,
            minDeposit: minDeposits[currency] || 0.01
        });
    } catch (error) {
        console.error('Error generating deposit address:', error);
        res.status(500).json({ error: 'Failed to generate deposit address' });
    }
});

// Process withdrawal request
router.post('/wallet/withdraw', async (req, res) => {
    try {
        const { currency, amount, address } = req.body;
        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        if (!currency || !amount || !address) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Validate amount
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Get minimum withdrawal amounts
        const minWithdrawalAmounts = {
            'TON': 0.09,
            'USDT': 1,
            'NOT': 80,
            'BTC': 0.00015,
            'ETH': 0.003,
            'SOL': 0.01,
            'TRX': 10,
            'DOGE': 7
        };

        // Get coin ID
        const coins = await getCoinsFromRedis();
        const coin = coins.find(c => c.symbol === currency);

        if (!coin) {
            return res.status(400).json({ error: 'Invalid currency' });
        }

        // Check if user has enough balance
        const userBalance = await getUserBalance(userId, coin.id);

        if (!userBalance || parseFloat(userBalance.balance) < parsedAmount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Process withdrawal
        const result = await walletManager.processWithdrawal(userId, currency, parsedAmount, address);

        res.json({
            id: Date.now(), // This would be a transaction ID in production
            currency,
            amount: parsedAmount,
            fee: result.fee,
            address,
            status: 'pending',
            txHash: result.txHash,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error processing withdrawal:', error);
        res.status(500).json({ error: error.message || 'Failed to process withdrawal' });
    }
});

// Check deposit status
router.get('/wallet/deposit-status/:currency', async (req, res) => {
    try {
        const { currency } = req.params;
        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // Get active temporary wallet
        const tempWallet = await pgPool.query(
            'SELECT * FROM user_temp_wallets WHERE user_id = $1 AND coin_symbol = $2 AND active = true',
            [userId, currency]
        );

        if (tempWallet.rows.length === 0) {
            return res.status(404).json({ error: 'No active deposit address found' });
        }

        const walletData = tempWallet.rows[0];
        const wallet = await walletManager.getTemporaryWallet(userId, currency);
        const balance = await wallet.getBalance();

        res.json({
            address: walletData.address,
            balance,
            currency,
            status: balance > 0 ? 'pending_confirmation' : 'waiting_for_deposit',
            createdAt: walletData.created_at
        });
    } catch (error) {
        console.error('Error checking deposit status:', error);
        res.status(500).json({ error: 'Failed to check deposit status' });
    }
});
// Get minimum withdrawal amounts
router.get('/wallet/min-withdrawal-amounts', async (req, res) => {
    try {
        // These would typically come from a database
        const minWithdrawalAmounts = {
            'TON': 0.09,
            'USDT': 1,
            'NOT': 80,
            'BTC': 0.00015,
            'ETH': 0.003,
            'SOL': 0.01,
            'TRX': 10,
            'DOGE': 7
        };

        res.json(minWithdrawalAmounts);
    } catch (error) {
        console.error('Error fetching minimum withdrawal amounts:', error);
        res.status(500).json({ error: 'Failed to fetch minimum withdrawal amounts' });
    }
});

// Get available coins for exchange
router.get('/wallet/available-coins', async (req, res) => {
    try {
        const coins = await getCoinsFromRedis();
        res.json(coins);
    } catch (error) {
        console.error('Error fetching available coins:', error);
        res.status(500).json({ error: 'Failed to fetch available coins' });
    }
});

export default router;