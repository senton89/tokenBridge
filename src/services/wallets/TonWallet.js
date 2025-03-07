// TonWallet.js
import TonWeb from "tonweb";
import axios from "axios";
import WalletBase from "./WalletBase.js";
import { pgPool } from "../../database/db.js";
import { getCoinsFromRedis } from "../../database/dbContext.js";

class TonWallet extends WalletBase {
    constructor(userId) {
        super();
        this.tonWeb = new TonWeb();
        this.tonKeyPair = this.tonWeb.utils.newKeyPair();
        this.privateKey = this.tonKeyPair.secretKey;
        this.wallet = this.tonWeb.wallet.create({
            publicKey: this.tonKeyPair.publicKey,
            secretKey: this.tonKeyPair.secretKey,
        });
        this.apiEndpoint = "https://tonapi.io/v2";
        this.db = pgPool;
        this.userId = userId;
        this.coinId = null;
    }

    async getAddress() {
        const address = await this.wallet.getAddress();
        return address.toString(true, true, true);
    }

    async getBalance() {
        const address = await this.getAddress();
        const balance = await this.tonWeb.provider.getBalance(address);
        return balance;
    }

    async withdraw(recipientAddress, amount) {
        const seqno = await this.wallet.methods.seqno().call();
        const transaction = await this.wallet.transfer({
            secretKey: this.privateKey,
            toAddress: recipientAddress,
            amount: amount,
            seqno: seqno,
            payload: null,
            sendMode: 3,
            stateInit: null,
            expireAt: null,
        });
        console.log("Осуществлен вывод с TON:", transaction);
        return transaction;
    }

    async getTransactions() {
        const address = await this.getAddress();
        const transactions = await this.tonWeb.provider.getTransactions(address);
        return transactions;
    }

    async deposit(amount) {
        try {
            const coins = await getCoinsFromRedis();
            if (!Array.isArray(coins)) {
                throw new Error('Expected coins to be an array');
            }
            const tonCoin = coins.find(coin => coin.symbol === "TON");
            if (!tonCoin) {
                throw new Error('TON coin not found in coins array');
            }
            this.coinId = tonCoin.id;
            await this.db.query('UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2 AND coin_id = $3', [amount, this.userId, this.coinId]);
            await this.db.query('INSERT INTO transactions (user_id, coin_id, amount, type, timestamp) VALUES ($1, $2, $3, $4, $5)', [this.userId, this.coinId, amount, 'deposit', new Date()]);
        } catch (error) {
            console.error('Error in deposit method:', error);
            throw error;
        }
    }
}

export default TonWallet;
