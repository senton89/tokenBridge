import express from 'express';
import exchangeController from './controllers/exchangeController.js';
import {updateDataFromApi} from './services/rateService.js';
import {configDotenv} from "dotenv";
configDotenv();

const app = express();

app.use('/api', exchangeController);

app.listen(3001, async () => {
    console.log('Сервер запущен на порту 3001');
    await updateDataFromApi();
});