# Implementing Temporary Wallet System for Deposits and Withdrawals

Based on your code, I'll create a solution for handling deposits and withdrawals through temporary wallets. This approach will:

1. Create temporary wallets for users
2. Monitor deposits to temporary wallets
3. Automatically transfer funds to a central wallet upon deposit
4. Handle withdrawals by transferring from central wallet to temporary wallet, then to user's external wallet

## 1. First, let's create a WalletManager service:

```javascript
// services/walletManager.js
import BitcoinWallet from './wallets/BitcoinWallet.js';
import DogecoinWallet from './wallets/DogecoinWallet.js';
import EthereumWallet from './wallets/EthereumWallet.js';
import NotWallet from './wallets/NotWallet.js';
import SolanaWallet from './wallets/SolanaWallet.js';
import TetherTonWallet from './wallets/TetherTonWallet.js';
import TonWallet from './wallets/TonWallet.js';
import { pgPool, redisClient } from '../database/db.js';
import { addTransaction } from '../database/dbContext.js';

class WalletManager {
  constructor() {
    // Central wallets (company wallets)
    this.centralWallets = {
      BTC: null,
      DOGE: null,
      ETH: null,
      NOT: null,
      SOL: null,
      USDT: null,
      TON: null
    };
    
    // Initialize central wallets
    this.initCentralWallets();
    
    // Map to store temporary user wallets
    this.temporaryWallets = new Map();
  }
  
  async initCentralWallets() {
    try {
      // Load central wallet keys from database or environment variables
      const centralWalletConfig = await pgPool.query('SELECT * FROM central_wallets');
      
      // Initialize each central wallet with stored keys
      for (const wallet of centralWalletConfig.rows) {
        switch (wallet.symbol) {
          case 'BTC':
            this.centralWallets.BTC = new BitcoinWallet(null, 0, wallet.private_key);
            break;
          case 'DOGE':
            this.centralWallets.DOGE = new DogecoinWallet(null, 0, wallet.private_key);
            break;
          case 'ETH':
            this.centralWallets.ETH = new EthereumWallet('mainnet', 0, wallet.private_key);
            break;
          case 'NOT':
            this.centralWallets.NOT = new NotWallet(0, wallet.private_key);
            break;
          case 'SOL':
            this.centralWallets.SOL = new SolanaWallet(0, wallet.private_key);
            break;
          case 'USDT':
            this.centralWallets.USDT = new TetherTonWallet(0, wallet.private_key);
            break;
          case 'TON':
            this.centralWallets.TON = new TonWallet(0, wallet.private_key);
            break;
        }
      }
      
      console.log('Central wallets initialized successfully');
    } catch (error) {
      console.error('Failed to initialize central wallets:', error);
    }
  }
  
  async createTemporaryWallet(userId, coinSymbol) {
    try {
      let wallet;
      
      switch (coinSymbol) {
        case 'BTC':
          wallet = new BitcoinWallet(null, userId);
          break;
        case 'DOGE':
          wallet = new DogecoinWallet(null, userId);
          break;
        case 'ETH':
          wallet = new EthereumWallet('mainnet', userId);
          break;
        case 'NOT':
          wallet = new NotWallet(userId);
          break;
        case 'SOL':
          wallet = new SolanaWallet(userId);
          break;
        case 'USDT':
          wallet = new TetherTonWallet(userId);
          break;
        case 'TON':
          wallet = new TonWallet(userId);
          break;
        default:
          throw new Error(`Unsupported coin: ${coinSymbol}`);
      }
      
      const address = await wallet.getAddress();
      
      // Store wallet in memory
      const walletKey = `${userId}:${coinSymbol}`;
      this.temporaryWallets.set(walletKey, wallet);
      
      // Store wallet address in Redis for persistence
      await redisClient.set(`temp_wallet:${walletKey}`, JSON.stringify({
        address,
        userId,
        coinSymbol,
        createdAt: new Date().toISOString()
      }), 'EX', 86400); // 24 hours expiry
      
      // Store in database for long-term reference
      await pgPool.query(
        'INSERT INTO user_temp_wallets (user_id, coin_symbol, address, created_at) VALUES ($1, $2, $3, $4)',
        [userId, coinSymbol, address, new Date()]
      );
      
      return { address, wallet };
    } catch (error) {
      console.error(`Error creating temporary ${coinSymbol} wallet:`, error);
      throw error;
    }
  }
  
  async getTemporaryWallet(userId, coinSymbol) {
    const walletKey = `${userId}:${coinSymbol}`;
    
    // Check if wallet exists in memory
    if (this.temporaryWallets.has(walletKey)) {
      return this.temporaryWallets.get(walletKey);
    }
    
    // Check if wallet exists in Redis
    const walletData = await redisClient.get(`temp_wallet:${walletKey}`);
    if (walletData) {
      // Recreate wallet instance
      return await this.createTemporaryWallet(userId, coinSymbol);
    }
    
    // Create new wallet if it doesn't exist
    return (await this.createTemporaryWallet(userId, coinSymbol)).wallet;
  }
  
  async monitorDeposits() {
    console.log('Starting deposit monitoring service...');
    
    // Get all temporary wallets from database
    const tempWallets = await pgPool.query('SELECT * FROM user_temp_wallets WHERE active = true');
    
    for (const walletData of tempWallets.rows) {
      const { user_id, coin_symbol, address } = walletData;
      
      try {
        // Recreate wallet instance
        const wallet = await this.getTemporaryWallet(user_id, coin_symbol);
        
        // Get current balance
        const balance = await wallet.getBalance();
        
        // If balance > 0, transfer to central wallet
        if (balance > 0) {
          console.log(`Detected deposit of ${balance} ${coin_symbol} to temporary wallet for user ${user_id}`);
          
          // Get central wallet address
          const centralWalletAddress = await this.centralWallets[coin_symbol].getAddress();
          
          // Transfer to central wallet (minus network fee)
          const networkFee = this.calculateNetworkFee(coin_symbol, balance);
          const transferAmount = balance - networkFee;
          
          if (transferAmount > 0) {
            const txHash = await wallet.withdraw(centralWalletAddress, transferAmount);
            
            // Credit user's account in database
            await wallet.deposit(transferAmount);
            
            // Record transaction
            await addTransaction(user_id, wallet.coinId, transferAmount, 'deposit', txHash);
            
            console.log(`Successfully transferred ${transferAmount} ${coin_symbol} to central wallet. Transaction: ${txHash}`);
          }
        }
      } catch (error) {
        console.error(`Error monitoring deposits for ${coin_symbol} wallet ${address}:`, error);
      }
    }
  }
  
  calculateNetworkFee(coinSymbol, amount) {
    // Simplified fee calculation - in production, use dynamic fee estimation
    const feeRates = {
      BTC: 0.0001,
      DOGE: 1,
      ETH: 0.002,
      NOT: 0.1,
      SOL: 0.00001,
      USDT: 1,
      TON: 0.05
    };
    
    return feeRates[coinSymbol] || 0;
  }
  
  async processWithdrawal(userId, coinSymbol, amount, destinationAddress) {
    try {
      // Validate user has sufficient balance
      const userBalanceResult = await pgPool.query(
        'SELECT ub.balance, c.id FROM user_balances ub JOIN coins c ON ub.coin_id = c.id WHERE ub.user_id = $1 AND c.symbol = $2',
        [userId, coinSymbol]
      );
      
      if (userBalanceResult.rows.length === 0 || userBalanceResult.rows[0].balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      const coinId = userBalanceResult.rows[0].id;
      
      // Calculate withdrawal fee
      const withdrawalFee = this.calculateWithdrawalFee(coinSymbol, amount);
      const amountToSend = amount - withdrawalFee;
      
      if (amountToSend <= 0) {
        throw new Error('Amount after fee is too small');
      }
      
      // Get central wallet
      const centralWallet = this.centralWallets[coinSymbol];
      if (!centralWallet) {
        throw new Error(`Central wallet for ${coinSymbol} not found`);
      }
      
      // Send directly from central wallet to destination address
      const txHash = await centralWallet.withdraw(destinationAddress, amountToSend);
      
      // Update user balance
      await pgPool.query(
        'UPDATE user_balances SET balance = balance - $1 WHERE user_id = $2 AND coin_id = $3',
        [amount, userId, coinId]
      );
      
      // Record transaction
      await addTransaction(userId, coinId, amount, 'withdrawal', txHash);
      
      return {
        success: true,
        txHash,
        amount: amountToSend,
        fee: withdrawalFee
      };
    } catch (error) {
      console.error(`Error processing withdrawal for user ${userId}:`, error);
      throw error;
    }
  }
  
  calculateWithdrawalFee(coinSymbol, amount) {
    // Simplified fee calculation - in production, use dynamic fee estimation
    const feeRates = {
      BTC: 0.0002,
      DOGE: 2,
      ETH: 0.003,
      NOT: 0.2,
      SOL: 0.00002,
      USDT: 1.5,
      TON: 0.1
    };
    
    return feeRates[coinSymbol] || 0;
  }
}

export default new WalletManager();
```

