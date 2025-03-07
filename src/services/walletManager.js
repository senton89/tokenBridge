import BitcoinWallet from './wallets/BitcoinWallet.js';
import DogecoinWallet from './wallets/DogecoinWallet.js';
import EthereumWallet from './wallets/EthereumWallet.js';
import NotWallet from './wallets/NotWallet.js';
import SolanaWallet from './wallets/SolanaWallet.js';
import TetherTonWallet from './wallets/TetherTonWallet.js';
import TonWallet from './wallets/TonWallet.js';
import { pgPool, redisClient } from '../database/db.js';
import { addTransaction } from '../database/dbContext.js';

class WalletManager {
    constructor() {
        // Central wallets (company wallets)
        this.centralWallets = {
            BTC: null,
            DOGE: null,
            ETH: null,
            NOT: null,
            SOL: null,
            USDT: null,
            TON: null
        };

        // Initialize central wallets
        this.initCentralWallets();

        // Map to store temporary user wallets
        this.temporaryWallets = new Map();
    }

    async initCentralWallets() {
        try {
            // Load central wallet keys from database or environment variables
            const centralWalletConfig = await pgPool.query('SELECT * FROM central_wallets');

            // Initialize each central wallet with stored keys
            for (const wallet of centralWalletConfig.rows) {
                switch (wallet.symbol) {
                    case 'BTC':
                        this.centralWallets.BTC = new BitcoinWallet(null, 0, wallet.private_key);
                        break;
                    case 'DOGE':
                        this.centralWallets.DOGE = new DogecoinWallet(null, 0, wallet.private_key);
                        break;
                    case 'ETH':
                        this.centralWallets.ETH = new EthereumWallet('mainnet', 0, wallet.private_key);
                        break;
                    case 'NOT':
                        this.centralWallets.NOT = new NotWallet(0, wallet.private_key);
                        break;
                    case 'SOL':
                        this.centralWallets.SOL = new SolanaWallet(0, wallet.private_key);
                        break;
                    case 'USDT':
                        this.centralWallets.USDT = new TetherTonWallet(0, wallet.private_key);
                        break;
                    case 'TON':
                        this.centralWallets.TON = new TonWallet(0, wallet.private_key);
                        break;
                }
            }

            console.log('Central wallets initialized successfully');
        } catch (error) {
            console.error('Failed to initialize central wallets:', error);
        }
    }

    async createTemporaryWallet(userId, coinSymbol) {
        try {
            let wallet;

            switch (coinSymbol) {
                case 'BTC':
                    wallet = new BitcoinWallet(null, userId);
                    break;
                case 'DOGE':
                    wallet = new DogecoinWallet(null, userId);
                    break;
                case 'ETH':
                    wallet = new EthereumWallet('mainnet', userId);
                    break;
                case 'NOT':
                    wallet = new NotWallet(userId);
                    break;
                case 'SOL':
                    wallet = new SolanaWallet(userId);
                    break;
                case 'USDT':
                    wallet = new TetherTonWallet(userId);
                    break;
                case 'TON':
                    wallet = new TonWallet(userId);
                    break;
                default:
                    throw new Error(`Unsupported coin: ${coinSymbol}`);
            }

            const address = await wallet.getAddress();

            // Store wallet in memory
            const walletKey = `${userId}:${coinSymbol}`;
            this.temporaryWallets.set(walletKey, wallet);

            // Store wallet address in Redis for persistence
            await redisClient.set(`temp_wallet:${walletKey}`, JSON.stringify({
                address,
                userId,
                coinSymbol,
                createdAt: new Date().toISOString()
            }), 'EX', 86400); // 24 hours expiry

            // Store in database for long-term reference
            await pgPool.query(
                'INSERT INTO user_temp_wallets (user_id, coin_symbol, address, created_at) VALUES ($1, $2, $3, $4)',
                [userId, coinSymbol, address, new Date()]
            );

            return { address, wallet };
        } catch (error) {
            console.error(`Error creating temporary ${coinSymbol} wallet:`, error);
            throw error;
        }
    }

    async getTemporaryWallet(userId, coinSymbol) {
        const walletKey = `${userId}:${coinSymbol}`;

        // Check if wallet exists in memory
        if (this.temporaryWallets.has(walletKey)) {
            return this.temporaryWallets.get(walletKey);
        }

        // Check if wallet exists in Redis
        const walletData = await redisClient.get(`temp_wallet:${walletKey}`);
        if (walletData) {
            // Recreate wallet instance
            return await this.createTemporaryWallet(userId, coinSymbol);
        }

        // Create new wallet if it doesn't exist
        return (await this.createTemporaryWallet(userId, coinSymbol)).wallet;
    }

