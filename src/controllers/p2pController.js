// controllers/p2pController.js
import express from 'express';
import { pgPool } from '../database/db.js';
import { getUserById } from '../database/dbContext.js';

const router = express.Router();

// Get buy listings
router.post('/p2p/listings/buy', async (req, res) => {
    try {
        const { crypto, currency, paymentMethods, amount, userOnly } = req.body;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        let query = `
      SELECT 
        a.id, a.type, a.crypto, a.currency, a.price, a.available, 
        a.min_amount as "minAmount", a.max_amount as "maxAmount", 
        a.payment_methods as "paymentMethods", a.status,
        u.id as "userId", u.name as "userName", 
        COUNT(d.id) as "userDeals"
      FROM p2p_ads a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN p2p_deals d ON (d.buyer_id = u.id OR d.seller_id = u.id) AND d.status = 'completed'
      WHERE a.type = 'buy' AND a.status = 'active'
    `;

        const queryParams = [];
        let paramIndex = 1;

        // Add filters
        if (userOnly) {
            query += ` AND a.user_id = $${paramIndex}`;
            queryParams.push(userId);
            paramIndex++;
        }

        if (crypto) {
            query += ` AND a.crypto = $${paramIndex}`;
            queryParams.push(crypto);
            paramIndex++;
        }

        if (currency) {
            query += ` AND a.currency = $${paramIndex}`;
            queryParams.push(currency);
            paramIndex++;
        }

        if (paymentMethods && paymentMethods.length > 0) {
            query += ` AND a.payment_methods ?| $${paramIndex}`;
            queryParams.push(paymentMethods);
            paramIndex++;
        }

        if (amount) {
            query += ` AND a.min_amount <= $${paramIndex} AND (a.max_amount >= $${paramIndex} OR a.max_amount IS NULL)`;
            queryParams.push(amount);
            paramIndex++;
        }

        query += ` GROUP BY a.id, a.type, a.crypto, a.currency, a.price, a.available, a.min_amount, a.max_amount, a.payment_methods, a.status, u.id, u.name ORDER BY a.price DESC`;

        const result = await pgPool.query(query, queryParams);

        // Format the response
        const listings = result.rows.map(row => ({
            id: row.id,
            type: row.type,
            crypto: row.crypto,
            currency: row.currency,
            price: parseFloat(row.price),
            available: parseFloat(row.available),
            minAmount: row.minAmount ? parseFloat(row.minAmount) : null,
            maxAmount: row.maxAmount ? parseFloat(row.maxAmount) : null,
            paymentMethods: row.paymentMethods || [],
            user: {
                id: row.userId,
                name: row.userName,
                deals: parseInt(row.userDeals) || 0
            }
        }));

        res.json(listings);
    } catch (error) {
        console.error('Error fetching buy listings:', error);
        res.status(500).json({ error: 'Failed to fetch buy listings' });
    }
});

