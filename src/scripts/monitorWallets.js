// scripts/monitorWallets.js
import walletManager from '../services/WalletManager.js';
import { pgPool } from '../database/db.js';

export async function monitorWallets() {
    try {
        console.log('Starting wallet monitoring...');

        // Check for deposits
        await walletManager.monitorDeposits();

        // Clean up old inactive wallets (older than 30 days)
        const cleanupResult = await pgPool.query(
            "UPDATE user_temp_wallets SET active = false WHERE active = true AND created_at < NOW() - INTERVAL '30 days'"
        );

        if (cleanupResult.rowCount > 0) {
            console.log(`Cleaned up ${cleanupResult.rowCount} old temporary wallets`);
        }

        console.log('Wallet monitoring completed');
    } catch (error) {
        console.error('Error in wallet monitoring:', error);
    } finally {
        // Close database connection if needed
        // await pgPool.end();
    }
}

// For direct execution
if (process.argv[1] === new URL(import.meta.url).pathname) {
    monitorWallets();
}