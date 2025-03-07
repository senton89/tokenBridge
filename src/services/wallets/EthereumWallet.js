import { ethers,InfuraProvider } from 'ethers';
import axios from 'axios';
import WalletBase from './WalletBase.js';
import { pgPool } from "../../database/db.js";
import { getCoinsFromRedis } from "../../database/dbContext.js";


class EthereumWallet extends WalletBase {
    constructor(network = 'mainnet', userId) {
        super();
        this.wallet = ethers.Wallet.createRandom();
        this.network = network;
        this.provider = new InfuraProvider(network, process.env.INFURA_PROJECT_ID);
        this.address = this.wallet.address;
        this.apiEndpoint = `https://api.etherscan.io/api`;
        this.db = pgPool;
        this.userId = userId;
        this.coinId = null;
    }

    async getAddress() {
        return this.address;
    }

    async getBalance() {
        const balance = await this.provider.getBalance(this.address);
        return ethers.formatEther(balance);
    }

    async withdraw(recipientAddress, amount) {
        const tx = await this.wallet.sendTransaction({
            to: recipientAddress,
            value: ethers.parseEther(amount.toString()),
        });
        return tx.hash;
    }

    async getTransactions() {
        const response = await axios.get(this.apiEndpoint, {
            params: {
                module: 'account',
                action: 'txlist',
                address: this.address,
                startblock: 0,
                endblock: 99999999,
                sort: 'desc',
                apikey: process.env.ETHERSCAN_API_KEY,
            },
        });
        return response.data.result;
    }

    async deposit(amount) {
        const coins = await getCoinsFromRedis();
        this.coinId = coins.find(coin => coin.symbol === 'ETH').id;
        await this.db.query('UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2 AND coin_id = $3', [amount, this.userId, this.coinId]);
        await this.db.query('INSERT INTO transactions (user_id, coin_id, amount, type, timestamp) VALUES ($1, $2, $3, $4, $5)', [this.userId, this.coinId, amount, 'deposit', new Date()]);
    }
}

export default EthereumWallet;