    async monitorDeposits() {
        console.log('Starting deposit monitoring service...');

        // Get all temporary wallets from database
        const tempWallets = await pgPool.query('SELECT * FROM user_temp_wallets WHERE active = true');

        for (const walletData of tempWallets.rows) {
            const { user_id, coin_symbol, address } = walletData;

            try {
                // Recreate wallet instance
                const wallet = await this.getTemporaryWallet(user_id, coin_symbol);

                // Get current balance
                const balance = await wallet.getBalance();

                // If balance > 0, transfer to central wallet
                if (balance > 0) {
                    console.log(`Detected deposit of ${balance} ${coin_symbol} to temporary wallet for user ${user_id}`);

                    // Get central wallet address
                    const centralWalletAddress = await this.centralWallets[coin_symbol].getAddress();

                    // Transfer to central wallet (minus network fee)
                    const networkFee = this.calculateNetworkFee(coin_symbol, balance);
                    const transferAmount = balance - networkFee;

                    if (transferAmount > 0) {
                        const txHash = await wallet.withdraw(centralWalletAddress, transferAmount);

                        // Credit user's account in database
                        await wallet.deposit(transferAmount);

                        // Record transaction
                        await addTransaction(user_id, wallet.coinId, transferAmount, 'deposit', txHash);

                        console.log(`Successfully transferred ${transferAmount} ${coin_symbol} to central wallet. Transaction: ${txHash}`);
                    }
                }
            } catch (error) {
                console.error(`Error monitoring deposits for ${coin_symbol} wallet ${address}:`, error);
            }
        }
    }

    calculateNetworkFee(coinSymbol, amount) {
        // Simplified fee calculation - in production, use dynamic fee estimation
        const feeRates = {
            BTC: 0.0001,
            DOGE: 1,
            ETH: 0.002,
            NOT: 0.1,
            SOL: 0.00001,
            USDT: 1,
            TON: 0.05
        };

        return feeRates[coinSymbol] || 0;
    }

    async processWithdrawal(userId, coinSymbol, amount, destinationAddress) {
        try {
            // Validate user has sufficient balance
            const userBalanceResult = await pgPool.query(
                'SELECT ub.balance, c.id FROM user_balances ub JOIN coins c ON ub.coin_id = c.id WHERE ub.user_id = $1 AND c.symbol = $2',
                [userId, coinSymbol]
            );

            if (userBalanceResult.rows.length === 0 || userBalanceResult.rows[0].balance < amount) {
                throw new Error('Insufficient balance');
            }

            const coinId = userBalanceResult.rows[0].id;

            // Calculate withdrawal fee
            const withdrawalFee = this.calculateWithdrawalFee(coinSymbol, amount);
            const amountToSend = amount - withdrawalFee;

            if (amountToSend <= 0) {
                throw new Error('Amount after fee is too small');
            }

            // Get central wallet
            const centralWallet = this.centralWallets[coinSymbol];
            if (!centralWallet) {
                throw new Error(`Central wallet for ${coinSymbol} not found`);
            }

            // Send directly from central wallet to destination address
            const txHash = await centralWallet.withdraw(destinationAddress, amountToSend);

            // Update user balance
            await pgPool.query(
                'UPDATE user_balances SET balance = balance - $1 WHERE user_id = $2 AND coin_id = $3',
                [amount, userId, coinId]
            );

            // Record transaction
            await addTransaction(userId, coinId, amount, 'withdrawal', txHash);

            return {
                success: true,
                txHash,
                amount: amountToSend,
                fee: withdrawalFee
            };
        } catch (error) {
            console.error(`Error processing withdrawal for user ${userId}:`, error);
            throw error;
        }
    }

    calculateWithdrawalFee(coinSymbol, amount) {
        // Simplified fee calculation - in production, use dynamic fee estimation
        const feeRates = {
            BTC: 0.0002,
            DOGE: 2,
            ETH: 0.003,
            NOT: 0.2,
            SOL: 0.00002,
            USDT: 1.5,
            TON: 0.1
        };

        return feeRates[coinSymbol] || 0;
    }
}

export default new WalletManager();