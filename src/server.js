import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import exchangeController from './controllers/exchangeController.js';
import { updateDataFromApi, startUpdateInterval } from './controllers/rateService.js';
import { pgPool, redisClient } from './database/db.js';
import walletRoutes from "./controllers/walletRoutes.js";
import p2pController from "./controllers/p2pController.js";
import { monitorWallets } from './scripts/monitorWallets.js';

configDotenv();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', exchangeController);
app.use('/api', walletRoutes);
app.use('/api', p2pController);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Initialize connections and start server
async function startServer() {
    try {
        // Test database connection
        await pgPool.query('SELECT NOW()');
        console.log('PostgreSQL connected');

        // Test Redis connection
        await redisClient.ping();
        console.log('Redis connected');

        // Start server
        app.listen(PORT, async () => {
            console.log(`Server running on port ${PORT}`);

            // Initialize exchange rates
            await updateDataFromApi();
            console.log('Exchange rates updated');

            // Start monitoring wallets for deposits
            // setInterval(monitorWallets, 2 * 60 * 1000); // Every 2 minutes
            // console.log('Wallet monitoring started');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();