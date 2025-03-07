import { getAllExchangeRates, getUserBalance, updateUserBalance, addTransaction } from '../database/dbContext.js';

async function exchangeCoins(userId, coinIdFrom, coinIdTo, amount) {
    // Проверяем, есть ли у пользователя необходимая сумма криптовалюты для обмена
    const balanceFrom = await getUserBalance(userId, coinIdFrom);
    if (balanceFrom.balance < amount) {
        throw new Error('Недостаточно средств для обмена');
    }

    // Выполняем обмен криптовалют
    const exchangeRate = await getExchangeRate(coinIdFrom, coinIdTo);
    const commission = amount * 0.015; // Комиссия 1.5%
    const amountTo = (amount - commission) * exchangeRate;
    await updateUserBalance(userId, coinIdFrom, balanceFrom.balance - amount);
    await updateUserBalance(userId, coinIdTo, (await getUserBalance(userId, coinIdTo)).balance + amountTo);

    // Добавляем транзакцию обмена
    await addTransaction(userId, coinIdFrom, -amount, 'exchange');
    await addTransaction(userId, coinIdTo, amountTo, 'exchange');
    // await addTransaction(userId, coinIdFrom, -commission, 'commission');

    return { amount, amountTo };
}

// Функция получения курса обмена
async function getExchangeRate(coinIdFrom, coinIdTo) {
    const exchangeRate = await getAllExchangeRates();
    const rate = exchangeRate.find((rate) => rate.coin_id === coinIdFrom && rate.currency_id === coinIdTo);
    if (rate === undefined) {
        throw new Error('Нет курса обмена');
    }
    return rate.rate;
}

export { exchangeCoins };