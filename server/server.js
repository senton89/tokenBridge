const express = require('express');
const app = express();
const cors = require('cors');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'crypto_bric',
    password: 'postgres',
    port: 5432,
});

app.use(cors());

app.get('/api/currencies', async (req, res) => {
    const result = await pool.query('SELECT * FROM currencies');
    res.json(result.rows);
});

app.listen(3001, () => {
    console.log('Server started on port 3001');
});