## 2. Now, let's modify the wallet classes to accept private keys:

For example, let's update the BitcoinWallet class:

```javascript
// services/wallets/BitcoinWallet.js
import bitcoin from 'bitcoinjs-lib';
import axios from 'axios';
import WalletBase from "./WalletBase.js";
import { randomBytes } from "crypto";
import ECPairFactory from "ecpair";
import * as ecc from 'tiny-secp256k1';
import { pgPool } from "../../database/db.js";
import { getCoinsFromRedis } from "../../database/dbContext.js";

class BitcoinWallet extends WalletBase {
  constructor(network = bitcoin.networks.bitcoin, userId, privateKeyHex = null) {
    super();
    const ECPair = ECPairFactory(ecc);
    
    if (privateKeyHex) {
      // Create wallet from existing private key
      const privateKey = Buffer.from(privateKeyHex, 'hex');
      this.keyPair = ECPair.fromPrivateKey(privateKey, { network });
    } else {
      // Create new random wallet
      const rng = (size) => randomBytes(size);
      this.keyPair = ECPair.makeRandom({rng});
    }
    
    this.network = network;
    this.address = bitcoin.payments.p2pkh({ 
      pubkey: Buffer.from(this.keyPair.publicKey.buffer), 
      network 
    }).address;
    this.apiEndpoint = "https://api.blockcypher.com/v1/btc/main";
    this.db = pgPool;
    this.userId = userId;
    this.coinId = null;
  }
  
  // Rest of the class remains the same
}

export default BitcoinWallet;
```

