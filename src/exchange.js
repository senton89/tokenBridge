// const express = require('express');
// const app = express();
// const redis = require('redis');
// const pg = require('pg');
//
// const redisClient = redis.createClient();
// const pgClient = new pg.Client({
//     user: 'username',
//     host: 'localhost',
//     database: 'database',
//     password: 'password',
//     port: 5432,
// });
//
// app.post('/exchange', (req, res) => {
//     const { fromCurrency, toCurrency, amount } = req.body;
//
//     // Получение курса обмена из Redis
//     redisClient.get(`exchangeRate:${fromCurrency}:${toCurrency}`, (err, exchangeRate) => {
//         if (err) {
//             // Обновление курса обмена из API
//             fetch(`https://min-api.cryptocompare.com/data/price?fsym=${fromCurrency}&tsyms=${toCurrency}`)
//                 .then((response) => response.json())
//                 .then((data) => {
//                     const exchangeRate = data[toCurrency];
//                     redisClient.set(`exchangeRate:${fromCurrency}:${toCurrency}`, exchangeRate);
//                     // Обновление баланса пользователя
//                     pgClient.query(`UPDATE users SET balance = balance - ${amount} WHERE currency = '${fromCurrency}'`);
//                     pgClient.query(`UPDATE users SET balance = balance + ${amount * exchangeRate} WHERE currency = '${toCurrency}'`);
//                     res.json({ success: true });
//                 })
//                 .catch((err) => {
//                     res.json({ success: false, error: err.message });
//                 });
//         } else {
//             // Обновление баланса пользователя
//             pgClient.query(`UPDATE users SET balance = balance - ${amount} WHERE currency = '${fromCurrency}'`);
//             pgClient.query(`UPDATE users SET balance = balance + ${amount * exchangeRate} WHERE currency = '${toCurrency}'`);
//             res.json({ success: true });
//         }
//     });
// });
//
// app.listen(3000, () => {
//     console.log('Server started on port 3000');
// });