// Get sell listings
router.post('/p2p/listings/sell', async (req, res) => {
    try {
        const { crypto, currency, paymentMethods, amount, userOnly } = req.body;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        let query = `
      SELECT 
        a.id, a.type, a.crypto, a.currency, a.price, a.available, 
        a.min_amount as "minAmount", a.max_amount as "maxAmount", 
        a.payment_methods as "paymentMethods", a.status,
        u.id as "userId", u.name as "userName", 
        COUNT(d.id) as "userDeals"
      FROM p2p_ads a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN p2p_deals d ON (d.buyer_id = u.id OR d.seller_id = u.id) AND d.status = 'completed'
      WHERE a.type = 'sell' AND a.status = 'active'
    `;

        const queryParams = [];
        let paramIndex = 1;

        // Add filters
        if (userOnly) {
            query += ` AND a.user_id = $${paramIndex}`;
            queryParams.push(userId);
            paramIndex++;
        }

        if (crypto) {
            query += ` AND a.crypto = $${paramIndex}`;
            queryParams.push(crypto);
            paramIndex++;
        }

        if (currency) {
            query += ` AND a.currency = $${paramIndex}`;
            queryParams.push(currency);
            paramIndex++;
        }

        if (paymentMethods && paymentMethods.length > 0) {
            query += ` AND a.payment_methods ?| $${paramIndex}`;
            queryParams.push(paymentMethods);
            paramIndex++;
        }

        if (amount) {
            query += ` AND a.min_amount <= $${paramIndex} AND (a.max_amount >= $${paramIndex} OR a.max_amount IS NULL)`;
            queryParams.push(amount);
            paramIndex++;
        }

        query += ` GROUP BY a.id, a.type, a.crypto, a.currency, a.price, a.available, a.min_amount, a.max_amount, a.payment_methods, a.status, u.id, u.name ORDER BY a.price ASC`;

        const result = await pgPool.query(query, queryParams);

        // Format the response
        const listings = result.rows.map(row => ({
            id: row.id,
            type: row.type,
            crypto: row.crypto,
            currency: row.currency,
            price: parseFloat(row.price),
            available: parseFloat(row.available),
            minAmount: row.minAmount ? parseFloat(row.minAmount) : null,
            maxAmount: row.maxAmount ? parseFloat(row.maxAmount) : null,
            paymentMethods: row.paymentMethods || [],
            user: {
                id: row.userId,
                name: row.userName,
                deals: parseInt(row.userDeals) || 0
            }
        }));

        res.json(listings);
    } catch (error) {
        console.error('Error fetching sell listings:', error);
        res.status(500).json({ error: 'Failed to fetch sell listings' });
    }
});

