// SolanaWallet.js
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import WalletBase from './WalletBase.js';
import { pgPool } from '../../database/db.js';
import { getCoinsFromRedis } from '../../database/dbContext.js';

class SolanaWallet extends WalletBase {
    constructor(userId) {
        super();
        this.keyPair = Keypair.generate();
        this.publicKey = this.keyPair.publicKey;
        this.connection = new Connection('https://api.mainnet-beta.solana.com');
        this.db = pgPool;
        this.userId = userId;
        this.coinId = null;
    }

    async getAddress() {
        return this.publicKey.toBase58();
    }

    async getBalance() {
        const balance = await this.connection.getBalance(this.publicKey);
        return balance;
    }

    async checkConnection() {
        try {
            const version = await this.connection.getVersion();
            return version !== null;
        } catch (error) {
            console.error('Error checking Solana connection:', error);
            return false;
        }
    }

    async getTransactions(filter = 'all') {
        try {
            const isConnected = await this.checkConnection();
            if (!isConnected) {
                throw new Error('Solana network connection failed');
            }
            const signatures = await this.connection.getSignaturesForAddress(this.publicKey);
            const transactions = await Promise.all(signatures.map(async signature => {
                const details = await this.getTransactionDetails(signature.signature);
                return {
                    signature: signature.signature,
                    slot: signature.slot,
                    blockTime: signature.blockTime,
                    status: signature.confirmationStatus,
                    type: details.instructions.some(ix => ix.programId.equals(SystemProgram.programId)) ? 'transfer' : 'other',
                };
            }));
            return filter === 'all' ? transactions : transactions.filter(tx => tx.type === filter);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    }

    async getTransactionDetails(signature) {
        try {
            const transaction = await this.connection.getTransaction(signature);
            if (!transaction) {
                throw new Error('Transaction not found');
            }
            return {
                slot: transaction.slot,
                blockTime: transaction.blockTime,
                meta: transaction.meta,
                instructions: transaction.transaction.message.instructions,
            };
        } catch (error) {
            console.error('Error fetching transaction details:', error);
            throw error;
        }
    }

    async withdraw(recipientAddress, amount) {
        try {
            if (!PublicKey.isOnCurve(recipientAddress)) {
                throw new Error('Invalid recipient address');
            }
            const balance = await this.getBalance();
            if (balance < amount) {
                throw new Error('Insufficient balance');
            }
            const recipientPublicKey = new PublicKey(recipientAddress);
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: this.publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: amount,
                })
            );
            const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.keyPair]);
            return signature;
        } catch (error) {
            console.error(`Error in withdraw method: ${error.message}`);
            throw error;
        }
    }

    async deposit(amount) {
        try {
            const coins = await getCoinsFromRedis();
            if (!Array.isArray(coins)) {
                throw new Error('Expected coins to be an array');
            }
            const solCoin = coins.find(coin => coin.symbol === "SOL");
            if (!solCoin) {
                throw new Error('SOL coin not found in coins array');
            }
            this.coinId = solCoin.id;
            await this.db.query('UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2 AND coin_id = $3', [amount, this.userId, this.coinId]);
            await this.db.query('INSERT INTO transactions (user_id, coin_id, amount, type, timestamp) VALUES ($1, $2, $3, $4, $5)', [this.userId, this.coinId, amount, 'deposit', new Date()]);
        } catch (error) {
            console.error('Error in deposit method:', error);
            throw error;
        }
    }
}

export default SolanaWallet;
