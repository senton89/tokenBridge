import axios from 'axios';
import { pgPool } from '../database/db.js';

// Update exchange rates from external API
export async function updateDataFromApi() {
    try {
        console.log('Updating exchange rates from API...');

        // Get all coins from database
        const coinsResult = await pgPool.query('SELECT * FROM coins');
        const coins = coinsResult.rows;

        // Fetch current rates from CoinGecko or similar API
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: coins.map(coin => coin.coingecko_id).join(','),
                vs_currencies: 'usd'
            }
        });

        const rates = response.data;

        // Update rates in database
        for (const coin of coins) {
            if (rates[coin.coingecko_id]) {
                const usdRate = rates[coin.coingecko_id].usd;

                // Update or insert rate for each pair of coins
                for (const targetCoin of coins) {
                    if (coin.id !== targetCoin.id) {
                        const targetUsdRate = rates[targetCoin.coingecko_id]?.usd;

                        if (targetUsdRate) {
                            const exchangeRate = usdRate / targetUsdRate;

                            // Upsert exchange rate
                            await pgPool.query(
                                `INSERT INTO exchange_rates (from_coin_id, to_coin_id, rate, last_updated)
                 VALUES ($1, $2, $3, NOW())
                 ON CONFLICT (from_coin_id, to_coin_id)
                 DO UPDATE SET rate = $3, last_updated = NOW()`,
                                [coin.id, targetCoin.id, exchangeRate]
                            );
                        }
                    }
                }
            }
        }

        console.log('Exchange rates updated successfully');
    } catch (error) {
        console.error('Error updating exchange rates:', error);
    }
}

// Schedule regular updates (e.g., every hour)
export function scheduleRateUpdates() {
    // Update immediately on startup
    updateDataFromApi();

    // Then update every hour
    setInterval(updateDataFromApi, 60 * 60 * 1000);
}