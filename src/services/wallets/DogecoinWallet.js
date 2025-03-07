// DogecoinWallet.js
import bitcoin from 'bitcoinjs-lib';
import axios from 'axios';
import WalletBase from './WalletBase.js';
import { randomBytes } from 'crypto';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { pgPool } from '../../database/db.js';
import { getCoinsFromRedis } from '../../database/dbContext.js';

class DogecoinWallet extends WalletBase {
    constructor(network = {
        messagePrefix: '\x19Dogecoin Signed Message:\n',
        bech32: 'doge',
        bip32: {
            public: 0x02facafd,
            private: 0x02fac398,
        },
        pubKeyHash: 0x1e,
        scriptHash: 0x16,
        wif: 0x9e,
    }, userId) {
        super();
        const ECPair = ECPairFactory(ecc);
        const rng = (size) => randomBytes(size);
        this.keyPair = ECPair.makeRandom({ rng, network });
        this.address = bitcoin.payments.p2pkh({ pubkey: Buffer.from(ECPair.fromPrivateKey(this.keyPair.privateKey, { network }).publicKey.buffer), network }).address;
        this.apiEndpoint = 'https://api.blockcypher.com/v1/doge/main';
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

        // Учитываем минимальную комиссию (1 DOGE)
        const fee = 100000000; // 1 DOGE в сатоши
        if (totalAmount < amount + fee) {
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
        const response = await axios.post(`${this.apiEndpoint}/txs/send`, { tx: rawTransaction });
        return response.data.tx.hash;
    }

    async getTransactions() {
        const response = await axios.get(`${this.apiEndpoint}/addrs/${this.address}/full`);
        return response.data.txs || [];
    }

    async getUtxos() {
        const response = await axios.get(`${this.apiEndpoint}/addrs/${this.address}/full`);
        return response.data.txs.flatMap(tx =>
            tx.outputs
                .filter(output => output.addresses.includes(this.address))
                .map(output => ({
                    txid: tx.hash,
                    vout: output.output_index,
                    value: output.value,
                    script: output.script,
                }))
        );
    }

    async deposit(amount) {
        try {
            const coins = await getCoinsFromRedis();
            if (!Array.isArray(coins)) {
                throw new Error('Expected coins to be an array');
            }
            const dogeCoin = coins.find(coin => coin.symbol === "DOGE");
            if (!dogeCoin) {
                throw new Error('DOGE coin not found in coins array');
            }
            this.coinId = dogeCoin.id;
            await this.db.query('UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2 AND coin_id = $3', [amount, this.userId, this.coinId]);
            await this.db.query('INSERT INTO transactions (user_id, coin_id, amount, type, timestamp) VALUES ($1, $2, $3, $4, $5)', [this.userId, this.coinId, amount, 'deposit', new Date()]);
        } catch (error) {
            console.error('Error in deposit method:', error);
            throw error;
        }
    }
}

export default DogecoinWallet;
