import { pgPool } from "../database/db.js";
import { getCoinsFromRedis } from '../database/dbContext.js';
import bitcoin from 'bitcoinjs-lib';
import bip39 from 'bip39';
import Web3 from 'web3';
import TonWeb from 'tonweb';
import { Connection, Keypair } from '@solana/web3.js';
import TronWeb from 'tronweb';
import * as dogecoin from 'dogecoinjs-lib';

// Функция для создания кошельков
async function createWallets(userId) {
    const wallets = {};

    const mnemonic = bip39.generateMnemonic();
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = bitcoin.bip32.fromSeed(seed);

// Bitcoin (BTC)
    const btcPath = "m/44'/0'/0'/0/0";
    const btcChild = root.derivePath(btcPath);
    const { address } = bitcoin.payments.p2pkh({ pubkey: btcChild.publicKey });
    wallets.BTC = {
        address: address,
        privateKey: btcChild.toWIF(),
    };

// Ethereum (ETH)
    const ethPath = "m/44'/60'/0'/0/0";
    const ethChild = root.derivePath(ethPath);
    const ethAccount = new Web3.eth.accounts.privateKeyToAccount(ethChild.toWIF());
    wallets.ETH = {
        address: ethAccount.address,
        privateKey: ethAccount.privateKey,
    };

// Solana (SOL)
    const solanaPath = "m/44'/501'/0'/0/0";
    const solanaChild = root.derivePath(solanaPath);
    const solanaKeyPair = Keypair.fromSecretKey(solanaChild.toWIF());
    wallets.SOL = {
        address: solanaKeyPair.publicKey.toString(),
        privateKey: solanaKeyPair.secretKey.toString('base64'),
    };

// Tron (TRX)
    const tronPath = "m/44'/195'/0'/0/0";
    const tronChild = root.derivePath(tronPath);
    const tronWeb = new TronWeb();
    const tronAccount = await tronWeb.createAccount();
    wallets.TRX = {
        address: tronAccount.address,
        privateKey: tronAccount.privateKey,
    };

// Dogecoin (DOGE)
    const dogePath = "m/44'/3'/0'/0/0";
    const dogeChild = root.derivePath(dogePath);
    wallets.DOGE = {
        address: dogecoin.payments.p2pkh({ pubkey: dogeChild.publicKey }).address,
        privateKey: dogeChild.toWIF(),
    };

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
}

export { createWallets };