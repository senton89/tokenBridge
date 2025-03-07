import * as bitcoin from 'bitcoinjs-lib';
import Web3 from 'web3';
import TonWeb from 'tonweb';
import { Keypair } from '@solana/web3.js';
import TronWeb from 'tronweb';
import * as dogecoin from 'dogecoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';

// Функция для создания транзакции на блокчейне TON
async function createTonTransaction(wallet, recipientAddress, amount) {
    const tonWeb = new TonWeb();
    const keyPair = tonWeb.utils.keyPairFromSecretKey(wallet.privateKey);
    const transaction = await tonWeb.sendTransaction({
        to: recipientAddress,
        amount: amount,
        keyPair: keyPair,
    });
    return transaction;
}

// Функция для создания транзакции на блокчейне Ethereum
async function createEthereumTransaction(wallet, recipientAddress, amount) {
    const web3 = new Web3();
    const transaction = {
        from: wallet.address,
        to: recipientAddress,
        value: web3.utils.toWei(amount.toString(), 'ether'),
        gas: '20000',
        gasPrice: web3.utils.toWei('20', 'gwei'),
    };
    const signedTransaction = await web3.eth.accounts.signTransaction(transaction, wallet.privateKey);
    const txHash = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    return txHash;
}

// Функция для создания транзакции на блокчейне Solana
async function createSolanaTransaction(wallet, recipientAddress, amount) {
    const solanaKeyPair = Keypair.fromSecretKey(Buffer.from(wallet.privateKey, 'base64'));
    const transaction = await solanaKeyPair.sendTransaction({
        toPubkey: recipientAddress,
        lamports: amount * 1e9,
    });
    return transaction;
}

// Функция для создания транзакции на блокчейне Tron
async function createTronTransaction(wallet, recipientAddress, amount) {
    const tronWeb = new TronWeb();
    const transaction = await tronWeb.transactionBuilder.sendTrx({
        to: recipientAddress,
        amount: amount,
        privateKey: wallet.privateKey,
    });
    return transaction;
}

// Функция для создания транзакции на блокчейне Bitcoin
async function createBitcoinTransaction(wallet, recipientAddress, amount) {
    const ECPair = ECPairFactory(ecc);
    const keyPair = ECPair.fromWIF(wallet.privateKey);
    const transaction = await bitcoin.payments.p2pkh({
        pubkey: Buffer.from(keyPair.publicKey),
        amount: amount,
    });
    const signedTransaction = await bitcoin.Transaction.buildTransaction({
        inputs: [],
        outputs: [transaction],
        locktime: 0,
    });
    return signedTransaction;
}

// Функция для создания транзакции на блокчейне Dogecoin
async function createDogecoinTransaction(wallet, recipientAddress, amount) {
    const dogeKeyPair = await dogecoin.generateKeyPair();
    const transaction = await dogecoin.generateTransaction({
        from: wallet.address,
        to: recipientAddress,
        amount: amount,
    });
    const signedTransaction = await dogecoin.signTransaction(transaction, dogeKeyPair);
    return signedTransaction;
}

export {
    createTonTransaction,
    createEthereumTransaction,
    createSolanaTransaction,
    createTronTransaction,
    createBitcoinTransaction,
    createDogecoinTransaction,
};