// Get ad details
router.get('/p2p/ads/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
      SELECT 
        a.*, 
        u.name as "userName", 
        COUNT(d.id) as "userDeals"
      FROM p2p_ads a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN p2p_deals d ON (d.buyer_id = u.id OR d.seller_id = u.id) AND d.status = 'completed'
      WHERE a.id = $1
      GROUP BY a.id, u.id, u.name
    `;

        const result = await pgPool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ad not found' });
        }

        const ad = result.rows[0];

        res.json({
            id: ad.id,
            type: ad.type,
            crypto: ad.crypto,
            currency: ad.currency,
            price: parseFloat(ad.price),
            available: parseFloat(ad.available),
            minAmount: ad.min_amount ? parseFloat(ad.min_amount) : null,
            maxAmount: ad.max_amount ? parseFloat(ad.max_amount) : null,
            paymentMethods: ad.payment_methods || [],
            terms: ad.terms,
            instructions: ad.auto_reply,
            status: ad.status,
            user: {
                id: ad.user_id,
                name: ad.userName,
                deals: parseInt(ad.userDeals) || 0
            }
        });
    } catch (error) {
        console.error('Error fetching ad details:', error);
        res.status(500).json({ error: 'Failed to fetch ad details' });
    }
});

// Create ad
router.post('/p2p/ads', async (req, res) => {
    try {
        const {
            type,
            crypto,
            currency,
            price,
            pricePercent,
            available,
            minAmount,
            maxAmount,
            paymentMethods,
            roundAmount,
            paymentTime,
            terms,
            autoReply
        } = req.body;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        const query = `
      INSERT INTO p2p_ads (
        user_id, type, crypto, currency, price, price_percent, 
        available, min_amount, max_amount, payment_methods, 
        round_amount, payment_time, terms, auto_reply
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `;

        const values = [
            userId,
            type,
            crypto,
            currency,
            price,
            pricePercent,
            available,
            minAmount,
            maxAmount,
            JSON.stringify(paymentMethods),
            roundAmount || false,
            paymentTime || 15,
            terms,
            autoReply
        ];

        const result = await pgPool.query(query, values);

        res.json({
            id: result.rows[0].id,
            status: 'active',
            message: 'Ad created successfully'
        });
    } catch (error) {
        console.error('Error creating ad:', error);
        res.status(500).json({ error: 'Failed to create ad' });
    }
});

// Update ad
router.put('/p2p/ads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            type,
            crypto,
            currency,
            price,
            pricePercent,
            available,
            minAmount,
            maxAmount,
            paymentMethods,
            roundAmount,
            paymentTime,
            terms,
            autoReply
        } = req.body;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // Check if ad exists and belongs to user
        const checkQuery = `
      SELECT * FROM p2p_ads
      WHERE id = $1 AND user_id = $2
    `;
        const checkResult = await pgPool.query(checkQuery, [id, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Ad not found or not authorized' });
        }

        const query = `
      UPDATE p2p_ads
      SET 
        type = $1,
        crypto = $2,
        currency = $3,
        price = $4,
        price_percent = $5,
        available = $6,
        min_amount = $7,
        max_amount = $8,
        payment_methods = $9,
        round_amount = $10,
        payment_time = $11,
        terms = $12,
        auto_reply = $13
      WHERE id = $14 AND user_id = $15
      RETURNING id
    `;

        const values = [
            type,
            crypto,
            currency,
            price,
            pricePercent,
            available,
            minAmount,
            maxAmount,
            JSON.stringify(paymentMethods),
            roundAmount || false,
            paymentTime || 15,
            terms,
            autoReply,
            id,
            userId
        ];

        const result = await pgPool.query(query, values);

        res.json({
            id: result.rows[0].id,
            status: 'active',
            message: 'Ad updated successfully'
        });
    } catch (error) {
        console.error('Error updating ad:', error);
        res.status(500).json({ error: 'Failed to update ad' });
    }
});

// Delete ad
router.delete('/p2p/ads/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // Check if ad exists and belongs to user
        const checkQuery = `
      SELECT * FROM p2p_ads
      WHERE id = $1 AND user_id = $2
    `;
        const checkResult = await pgPool.query(checkQuery, [id, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Ad not found or not authorized' });
        }

        const query = `
      DELETE FROM p2p_ads
      WHERE id = $1 AND user_id = $2
    `;

        await pgPool.query(query, [id, userId]);

        res.json({
            message: 'Ad deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting ad:', error);
        res.status(500).json({ error: 'Failed to delete ad' });
    }
});

// Update ad status
router.put('/p2p/ads/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // Check if ad exists and belongs to user
        const checkQuery = `
      SELECT * FROM p2p_ads
      WHERE id = $1 AND user_id = $2
    `;
        const checkResult = await pgPool.query(checkQuery, [id, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Ad not found or not authorized' });
        }

        // Validate status
        if (status !== 'active' && status !== 'inactive') {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const query = `
      UPDATE p2p_ads
      SET status = $1
      WHERE id = $2 AND user_id = $3
      RETURNING id, status
    `;

        const result = await pgPool.query(query, [status, id, userId]);

        res.json({
            id: result.rows[0].id,
            status: result.rows[0].status,
            message: 'Ad status updated successfully'
        });
    } catch (error) {
        console.error('Error updating ad status:', error);
        res.status(500).json({ error: 'Failed to update ad status' });
    }
});

// Get user deals
router.get('/p2p/deals', async (req, res) => {
    try {
        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        const query = `
      SELECT 
        d.id, d.status, d.crypto, d.amount, d.price, d.total_price as "totalPrice",
        d.currency, d.payment_method as "paymentMethod", d.created_at as "date",
        d.time_limit as "timeLimit", d.cancellation_reason as "cancellationReason",
        CASE 
          WHEN d.buyer_id = $1 THEN 'buy'
          ELSE 'sell'
        END as type,
        CASE 
          WHEN d.buyer_id = $1 THEN s.name
          ELSE b.name
        END as "counterpartyName",
        CASE 
          WHEN d.buyer_id = $1 THEN s.id
          ELSE b.id
        END as "counterpartyId"
      FROM p2p_deals d
      JOIN users b ON d.buyer_id = b.id
      JOIN users s ON d.seller_id = s.id
      WHERE d.buyer_id = $1 OR d.seller_id = $1
      ORDER BY d.created_at DESC
    `;

        const result = await pgPool.query(query, [userId]);

        // Format the response
        const deals = result.rows.map(row => ({
            id: row.id,
            status: row.status,
            type: row.type,
            crypto: row.crypto,
            amount: parseFloat(row.amount),
            price: parseFloat(row.price),
            totalPrice: parseFloat(row.totalPrice),
            currency: row.currency,
            paymentMethod: row.paymentMethod,
            date: row.date,
            timeLimit: row.timeLimit,
            cancellationReason: row.cancellationReason,
            counterparty: {
                id: row.counterpartyId,
                name: row.counterpartyName,
                deals: 0 // This would be calculated in a real app
            }
        }));

        res.json(deals);
    } catch (error) {
        console.error('Error fetching user deals:', error);
        res.status(500).json({ error: 'Failed to fetch user deals' });
    }
});

// Get deal details
router.get('/p2p/deals/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        const query = `
      SELECT 
        d.*, 
        CASE 
          WHEN d.buyer_id = $1 THEN 'buy'
          ELSE 'sell'
        END as type,
        CASE 
          WHEN d.buyer_id = $1 THEN s.name
          ELSE b.name
        END as "counterpartyName",
        CASE 
          WHEN d.buyer_id = $1 THEN s.id
          ELSE b.id
        END as "counterpartyId"
      FROM p2p_deals d
      JOIN users b ON d.buyer_id = b.id
      JOIN users s ON d.seller_id = s.id
      WHERE d.id = $2 AND (d.buyer_id = $1 OR d.seller_id = $1)
    `;

        const result = await pgPool.query(query, [userId, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Deal not found or not authorized' });
        }

        const deal = result.rows[0];

        res.json({
            id: deal.id,
            status: deal.status,
            type: deal.type,
            crypto: deal.crypto,
            amount: parseFloat(deal.amount),
            price: parseFloat(deal.price),
            totalPrice: parseFloat(deal.total_price),
            currency: deal.currency,
            paymentMethod: deal.payment_method,
            date: deal.created_at,
            timeLimit: deal.time_limit,
            paymentConfirmed: deal.payment_confirmed,
            cancellationReason: deal.cancellation_reason,
            conditions: deal.conditions,
            counterparty: {
                id: deal.counterpartyId,
                name: deal.counterpartyName,
                deals: 0 // This would be calculated in a real app
            }
        });
    } catch (error) {
        console.error('Error fetching deal details:', error);
        res.status(500).json({ error: 'Failed to fetch deal details' });
    }
});

// Create deal
router.post('/p2p/deals', async (req, res) => {
    try {
        const { adId, amount, totalPrice, paymentMethod } = req.body;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // Get ad details
        const adQuery = `
      SELECT * FROM p2p_ads
      WHERE id = $1
    `;
        const adResult = await pgPool.query(adQuery, [adId]);

        if (adResult.rows.length === 0) {
            return res.status(404).json({ error: 'Ad not found' });
        }

        const ad = adResult.rows[0];

        // Determine buyer and seller
        let buyerId, sellerId;
        if (ad.type === 'buy') {
            buyerId = ad.user_id;
            sellerId = userId;
        } else {
            buyerId = userId;
            sellerId = ad.user_id;
        }

        // Validate amount
        if (parseFloat(amount) > parseFloat(ad.available)) {
            return res.status(400).json({ error: 'Amount exceeds available' });
        }

        if (ad.min_amount && parseFloat(amount) < parseFloat(ad.min_amount)) {
            return res.status(400).json({ error: `Minimum amount is ${ad.min_amount}` });
        }

        if (ad.max_amount && parseFloat(amount) > parseFloat(ad.max_amount)) {
            return res.status(400).json({ error: `Maximum amount is ${ad.max_amount}` });
        }

        // Create deal
        const dealQuery = `
      INSERT INTO p2p_deals (
        ad_id, buyer_id, seller_id, crypto, amount, price, 
        total_price, currency, payment_method, time_limit
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;

        const dealValues = [
            adId,
            buyerId,
            sellerId,
            ad.crypto,
            amount,
            ad.price,
            totalPrice,
            ad.currency,
            paymentMethod,
            ad.payment_time || 15
        ];

        const dealResult = await pgPool.query(dealQuery, dealValues);

        // Update ad available amount
        const updateAdQuery = `
      UPDATE p2p_ads
      SET available = available - $1
      WHERE id = $2
    `;
        await pgPool.query(updateAdQuery, [amount, adId]);

        res.json({
            id: dealResult.rows[0].id,
            status: 'active',
            message: 'Deal created successfully'
        });
    } catch (error) {
        console.error('Error creating deal:', error);
        res.status(500).json({ error: 'Failed to create deal' });
    }
});

