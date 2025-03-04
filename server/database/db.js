const { Client } = require('pg');
const redis = require('ioredis');

const pgClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'tokenbridge',
    password: 'postgres',
    port: 5432,
});

const redisClient = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
});

module.exports = { pgClient, redisClient };