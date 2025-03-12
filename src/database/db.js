import redis from 'ioredis';
import pkg from 'pg';
const { Pool } = pkg;

// Use environment variables for production
const pgPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'token_bridge',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
});

// Handle connection events
pgPool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

export { pgPool, redisClient };