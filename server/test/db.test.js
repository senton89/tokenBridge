const { expect } = require('chai');
const { pgPool, redisClient } = require('../database/db');

describe('PostgreSQL', () => {
    it('должен подключиться к базе данных', async () => {
        try {
            await pgPool.query('SELECT 1');
            expect(true).to.be.true;
        } catch (error) {
            expect(error).to.be.undefined;
        }
    });

    it('должен выполнить запрос', async () => {
        const result = await pgPool.query('SELECT 1 AS value');
        expect(result.rows[0]).to.deep.equal({ value: 1 });
    });
});

describe('Redis', () => {
    it('должен подключиться к Redis', async () => {
        try {
            await new Promise((resolve, reject) => {
                redisClient.ping((error, res) => {
                    console.log('Ping response:', res);
                    if (error) {
                        console.error('Ping error:', error);
                        reject(error);
                    } else {
                        resolve(res);
                    }
                });
            });
            expect(true).to.be.true;
        } catch (error) {
            expect(error).to.be.undefined;
        }
    });

    it('должен сохранить значение в Redis', async () => {
        await new Promise((resolve, reject) => {
            redisClient.set('test', 'value', (error, res) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(res);
                }
            });
        });
        const value = await new Promise((resolve, reject) => {
            redisClient.get('test', (error, res) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(res);
                }
            });
        });
        expect(value).to.equal('value');
    });
});

describe('Связь PostgreSQL и Redis', () => {
    before(async () => {
        await pgPool.query('CREATE TABLE IF NOT EXISTS test (value TEXT)');
    });

    it('должен сохранить значение в PostgreSQL и Redis', async () => {
        const value = 'test_value';
        await pgPool.query('INSERT INTO test (value) VALUES ($1)', [value]);
        await new Promise((resolve, reject) => {
            redisClient.set('test', value, (error, res) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(res);
                }
            });
        });
        const result = await pgPool.query('SELECT value FROM test WHERE value = $1', [value]);
        expect(result.rows[0].value).to.equal(value);
        const redisValue = await new Promise((resolve, reject) => {
            redisClient.get('test', (error, res) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(res);
                }
            });
        });
        expect(redisValue).to.equal(value);
    });
    after(async () => {
        await pgPool.query('DROP TABLE IF EXISTS test');
    });
});