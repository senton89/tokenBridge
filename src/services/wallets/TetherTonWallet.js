import TonWeb from "tonweb";
import WalletBase from "./WalletBase.js";
import { pgPool } from "../../database/db.js";
import { getCoinsFromRedis } from "../../database/dbContext.js";
import axios from "axios";

class TetherTonWallet extends WalletBase {
    constructor(userId) {
        super();
        this.tonWeb = new TonWeb(new TonWeb.HttpProvider(process.env.TONCENTER_API_URL));
        this.tonKeyPair = this.tonWeb.utils.newKeyPair();
        this.privateKey = this.tonKeyPair.secretKey;
        this.wallet = this.tonWeb.wallet.create({
            publicKey: this.tonKeyPair.publicKey,
            secretKey: this.tonKeyPair.secretKey,
        });
        this.db = pgPool;
        this.userId = userId;
        this.coinId = null;
    }

    async getAddress() {
        const address = await this.wallet.getAddress();
        return address.toString(true, true, true);
    }

    async getBalance() {
        try {
            const address = await this.getAddress();
            const response = await axios.post(this.apiUrl, {
                method: "getAddressBalance",
                params: { address },
                id: 1,
                jsonrpc: "2.0",
            });
            return response.data.result;
        } catch (error) {
            console.error('Error fetching USDT balance:', error);
            throw error;
        }
    }

    async withdraw(recipientAddress, amount) {
        try {
            const response = await axios.post(this.apiUrl, {
                method: "sendTransaction",
                params: {
                    fromAddress: await this.getAddress(),
                    toAddress: recipientAddress,
                    amount,
                },
                id: 1,
                jsonrpc: "2.0",
            });
            return response.data.result.txHash;
        } catch (error) {
            console.error('Error transferring USDT:', error);
            throw error;
        }
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
            const usdtCoin = coins.find(coin => coin.symbol === "USDT");
            if (!usdtCoin) {
                throw new Error('USDT coin not found in coins array');
            }
            this.coinId = usdtCoin.id;
            await this.db.query('UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2 AND coin_id = $3', [amount, this.userId, this.coinId]);
            await this.db.query('INSERT INTO transactions (user_id, coin_id, amount, type, timestamp) VALUES ($1, $2, $3, $4, $5)', [this.userId, this.coinId, amount, 'deposit', new Date()]);
        } catch (error) {
            console.error('Error in deposit method:', error);
            throw error;
        }
    }
}

export default TetherTonWallet;
