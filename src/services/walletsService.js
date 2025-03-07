import { pgPool } from "../database/db.js";
import { getCoinsFromRedis } from '../database/dbContext.js';
import * as bitcoin from 'bitcoinjs-lib';
import Web3 from 'web3';
import TonWeb from 'tonweb';
import { Keypair } from '@solana/web3.js';
import TronWeb from 'tronweb';
import * as dogecoin from 'dogecoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { randomBytes } from 'crypto';
import ECPairFactory from 'ecpair';

// Функция для создания кошельков
async function createWallets(userId) {
    if (!userId) {
        throw new Error('Пользователь не найден');
    }
    const wallets = {};

    // TON
    const tonWeb = new TonWeb();
    const tonKeyPair = tonWeb.utils.newKeyPair();
    wallets.TON = {
        address: tonWeb.utils.Address.toString(tonKeyPair.publicKey),
        privateKey: tonKeyPair.secretKey,
    };

    // Tether (USDT) на блокчейне TON
    const usdtTonKeyPair = tonWeb.utils.newKeyPair();
    wallets.USDT = {
        address: tonWeb.utils.Address.toString(usdtTonKeyPair.publicKey),
        privateKey: usdtTonKeyPair.secretKey,
    };

    // NOT на блокчейне TON
    const notTonKeyPair = tonWeb.utils.newKeyPair();
    wallets.NOT = {
        address: tonWeb.utils.Address.toString(notTonKeyPair.publicKey),
        privateKey: notTonKeyPair.secretKey,
    };

    // Bitcoin (BTC)
    const ECPair = ECPairFactory(ecc);
    const rng = (size) => randomBytes(size);
    const keyPair = ECPair.makeRandom({ rng });
    const { address } = bitcoin.payments.p2pkh({ pubkey: Buffer.from(keyPair.publicKey) });
    wallets.BTC = {
        address: address,
        privateKey: keyPair.toWIF(),
    };

    // Ethereum (ETH)
    const web3 = new Web3();
    const ethAccount = web3.eth.accounts.create();
    wallets.ETH = {
        address: ethAccount.address,
        privateKey: ethAccount.privateKey,
    };

    // Solana (SOL)
    const solanaKeyPair = Keypair.generate();
    wallets.SOL = {
        address: solanaKeyPair.publicKey.toString(),
        privateKey: solanaKeyPair.secretKey.toString('base64'),
    };

    // Tron (TRX)
    const tronWeb = new TronWeb.utils.accounts.generateAccount();
    wallets.TRX = {
        address: tronWeb.address.base58,
        privateKey: tronWeb.privateKey,
    };

    // Dogecoin (DOGE)
    const dogeKeyPair = await dogecoin.generateKeyPair();
    const dogeAddress = await dogecoin.generateAddress(dogeKeyPair.publicKey);
    wallets.DOGE = {
        address: dogeAddress,
        privateKey: dogeKeyPair.privateKey,
    };

    const coins = getCoinsFromRedis();

    const queries = Object.keys(wallets).map((coin) => {
        const query = `
            INSERT INTO user_balances (user_id, coin_id, balance)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [userId, coins.find(c => c.symbol === coin), 0];
        return pgPool.query(query, values);
    });

    try {
        const results = await Promise.all(queries);
        console.log(results);
    } catch (error) {
        console.error(`Ошибка при создании кошельков: ${error}`);
        throw error;
    }

    return wallets;
}

export { createWallets };