// Confirm payment
router.put('/p2p/deals/:id/confirm-payment', async (req, res) => {
    try {
        const { id } = req.params;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // Check if deal exists and user is the buyer
        const checkQuery = `
      SELECT * FROM p2p_deals
      WHERE id = $1 AND buyer_id = $2 AND status = 'active'
    `;
        const checkResult = await pgPool.query(checkQuery, [id, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Deal not found, not authorized, or not active' });
        }

        // Update deal
        const query = `
      UPDATE p2p_deals
      SET payment_confirmed = true
      WHERE id = $1
      RETURNING id
    `;

        await pgPool.query(query, [id]);

        res.json({
            id,
            message: 'Payment confirmed successfully'
        });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
});

// Release crypto
router.put('/p2p/deals/:id/release', async (req, res) => {
    try {
        const { id } = req.params;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // Check if deal exists and user is the seller
        const checkQuery = `
      SELECT d.*, c.id as coin_id
      FROM p2p_deals d
      JOIN coins c ON d.crypto = c.symbol
      WHERE d.id = $1 AND d.seller_id = $2 AND d.status = 'active'
    `;
        const checkResult = await pgPool.query(checkQuery, [id, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Deal not found, not authorized, or not active' });
        }

        const deal = checkResult.rows[0];

        // Start a transaction
        const client = await pgPool.connect();
        try {
            await client.query('BEGIN');

            // Update deal status
            const updateDealQuery = `
        UPDATE p2p_deals
        SET status = 'completed', completed_at = NOW()
        WHERE id = $1
        RETURNING id
      `;
            await client.query(updateDealQuery, [id]);

            // Update buyer's balance
            const buyerBalanceQuery = `
        SELECT * FROM user_balances
        WHERE user_id = $1 AND coin_id = $2
      `;
            const buyerBalanceResult = await client.query(buyerBalanceQuery, [deal.buyer_id, deal.coin_id]);

            if (buyerBalanceResult.rows.length > 0) {
                // Update existing balance
                const updateBalanceQuery = `
          UPDATE user_balances
          SET balance = balance + $1
          WHERE user_id = $2 AND coin_id = $3
        `;
                await client.query(updateBalanceQuery, [deal.amount, deal.buyer_id, deal.coin_id]);
            } else {
                // Create new balance record
                const insertBalanceQuery = `
          INSERT INTO user_balances (user_id, coin_id, balance)
          VALUES ($1, $2, $3)
        `;
                await client.query(insertBalanceQuery, [deal.buyer_id, deal.coin_id, deal.amount]);
            }

            // Add transaction record
            const addTransactionQuery = `
        INSERT INTO transactions (user_id, coin_id, amount, type)
        VALUES ($1, $2, $3, $4)
      `;
            await client.query(addTransactionQuery, [deal.buyer_id, deal.coin_id, deal.amount, 'p2p_purchase']);

            await client.query('COMMIT');

            res.json({
                id,
                message: 'Crypto released successfully'
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error releasing crypto:', error);
        res.status(500).json({ error: 'Failed to release crypto' });
    }
});

// Cancel deal
router.put('/p2p/deals/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // Check if deal exists and user is a participant
        const checkQuery = `
      SELECT d.*, a.available
      FROM p2p_deals d
      JOIN p2p_ads a ON d.ad_id = a.id
      WHERE d.id = $1 AND (d.buyer_id = $2 OR d.seller_id = $2) AND d.status = 'active'
    `;
        const checkResult = await pgPool.query(checkQuery, [id, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Deal not found, not authorized, or not active' });
        }

        const deal = checkResult.rows[0];

        // Start a transaction
        const client = await pgPool.connect();
        try {
            await client.query('BEGIN');

            // Update deal status
            const updateDealQuery = `
        UPDATE p2p_deals
        SET status = 'cancelled', cancellation_reason = $1
        WHERE id = $2
        RETURNING id
      `;
            await client.query(updateDealQuery, [reason, id]);

            // Return amount to ad
            const updateAdQuery = `
        UPDATE p2p_ads
        SET available = available + $1
        WHERE id = $2
      `;
            await client.query(updateAdQuery, [deal.amount, deal.ad_id]);

            await client.query('COMMIT');

            res.json({ id, message: 'Deal cancelled successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error cancelling deal:', error);
        res.status(500).json({ error: 'Failed to cancel deal' });
    }
});

// Create appeal
router.post('/p2p/deals/:id/appeal', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // Check if deal exists and user is a participant
        const checkQuery = `
      SELECT * FROM p2p_deals
      WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)
    `;
        const checkResult = await pgPool.query(checkQuery, [id, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Deal not found or not authorized' });
        }

        // In a real app, we would create an appeal record in the database
        // For now, we'll just simulate a successful appeal creation

        res.json({
            id,
            appealId: Date.now(),
            message: 'Appeal created successfully',
            status: 'pending_review'
        });
    } catch (error) {
        console.error('Error creating appeal:', error);
        res.status(500).json({ error: 'Failed to create appeal' });
    }
});

// Get user profile
router.get('/p2p/profile', async (req, res) => {
    try {
        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        const query = `
      SELECT 
        u.id, u.name, u.created_at as "joinDate",
        COUNT(d.id) as "completedDeals"
      FROM users u
      LEFT JOIN p2p_deals d ON (d.buyer_id = u.id OR d.seller_id = u.id) AND d.status = 'completed'
      WHERE u.id = $1
      GROUP BY u.id
    `;

        const result = await pgPool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        // Format the join date
        const joinDate = new Date(user.joinDate);
        const formattedJoinDate = joinDate.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        res.json({
            id: user.id,
            name: user.name || 'User' + user.id,
            joinDate: formattedJoinDate,
            completedDeals: parseInt(user.completedDeals) || 0
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Get user ads
router.get('/p2p/user-ads', async (req, res) => {
    try {
        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        const query = `
      SELECT 
        id, type, crypto, currency, price, available, 
        min_amount as "minAmount", max_amount as "maxAmount", 
        payment_methods as "paymentMethods", status, created_at as "createdAt"
      FROM p2p_ads
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

        const result = await pgPool.query(query, [userId]);

        // Format the response
        const ads = result.rows.map(row => ({
            id: row.id,
            type: row.type,
            crypto: row.crypto,
            currency: row.currency,
            price: parseFloat(row.price),
            available: parseFloat(row.available),
            minAmount: row.minAmount ? parseFloat(row.minAmount) : null,
            maxAmount: row.maxAmount ? parseFloat(row.maxAmount) : null,
            paymentMethods: row.paymentMethods || [],
            status: row.status,
            createdAt: row.createdAt
        }));

        res.json(ads);
    } catch (error) {
        console.error('Error fetching user ads:', error);
        res.status(500).json({ error: 'Failed to fetch user ads' });
    }
});

// Get payment methods
router.get('/p2p/payment-methods', async (req, res) => {
    try {
        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        const query = `
      SELECT id, name, details, active
      FROM payment_methods
      WHERE user_id = $1
      ORDER BY name
    `;

        const result = await pgPool.query(query, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({ error: 'Failed to fetch payment methods' });
    }
});

// Add payment method
router.post('/p2p/payment-methods', async (req, res) => {
    try {
        const { name, details, active } = req.body;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // Validate input
        if (!name || !details) {
            return res.status(400).json({ error: 'Name and details are required' });
        }

        const query = `
      INSERT INTO payment_methods (user_id, name, details, active)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, details, active
    `;

        const result = await pgPool.query(query, [userId, name, details, active !== false]);

        res.json({
            ...result.rows[0],
            message: 'Payment method added successfully'
        });
    } catch (error) {
        console.error('Error adding payment method:', error);
        res.status(500).json({ error: 'Failed to add payment method' });
    }
});

// Update payment method
router.put('/p2p/payment-methods/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, details, active } = req.body;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // Check if payment method exists and belongs to user
        const checkQuery = `
      SELECT * FROM payment_methods
      WHERE id = $1 AND user_id = $2
    `;
        const checkResult = await pgPool.query(checkQuery, [id, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Payment method not found or not authorized' });
        }

        const query = `
      UPDATE payment_methods
      SET name = $1, details = $2, active = $3
      WHERE id = $4 AND user_id = $5
      RETURNING id, name, details, active
    `;

        const result = await pgPool.query(query, [name, details, active, id, userId]);

        res.json({
            ...result.rows[0],
            message: 'Payment method updated successfully'
        });
    } catch (error) {
        console.error('Error updating payment method:', error);
        res.status(500).json({ error: 'Failed to update payment method' });
    }
});

// Delete payment method
router.delete('/p2p/payment-methods/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        // Check if payment method exists and belongs to user
        const checkQuery = `
      SELECT * FROM payment_methods
      WHERE id = $1 AND user_id = $2
    `;
        const checkResult = await pgPool.query(checkQuery, [id, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Payment method not found or not authorized' });
        }

        const query = `
      DELETE FROM payment_methods
      WHERE id = $1 AND user_id = $2
    `;

        await pgPool.query(query, [id, userId]);

        res.json({ message: 'Payment method deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment method:', error);
        res.status(500).json({ error: 'Failed to delete payment method' });
    }
});

// Get market price
router.get('/p2p/market-price', async (req, res) => {
    try {
        const { crypto, currency } = req.query;

        if (!crypto || !currency) {
            return res.status(400).json({ error: 'Crypto and currency parameters are required' });
        }

        // In a real app, we would fetch the market price from an external API or database
        // For now, we'll use mock data
        const mockPrices = {
            'TON': { 'RUB': 97.50, 'USD': 1.05, 'EUR': 0.97 },
            'USDT': { 'RUB': 92.80, 'USD': 1.00, 'EUR': 0.92 },
            'NOT': { 'RUB': 4.75, 'USD': 0.05, 'EUR': 0.046 },
            'BTC': { 'RUB': 4650000, 'USD': 50000, 'EUR': 46000 },
            'ETH': { 'RUB': 279000, 'USD': 3000, 'EUR': 2760 },
            'SOL': { 'RUB': 9300, 'USD': 100, 'EUR': 92 },
            'TRX': { 'RUB': 9.3, 'USD': 0.1, 'EUR': 0.092 },
            'DOGE': { 'RUB': 13.95, 'USD': 0.15, 'EUR': 0.138 }
        };

        const price = mockPrices[crypto]?.[currency];

        if (!price) {
            return res.status(404).json({ error: 'Price not available for the specified pair' });
        }

        res.json({
            crypto,
            currency,
            price,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching market price:', error);
        res.status(500).json({ error: 'Failed to fetch market price' });
    }
});

// Get user balance for P2P
router.get('/p2p/user-balance', async (req, res) => {
    try {
        // In a real app, get userId from authentication
        const userId = req.user?.id || 1; // Default for testing

        const query = `
      SELECT c.symbol, ub.balance
      FROM user_balances ub
      JOIN coins c ON ub.coin_id = c.id
      WHERE ub.user_id = $1
    `;

        const result = await pgPool.query(query, [userId]);

        // Format the response
        const balances = {};
        result.rows.forEach(row => {
            balances[row.symbol] = parseFloat(row.balance);
        });

        // Add mock data for testing if no balances found
        if (Object.keys(balances).length === 0) {
            balances['TON'] = 10.5;
            balances['USDT'] = 500.25;
            balances['NOT'] = 1000;
            balances['BTC'] = 0.05;
            balances['ETH'] = 1.2;
            balances['SOL'] = 15;
            balances['TRX'] = 1000;
            balances['DOGE'] = 500;
        }

        res.json(balances);
    } catch (error) {
        console.error('Error fetching user balance:', error);
        res.status(500).json({ error: 'Failed to fetch user balance' });
    }
});

export default router;