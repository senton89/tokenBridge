import { pgPool, redisClient } from './db.js';

async function getCoinsFromRedis() {
    try {
        const coins = await redisClient.get('coins');
        if (coins) {
            return JSON.parse(coins);
        } else {
            return await getCoinsFromDatabase();
        }
    } catch (error) {
        console.error('Ошибка получения монет из Redis:', error);
    }
}

async function getCoinsFromDatabase() {
    try {
        const coins = await pgPool.query('SELECT * FROM coins');
        await redisClient.set('coins', JSON.stringify(coins.rows));
        return coins.rows;
    } catch (error) {
        console.error('Ошибка получения монет из базы данных:', error);
    }
}

async function getCurrenciesFromRedis() {
    try {
        const currencies = await redisClient.get('currencies');
        if (currencies) {
            return JSON.parse(currencies);
        } else {
            return await getCurrenciesFromDatabase();
        }
    } catch (error) {
        console.error('Ошибка получения валют из Redis:', error);
    }
}

async function getCurrenciesFromDatabase() {
    try {
        const currencies = await pgPool.query('SELECT * FROM currencies');
        await redisClient.set('currencies', JSON.stringify(currencies.rows));
        return currencies.rows;
    } catch (error) {
        console.error('Ошибка получения валют из базы данных:', error);
    }
}


// Получить пользователя по ID с кэшированием
async function getUserById(userId) {
    const cacheKey = `user:${userId}`;
    const cachedUser  = await redisClient.get(cacheKey);

    if (cachedUser ) {
        return JSON.parse(cachedUser );
    }

    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pgPool.query(query, [userId]);

    if (result.rows.length > 0) {
        const user = result.rows[0];
        await redisClient.set(cacheKey, JSON.stringify(user), 'EX', 3600); // Кэшируем на 1 час
        return user;
    }

    return null;
}

// Получить пользователя по Telegram ID с кэшированием
async function getUserByTelegramId(telegramId) {
    const cacheKey = `user:telegram:${telegramId}`;
    const cachedUser  = await redisClient.get(cacheKey);

    if (cachedUser ) {
        return JSON.parse(cachedUser );
    }

    const query = 'SELECT * FROM users WHERE telegram_id = $1';
    const result = await pgPool.query(query, [telegramId]);

    if (result.rows.length > 0) {
        const user = result.rows[0];
        await redisClient.set(cacheKey, JSON.stringify(user), 'EX', 3600); // Кэшируем на 1 час
        return user;
    }

    return null;
}

// Добавить нового пользователя
async function addUser (telegramId) {
    const query = 'INSERT INTO users (telegram_id) VALUES ($1) RETURNING *';
    const result = await pgPool.query(query, [telegramId]);

    if (result.rows.length > 0) {
        const user = result.rows[0];
        const cacheKey = `user:${user.id}`;
        await redisClient.set(cacheKey, JSON.stringify(user), 'EX', 3600); // Кэшируем на 1 час
        return user;
    }

    return null;
}

// Получить все валюты с кэшированием
async function getAllCurrencies() {
    const cacheKey = 'currencies:all';
    const cachedCurrencies = await redisClient.get(cacheKey);

    if (cachedCurrencies) {
        return JSON.parse(cachedCurrencies);
    }

    const query = 'SELECT * FROM currencies';
    const result = await pgPool.query(query);

    if (result.rows.length > 0) {
        const currencies = result.rows;
        await redisClient.set(cacheKey, JSON.stringify(currencies), 'EX', 3600); // Кэшируем на 1 час
        return currencies;
    }

    return [];
}

// Получить все криптовалюты с кэшированием
async function getAllCoins() {
    const cacheKey = 'coins:all';
    const cachedCoins = await redisClient.get(cacheKey);

    if (cachedCoins) {
        return JSON.parse(cachedCoins);
    }

    const query = 'SELECT * FROM coins';
    const result = await pgPool.query(query);

    if (result.rows.length > 0) {
        const coins = result.rows;
        await redisClient.set(cacheKey, JSON.stringify(coins), 'EX', 3600); // Кэшируем на 1 час
        return coins;
    }

    return [];
}

// Получить баланс пользователя по ID и ID криптовалюты с кэшированием
async function getUserBalance(userId, coinId) {
    const cacheKey = `user_balance:${userId}:${coinId}`;
    const cachedBalance = await redisClient.get(cacheKey);

    if (cachedBalance) {
        return JSON.parse(cachedBalance);
    }

    const query = 'SELECT * FROM user_balances WHERE user_id = $1 AND coin_id = $2';
    const result = await pgPool.query(query, [userId, coinId]);

    if (result.rows.length > 0) {
        const balance = result.rows[0];
        await redisClient.set(cacheKey, JSON.stringify(balance), 'EX', 3600); // Кэшируем на 1 час
        return balance;
    }

    return null;
}

// Добавить новую транзакцию
async function addTransaction(userId, coinId, amount, type) {
    const query = 'INSERT INTO transactions (user_id, coin_id, amount, type) VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await pgPool.query(query, [userId, coinId, amount, type]);

    if (result.rows.length > 0) {
        const transaction = result.rows[0];
        return transaction;
    }

    return null;
}

// Изменить баланс пользователя
async function updateUserBalance(userId, coinId, newBalance) {
    const query = 'UPDATE user_balances SET balance = $1 WHERE user_id = $2 AND coin_id = $3 RETURNING *';
    const result = await pgPool.query(query, [newBalance, userId, coinId]);

    if (result.rows.length > 0) {
        const updatedBalance = result.rows[0];
        const cacheKey = `user_balance:${userId}:${coinId}`;
        await redisClient.del(cacheKey); // Удаляем кэш, так как баланс изменился
        return updatedBalance;
    }

    return null;
}

// Получить все транзакции пользователя по ID
async function getUserTransactions(userId) {
    const query = 'SELECT * FROM transactions WHERE user_id = $1';
    const result = await pgPool.query(query, [userId]);

    if (result.rows.length > 0) {
        return result.rows;
    }

    return [];
}

// Получить все курсы обмена с кэшированием
async function getAllExchangeRates() {
    const cacheKey = 'exchange_rates';
    const cachedRates = await redisClient.get(cacheKey);

    if (cachedRates) {
        return JSON.parse(cachedRates);
    }

    const query = 'SELECT * FROM exchange_rates';
    const result = await pgPool.query(query);

    if (result.rows.length > 0) {
        const rates = result.rows;
        await redisClient.set(cacheKey, JSON.stringify(rates), 'EX', 3600); // Кэшируем на 1 час
        return rates;
    }

    return [];
}

// Получить все комиссии с кэшированием
async function getAllCommissions() {
    const cacheKey = 'commissions:all';
    const cachedCommissions = await redisClient.get(cacheKey);

    if (cachedCommissions) {
        return JSON.parse(cachedCommissions);
    }

    const query = 'SELECT * FROM commissions';
    const result = await pgPool.query(query);

    if (result.rows.length > 0) {
        const commissions = result.rows;
        await redisClient.set(cacheKey, JSON.stringify(commissions), 'EX', 3600); // Кэшируем на 1 час
        return commissions;
    }

    return [];
}

export {getCoinsFromRedis,getCurrenciesFromRedis, getUserById, getUserByTelegramId, addUser, getAllCurrencies, getAllCoins, getUserBalance, addTransaction, updateUserBalance, getUserTransactions, getAllExchangeRates, getAllCommissions };
