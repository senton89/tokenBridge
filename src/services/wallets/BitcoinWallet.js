// BitcoinWallet.js
import bitcoin from 'bitcoinjs-lib';
import axios from 'axios';
import WalletBase from "./WalletBase.js";
import { randomBytes } from "crypto";
import ECPairFactory from "ecpair";
import * as ecc from 'tiny-secp256k1';
import { pgPool } from "../../database/db.js";
import { getCoinsFromRedis } from "../../database/dbContext.js";

class BitcoinWallet extends WalletBase {
    constructor(network = bitcoin.networks.bitcoin, userId) {
        super();
        const ECPair = ECPairFactory(ecc);
        const rng = (size) => randomBytes(size);
        this.keyPair = ECPair.makeRandom({rng});
        this.network = network;
        this.address = bitcoin.payments.p2pkh({ pubkey: Buffer.from(ECPair.fromPrivateKey(this.keyPair.privateKey, { network }).publicKey.buffer), network }).address;
        this.apiEndpoint = "https://api.blockcypher.com/v1/btc/main";
        this.db = pgPool;
        this.userId = userId;
        this.coinId = null;
    }

    async getAddress() {
        return this.address;
    }

    async getBalance() {
        const response = await axios.get(`${this.apiEndpoint}/addrs/${this.address}/balance`);
        return response.data.final_balance;
    }

    async withdraw(recipientAddress, amount) {
        const utxos = await this.getUtxos();
        const totalAmount = utxos.reduce((acc, utxo) => acc + utxo.value, 0);

        if (totalAmount < amount) {
            throw new Error('Недостаточно средств для транзакции');
        }

        const psbt = new bitcoin.Psbt({ network: this.network });
        psbt.setVersion(2);
        psbt.setLocktime(0);

        utxos.forEach(utxo => {
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                nonWitnessUtxo: Buffer.from(utxo.script, 'hex'),
            });
        });

        psbt.addOutput({
            address: recipientAddress,
            value: amount,
        });

        psbt.signInput(0, this.keyPair);
        psbt.validateSignaturesOfInput(0, (pubkey, msghash, signature) =>
            ECPairFactory(ecc).fromPublicKey(pubkey).verify(msghash, signature)
        );
        psbt.finalizeAllInputs();

        const rawTransaction = psbt.extractTransaction().toHex();
        const response = await axios.post(`${this.apiEndpoint}/txs/push`, { tx: rawTransaction });
        return response.data.tx.hash;
    }

    async getUtxos() {
        const response = await axios.get(`${this.apiEndpoint}/addrs/${this.address}`);
        const txUrl = response.data.tx_url;
        const txResponse = await axios.get(txUrl);
        return txResponse.data.filter(tx => tx.addresses.includes(this.address) && !tx.spent);
    }

    async getTransactions() {
        const response = await axios.get(`${this.apiEndpoint}/addrs/${this.address}`);
        const txUrl = response.data.tx_url;
        const txResponse = await axios.get(txUrl);
        return txResponse.data.filter(tx => tx.addresses.includes(this.address));
    }

    async deposit(amount) {
        try {
            const coins = await getCoinsFromRedis();
            if (!Array.isArray(coins)) {
                throw new Error('Expected coins to be an array');
            }
            const btcCoin = coins.find(coin => coin.symbol === "BTC");
            if (!btcCoin) {
                throw new Error('BTC coin not found in coins array');
            }
            this.coinId = btcCoin.id;
            await this.db.query('UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2 AND coin_id = $3', [amount, this.userId, this.coinId]);
            await this.db.query('INSERT INTO transactions (user_id, coin_id, amount, type, timestamp) VALUES ($1, $2, $3, $4, $5)', [this.userId, this.coinId, amount, 'deposit', new Date()]);
        } catch (error) {
            console.error('Error in deposit method:', error);
            throw error;
        }
    }
}

export default BitcoinWallet;