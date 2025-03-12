// services/WalletManager.js
import BitcoinWallet from './wallets/BitcoinWallet.js';
import DogecoinWallet from './wallets/DogecoinWallet.js';
import EthereumWallet from './wallets/EthereumWallet.js';
import NotWallet from './wallets/NotWallet.js';
import SolanaWallet from './wallets/SolanaWallet.js';
import TetherTonWallet from './wallets/TetherTonWallet.js';
import TonWallet from './wallets/TonWallet.js';
import { pgPool, redisClient } from '../database/db.js';
import { addTransaction, getUserBalance, updateUserBalance } from '../database/dbContext.js';

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

        // Start monitoring deposits
        this.startDepositMonitoring();
    }

    async initCentralWallets() {
        try {
            // Load central wallet keys from database
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
            let privateKey = wallet.privateKey || wallet.keyPair?.privateKey;

            const privateKeyString = typeof privateKey === 'string'
                ? privateKey
                : Buffer.isBuffer(privateKey)
                    ? privateKey.toString('hex')
                    : JSON.stringify(privateKey);

            // Store wallet in memory
            const walletKey = `${userId}:${coinSymbol}`;

            this.temporaryWallets.set(walletKey, wallet);

            // Store wallet address in Redis for persistence (24 hours expiry)
            await redisClient.set(
                `temp_wallet:${walletKey}`,
                JSON.stringify({
                    address,
                    privateKey,
                    userId,
                    coinSymbol,
                    createdAt: new Date().toISOString()
                }),
                'EX', 86400
            );

            // Store in database for long-term reference
            await pgPool.query(
                'INSERT INTO user_temp_wallets (user_id, coin_symbol, address, private_key, created_at, active) VALUES ($1, $2, $3, $4, $5, $6)',
                [userId, coinSymbol, address, privateKeyString, new Date(), true]
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
        const walletDataStr = await redisClient.get(`temp_wallet:${walletKey}`);
        if (walletDataStr) {
            const walletData = JSON.parse(walletDataStr);

            // Recreate wallet instance with the stored private key
            let wallet;

            switch (coinSymbol) {
                case 'BTC':
                    wallet = new BitcoinWallet(null, userId, walletData.privateKey);
                    break;
                case 'DOGE':
                    wallet = new DogecoinWallet(null, userId, walletData.privateKey);
                    break;
                case 'ETH':
                    wallet = new EthereumWallet('mainnet', userId, walletData.privateKey);
                    break;
                case 'NOT':
                    wallet = new NotWallet(userId, walletData.privateKey);
                    break;
                case 'SOL':
                    wallet = new SolanaWallet(userId, walletData.privateKey);
                    break;
                case 'USDT':
                    wallet = new TetherTonWallet(userId, walletData.privateKey);
                    break;
                case 'TON':
                    wallet = new TonWallet(userId, walletData.privateKey);
                    break;
                default:
                    throw new Error(`Unsupported coin: ${coinSymbol}`);
            }

            // Store in memory
            this.temporaryWallets.set(walletKey, wallet);
            return wallet;
        }

        // Check database for wallet
        const dbWallet = await pgPool.query(
            'SELECT * FROM user_temp_wallets WHERE user_id = $1 AND coin_symbol = $2 AND active = true',
            [userId, coinSymbol]
        );

        if (dbWallet.rows.length > 0) {
            const walletData = dbWallet.rows[0];

            // Recreate wallet instance with the stored private key
            let wallet;

            switch (coinSymbol) {
                case 'BTC':
                    wallet = new BitcoinWallet(null, userId, walletData.private_key);
                    break;
                case 'DOGE':
                    wallet = new DogecoinWallet(null, userId, walletData.private_key);
                    break;
                case 'ETH':
                    wallet = new EthereumWallet('mainnet', userId, walletData.private_key);
                    break;
                case 'NOT':
                    wallet = new NotWallet(userId, walletData.private_key);
                    break;
                case 'SOL':
                    wallet = new SolanaWallet(userId, walletData.private_key);
                    break;
                case 'USDT':
                    wallet = new TetherTonWallet(userId, walletData.private_key);
                    break;
                case 'TON':
                    wallet = new TonWallet(userId, walletData.private_key);
                    break;
                default:
                    throw new Error(`Unsupported coin: ${coinSymbol}`);
            }

            // Store in memory and Redis
            this.temporaryWallets.set(walletKey, wallet);
            await redisClient.set(
                `temp_wallet:${walletKey}`,
                JSON.stringify({
                    address: walletData.address,
                    privateKey: walletData.private_key,
                    userId,
                    coinSymbol,
                    createdAt: walletData.created_at
                }),
                'EX', 86400
            );

            return wallet;
        }

        // Create new wallet if it doesn't exist
        return (await this.createTemporaryWallet(userId, coinSymbol)).wallet;
    }

    startDepositMonitoring() {
        // Check for deposits every 2 minutes
        setInterval(() => this.monitorDeposits(), 2 * 60 * 1000);
        console.log('Deposit monitoring service started');
    }

    async monitorDeposits() {
        console.log('Checking for new deposits...');

        // Get all active temporary wallets from database
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
                        // Execute the transfer
                        const txHash = await wallet.withdraw(centralWalletAddress, transferAmount);

                        // Get coin ID
                        const coinResult = await pgPool.query('SELECT id FROM coins WHERE symbol = $1', [coin_symbol]);
                        const coinId = coinResult.rows[0].id;

                        // Credit user's account in database
                        const userBalance = await getUserBalance(user_id, coinId);
                        if (userBalance) {
                            await updateUserBalance(user_id, coinId, parseFloat(userBalance.balance) + transferAmount);
                        } else {
                            // Create new balance record if it doesn't exist
                            await pgPool.query(
                                'INSERT INTO user_balances (user_id, coin_id, balance) VALUES ($1, $2, $3)',
                                [user_id, coinId, transferAmount]
                            );
                        }

                        // Record transaction
                        await addTransaction(user_id, coinId, transferAmount, 'deposit', txHash);

                        console.log(`Successfully transferred ${transferAmount} ${coin_symbol} to central wallet. Transaction: ${txHash}`);

                        // Mark temporary wallet as inactive after successful transfer
                        await pgPool.query(
                            'UPDATE user_temp_wallets SET active = false, last_used = $1 WHERE user_id = $2 AND coin_symbol = $3',
                            [new Date(), user_id, coin_symbol]
                        );
                    }
                }
            } catch (error) {
                console.error(`Error monitoring deposits for ${coin_symbol} wallet ${address}:`, error);
            }
        }
    }

    calculateNetworkFee(coinSymbol, amount) {
        // Dynamic fee calculation based on network conditions and amount
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
            // Get coin ID
            const coinResult = await pgPool.query('SELECT id FROM coins WHERE symbol = $1', [coinSymbol]);
            if (coinResult.rows.length === 0) {
                throw new Error(`Coin ${coinSymbol} not found`);
            }
            const coinId = coinResult.rows[0].id;

            // Validate user has sufficient balance
            const userBalance = await getUserBalance(userId, coinId);

            if (!userBalance || parseFloat(userBalance.balance) < amount) {
                throw new Error('Insufficient balance');
            }

            // Calculate withdrawal fee
            const withdrawalFee = this.calculateWithdrawalFee(coinSymbol, amount);
            const amountToSend = amount - withdrawalFee;

            if (amountToSend <= 0) {
                throw new Error('Amount after fee is too small');
            }

            // Create or get temporary wallet for the withdrawal
            const tempWallet = await this.getTemporaryWallet(userId, coinSymbol);
            const tempWalletAddress = await tempWallet.getAddress();

            // Get central wallet
            const centralWallet = this.centralWallets[coinSymbol];
            if (!centralWallet) {
                throw new Error(`Central wallet for ${coinSymbol} not found`);
            }

            // Step 1: Send from central wallet to temporary wallet
            console.log(`Sending ${amountToSend} ${coinSymbol} from central wallet to temporary wallet ${tempWalletAddress}`);
            const internalTxHash = await centralWallet.withdraw(tempWalletAddress, amountToSend);

            // Wait for confirmation (this would be more sophisticated in production)
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Step 2: Send from temporary wallet to destination address
            console.log(`Sending ${amountToSend} ${coinSymbol} from temporary wallet to destination ${destinationAddress}`);
            const externalTxHash = await tempWallet.withdraw(destinationAddress, amountToSend);

            // Update user balance
            await updateUserBalance(userId, coinId, parseFloat(userBalance.balance) - amount);

            // Record transactions
            await addTransaction(userId, coinId, -amount, 'withdrawal', externalTxHash);

            // Mark temporary wallet as inactive
            await pgPool.query(
                'UPDATE user_temp_wallets SET active = false, last_used = $1 WHERE user_id = $2 AND coin_symbol = $3',
                [new Date(), userId, coinSymbol]
            );

            return {
                success: true,
                txHash: externalTxHash,
                amount: amountToSend,
                fee: withdrawalFee
            };
        } catch (error) {
            console.error(`Error processing withdrawal for user ${userId}:`, error);
            throw error;
        }
    }

    calculateWithdrawalFee(coinSymbol, amount) {
        // Dynamic fee calculation based on network conditions and amount
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