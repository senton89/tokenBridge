// wallets/WalletBase.js
import { pgPool } from '../../database/db.js';

class WalletBase {
    constructor() {
        // Processed transactions cache
        this.processedTransactions = new Set();
        // Database connection
        this.db = pgPool;
    }

    // Method to get wallet address (implemented by subclasses)
    async getAddress() {
        throw new Error("Not implemented");
    }

    // Method to get wallet balance (implemented by subclasses)
    async getBalance() {
        throw new Error("Not implemented");
    }

    // Method to withdraw funds (implemented by subclasses)
    async withdraw(recipientAddress, amount) {
        throw new Error("Not implemented");
    }

    // Method to get transactions (implemented by subclasses)
    async getTransactions() {
        throw new Error("Not implemented");
    }

    // Method to deposit funds to user's balance in the system
    async deposit(amount) {
        try {
            if (!this.userId || !this.coinId) {
                throw new Error('User ID or Coin ID not set');
            }

            // Update user balance
            await this.db.query(
                'UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2 AND coin_id = $3',
                [amount, this.userId, this.coinId]
            );

            // Record transaction
            await this.db.query(
                'INSERT INTO transactions (user_id, coin_id, amount, type, timestamp) VALUES ($1, $2, $3, $4, $5)',
                [this.userId, this.coinId, amount, 'deposit', new Date()]
            );

            return true;
        } catch (error) {
            console.error('Error in deposit method:', error);
            throw error;
        }
    }

    // Method to check for new deposits
    async checkNewDeposits() {
        try {
            const transactions = await this.getTransactions();

            if (!transactions || transactions.length === 0) {
                return [];
            }

            const newDeposits = [];

            for (const tx of transactions) {
                // Skip already processed transactions
                if (this.processedTransactions.has(tx.id || tx.hash || tx.txid)) {
                    continue;
                }

                // Check if this is an incoming transaction
                if (tx.type === 'incoming' || tx.amount > 0) {
                    // Mark as processed
                    this.processedTransactions.add(tx.id || tx.hash || tx.txid);

                    // Add to new deposits
                    newDeposits.push({
                        txHash: tx.id || tx.hash || tx.txid,
                        amount: tx.amount,
                        timestamp: tx.timestamp || new Date()
                    });
                }
            }

            return newDeposits;
        } catch (error) {
            console.error('Error checking for new deposits:', error);
            return [];
        }
    }
}

export default WalletBase;