## 3. Create a database schema for temporary wallets:

```sql
CREATE TABLE central_wallets (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL UNIQUE,
  address VARCHAR(255) NOT NULL,
  private_key TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_temp_wallets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  coin_symbol VARCHAR(10) NOT NULL,
  address VARCHAR(255) NOT NULL,
  private_key TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_temp_wallets_user_coin ON user_temp_wallets(user_id, coin_symbol);
CREATE INDEX idx_user_temp_wallets_active ON user_temp_wallets(active);
```

## 4. Create a deposit monitoring service:

```javascript
// services/depositMonitor.js
import walletManager from './walletManager.js';

// Run deposit monitoring every minute
const MONITORING_INTERVAL = 60 * 1000; // 1 minute

async function startDepositMonitoring() {
  console.log('Starting deposit monitoring service...');
  
  // Initial run
  await walletManager.monitorDeposits();
  
  // Set up interval for continuous monitoring
  setInterval(async () => {
    try {
      await walletManager.monitorDeposits();
    } catch (error) {
      console.error('Error in deposit monitoring cycle:', error);
    }
  }, MONITORING_INTERVAL);
}

export default startDepositMonitoring;
```

## 5. Create API endpoints for deposits and withdrawals:

```javascript
// controllers/walletController.js
import express from 'express';
import walletManager from '../services/walletManager.js';
import { getUserById } from '../database/dbContext.js';

const router = express.Router();

// Get deposit address for a specific coin
router.get('/deposit/:coinSymbol', async (req, res) => {
  try {
    const { coinSymbol } = req.params;
    const userId = req.user.id; // Assuming authentication middleware sets req.user
    
    // Get or create temporary wallet
    const { address } = await walletManager.createTemporaryWallet(userId, coinSymbol.toUpperCase());
    
    res.json({
      success: true,
      address,
      coinSymbol: coinSymbol.toUpperCase()
    });
  } catch (error) {
    console.error('Error generating deposit address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate deposit address',
      error: error.message
    });
  }
});

// Process withdrawal request
router.post('/withdraw', async (req, res) => {
  try {
    const { coinSymbol, amount, address } = req.body;
    const userId = req.user.id; // Assuming authentication middleware sets req.user
    
    if (!coinSymbol || !amount || !address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }
    
    // Validate amount is a positive number
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }
    
    // Process withdrawal
    const result = await walletManager.processWithdrawal(
      userId, 
      coinSymbol.toUpperCase(), 
      numAmount, 
      address
    );
    
    res.json({
      success: true,
      txHash: result.txHash,
      amount: result.amount,
      fee: result.fee,
      status: 'processing'
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal',
      error: error.message
    });
  }
});

export default router;
```

## 6. Update your main server file to include the new routes and start the monitoring service:

```javascript
// server.js
import express from 'express';
import exchangeController from './controllers/exchangeController.js';
import walletController from './controllers/walletController.js';
import { updateDataFromApi } from './services/rateService.js';
import startDepositMonitoring from './services/depositMonitor.js';
import { configDotenv } from "dotenv";

configDotenv();

const app = express();
app.use(express.json());

// API routes
app.use('/api', exchangeController);
app.use('/api/wallet', walletController);

app.listen(3001, async () => {
  console.log('Server started on port 3001');
  
  // Start background services
  await updateDataFromApi();
  startDepositMonitoring();
});
```

## Implementation Notes:

1. **Security Considerations**:
   - In a production environment, you should encrypt private keys in the database
   - Consider using a Hardware Security Module (HSM) for central wallet keys
   - Implement rate limiting and IP blocking to prevent abuse

2. **Monitoring Improvements**:
   - Use webhooks where available instead of polling
   - Implement a more sophisticated monitoring system with retries and error handling
   - Add alerting for large deposits/withdrawals

3. **Transaction Handling**:
   - Add transaction confirmation monitoring
   - Implement a queue system for withdrawals to handle high load
   - Add admin approval for withdrawals above certain thresholds

4. **Database Considerations**:
   - Use database transactions to ensure data consistency
   - Add more detailed transaction logging
   - Implement an audit trail for all wallet operations

This implementation provides a solid foundation for a deposit/withdrawal system using temporary wallets as intermediaries. The system automatically forwards deposits to central wallets and processes withdrawals directly from central wallets to user-specified addresses.