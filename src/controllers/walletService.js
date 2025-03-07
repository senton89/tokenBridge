import BitcoinWallet from './wallets/BitcoinWallet.js';
import EthereumWallet from './wallets/EthereumWallet.js';
import TonWallet from './wallets/TonWallet.js';
import DogecoinWallet from './wallets/DogecoinWallet.js';
import SolanaWallet from './wallets/SolanaWallet.js';
import NotWallet from './wallets/NotWallet.js';
import TetherTonWallet from './wallets/TetherTonWallet.js';
import { pgPool } from '../database/db.js';

// Create wallets for a user
export async function createWallets(userId) {
    try {
        console.log(`Creating wallets for user ${userId}...`);

        // Create instances of each wallet type
        const wallets = {
            BTC: new BitcoinWallet(undefined, userId),
            ETH: new EthereumWallet('mainnet', userId),
            TON: new TonWallet(userId),
            DOGE: new DogecoinWallet(undefined, userId),
            SOL: new SolanaWallet(userId),
            NOT: new NotWallet(userId),
            USDT: new TetherTonWallet(userId)
        };

        // Store wallet addresses in database
        for (const [symbol, wallet] of Object.entries(wallets)) {
            const address = await wallet.getAddress();

            // Get coin ID
            const coinResult = await pgPool.query('SELECT id FROM coins WHERE symbol = $1', [symbol]);

            if (coinResult.rows.length > 0) {
                const coinId = coinResult.rows[0].id;

                // Insert or update wallet address
                await pgPool.query(
                    `INSERT INTO user_wallets (user_id, coin_id, address)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, coin_id)
           DO UPDATE SET address = $3`,
                    [userId, coinId, address]
                );

                // Create initial balance record if it doesn't exist
                await pgPool.query(
                    `INSERT INTO user_balances (user_id, coin_id, balance)
           VALUES ($1, $2, 0)
           ON CONFLICT (user_id, coin_id)
           DO NOTHING`,
                    [userId, coinId]
                );
            }
        }

        console.log(`Wallets created successfully for user ${userId}`);
        return wallets;
    } catch (error) {
        console.error(`Error creating wallets for user ${userId}:`, error);
        throw error;
    }
}

// Get wallet for a specific user and coin
export async function getWallet(userId, coinSymbol) {
    try {
        // Create the appropriate wallet instance based on coin symbol
        switch (coinSymbol) {
            case 'BTC':
                return new BitcoinWallet(undefined, userId);
            case 'ETH':
                return new EthereumWallet('mainnet', userId);
            case 'TON':
                return new TonWallet(userId);
            case 'DOGE':
                return new DogecoinWallet(undefined, userId);
            case 'SOL':
                return new SolanaWallet(userId);
            case 'NOT':
                return new NotWallet(userId);
            case 'USDT':
                return new TetherTonWallet(userId);
            default:
                throw new Error(`Unsupported coin: ${coinSymbol}`);
        }
    } catch (error) {
        console.error(`Error getting wallet for user ${userId} and coin ${coinSymbol}:`, error);
        throw error;
    }
}