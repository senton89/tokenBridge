// TronWallet.js
import TronWeb from 'tronweb';
import WalletBase from "./WalletBase.js";
import axios from 'axios';
import { pgPool } from "../../database/db.js";
import { getCoinsFromRedis } from "../../database/dbContext.js";

//Tether на троне

class TronWallet extends WalletBase {
    constructor(network = 'mainnet', userId) {
        super();
        if (!TronWeb || !TronWeb.utils || !TronWeb.utils.accounts) {
            throw new Error('TronWeb is not properly initialized');
        }
        const account = TronWeb.utils.accounts.generateAccount();
        this.tronWeb = new TronWeb.TronWeb({fullNode: 'https://api.trongrid.io', solidityNode: 'https://api.trongrid.io', eventServer: 'https://api.trongrid.io'});
        this.fullAddress = account.address;
        this.address = this.fullAddress.base58;
        this.privateKey = account.privateKey;
        this.db = pgPool;
        this.userId = userId;
        this.coinId = null;
    }

    async getAddress() {
        return this.address;
    }

    async getBalance() {
        try {
            const balanceSun = await this.tronWeb.trx.getBalance(this.address);
            return this.tronWeb.fromSun(balanceSun);
        } catch (error) {
            console.error('Ошибка при получении баланса:', error);
            throw new Error('Не удалось получить баланс');
        }
    }

    async withdraw(recipientAddress, amount) {
        try {
            const balance = await this.getBalance();
            if (balance < amount) {
                throw new Error('Недостаточно средств для транзакции');
            }
            const amountSun = this.tronWeb.toSun(amount);
            const transaction = await this.tronWeb.transactionBuilder.sendTrx(recipientAddress, amountSun, this.address);
            const signedTx = await this.tronWeb.trx.sign(transaction, this.privateKey);
            const result = await this.tronWeb.trx.sendRawTransaction(signedTx);
            return result.txid;
        } catch (error) {
            console.error('Ошибка при выполнении транзакции:', error);
            throw new Error('Не удалось выполнить транзакцию');
        }
    }

    async getTransactions() {
        try {
            if (!this.address) {
                throw new Error('Адрес кошелька не инициализирован');
            }

            const response = await axios.get(`https://api.trongrid.io/v1/accounts/${this.address}/transactions`, {
                params: {
                    limit: 200,
                    only_confirmed: true,
                    order_by: 'block_timestamp,desc',
                },
            });

            if (!response.data || !Array.isArray(response.data.data)) {
                throw new Error('Некорректный ответ от TronGrid');
            }

            if (response.data.data.length === 0) {
                console.warn('Для данного адреса транзакций не найдено:', this.address);
            }

            return response.data.data;
        } catch (error) {
            console.error('Ошибка при получении транзакций:', {
                message: error.message,
                address: this.address,
                stack: error.stack,
            });
            throw new Error('Не удалось получить список транзакций');
        }
    }

    async deposit(amount) {
        try {
            const coins = await getCoinsFromRedis();
            if (!Array.isArray(coins)) {
                throw new Error('Expected coins to be an array');
            }
            const trxCoin = coins.find(coin => coin.symbol === "TRX");
            if (!trxCoin) {
                throw new Error('TRX coin not found in coins array');
            }
            this.coinId = trxCoin.id;
            await this.db.query('UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2 AND coin_id = $3', [amount, this.userId, this.coinId]);
            await this.db.query('INSERT INTO transactions (user_id, coin_id, amount, type, timestamp) VALUES ($1, $2, $3, $4, $5)', [this.userId, this.coinId, amount, 'deposit', new Date()]);
        } catch (error) {
            console.error('Error in deposit method:', error);
            throw error;
        }
    }
}

export default TronWallet;
