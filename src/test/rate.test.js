// import { getCoinsFromRedis, getCurrenciesFromRedis, getExchangeRatesFromCoinCap, getExchangeRateFromCryptocompare } from '../services/rateService.js';
//
// const { expect } = require('@jest/globals');
// describe('Функции работы с Redis', () => {
//     it('должна получить монеты из Redis', async () => {
//         try {
//             const coins = await getCoinsFromRedis();
//             expect(coins).toBeInstanceOf(Array);
//         } catch (error) {
//             expect(error).toBeUndefined();
//         }
//     });
//
//     it('должна получить валюты из Redis', async () => {
//         try {
//             const currencies = await getCurrenciesFromRedis();
//             expect(currencies).toBeInstanceOf(Array);
//         } catch (error) {
//             expect(error).toBeUndefined();
//         }
//     });
// });
//
// describe('Функции работы с базой данных', () => {
//     it('должна получить монеты из базы данных', async () => {
//         try {
//             const coins = await getCoinsFromDatabase();
//             expect(coins).toBeInstanceOf(Array);
//         } catch (error) {
//             expect(error).toBeUndefined();
//         }
//     });
//
//     it('должна получить валюты из базы данных', async () => {
//         try {
//             const currencies = await getCurrenciesFromDatabase();
//             expect(currencies).toBeInstanceOf(Array);
//         } catch (error) {
//             expect(error).toBeUndefined();
//         }
//     });
// });
//
// describe('Функции работы с API', () => {
//     it('должна получить курсы обмена из CoinCap', async () => {
//         try {
//             const rates = await getExchangeRatesFromCoinCap();
//             expect(rates).toBeInstanceOf(Array);
//         } catch (error) {
//             expect(error).toBeUndefined();
//         }
//     });
//
//     it('должна получить курс обмена из Cryptocompare', async () => {
//         try {
//             const exchangeRate = await getExchangeRateFromCryptocompare('BTC', 'USD');
//             expect(exchangeRate).toBeInstanceOf(Object);
//         } catch (error) {
//             expect(error).toBeUndefined();
//         }
//     });
// });
//
// describe('Связь функций', () => {
//     it('должна обновить курсы обмена', async () => {
//         try {
//             await updateExchangeRates();
//             expect(true).toBe(true);
//         } catch (error) {
//             expect(error).toBeUndefined();
//         }
//     });
// });