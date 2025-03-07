import redis from 'ioredis';
import pkgP from 'pg';
const { Pool } = pkgP;


const pgPool = new Pool({
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

export { pgPool, redisClient };