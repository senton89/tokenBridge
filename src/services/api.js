import axios from 'axios';

// Базовый URL для API
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
const API_BASE_URL = 'http://localhost:3001/api';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Обработка ошибок авторизации
        if (error.response && error.response.status === 401) {
            // Можно добавить логику для перенаправления на страницу входа
            console.error('Unauthorized access');
        }
        return Promise.reject(error);
    }
);

// P2P API
export const p2pApi = {
    // Получение объявлений о покупке
    getBuyListings: (filters) => api.post('/p2p/listings/buy', filters),

// Пример ответа:
// {
//   data: [
//     {
//       id: 1,
//       type: 'buy',
//       crypto: 'BTC',
//       price: 50000,
//       available: 0.5,
//       currency: 'RUB',
//       minAmount: 10000,
//       maxAmount: 100000,
//       paymentMethods: ['Сбербанк', 'Тинькофф'],
//       user: {
//         name: 'Dashing Shark',
//         deals: 156,
//       },
//       instructions: 'Получатель: Куксенко Д.А'
//     },
//     // ...другие объявления
//   ]
// }

    // Получение объявлений о продаже
    getSellListings: (filters) => api.post('/p2p/listings/sell', filters),

    // Пример ответа:
// {
//   data: [
//     {
//       id: 2,
//       type: 'sell',
//       crypto: 'ETH',
//       price: 3000,
//       available: 2,
//       currency: 'RUB',
//       minAmount: 5000,
//       maxAmount: 50000,
//       paymentMethods: ['QIWI', 'Yandex.Money'],
//       user: {
//         name: 'Crypto Master',
//         deals: 89
//       },
//       instructions: 'Оплата только с личного счета'
//     },
//     // ...другие объявления
//   ]
// }

    // Получение деталей объявления
    getAdDetails: (id) => api.get(`/p2p/ads/${id}`),

    // Пример ответа:
// {
//   data: {
//     id: 1,
//     type: 'buy',
//     crypto: 'BTC',
//     price: 50000,
//     available: 0.5,
//     currency: 'RUB',
//     minAmount: 10000,
//     maxAmount: 100000,
//     paymentMethods: ['Сбербанк', 'Тинькофф'],
//     user: {
//       name: 'Dashing Shark',
//       deals: 156
//     },
//     status: 'active',
//     terms: 'Оплата только с личного счета. Перевод в течение 15 минут.',
//     instructions: 'Получатель: Куксенко Д.А'
//   }
// }

    // Создание объявления
    createAd: (adData) => api.post('/p2p/ads', adData),

    // Пример ответа:
// {
//   data: {
//     id: 3,
//     status: 'active',
//     message: 'Объявление успешно создано'
//   }
// }


    // Обновление объявления
    updateAd: (id, adData) => api.put(`/p2p/ads/${id}`, adData),

    // Пример ответа:
// {
//   data: {
//     id: 1,
//     status: 'active',
//     message: 'Объявление успешно обновлено'
//   }
// }

    // Удаление объявления
    deleteAd: (id) => api.delete(`/p2p/ads/${id}`),

    // Пример ответа:
// {
//   data: {
//     message: 'Объявление успешно удалено'
//   }
// }

    // Изменение статуса объявления
    updateAdStatus: (id, status) => api.put(`/p2p/ads/${id}/status`, { status }),

    // Пример ответа:
// {
//   data: {
//     id: 1,
//     status: 'inactive',
//     message: 'Статус объявления успешно изменен'
//   }
// }


    getUserAds: () => api.get('/p2p/user-ads'),

    // Получение сделок пользователя
    getUserDeals: () => api.get('/p2p/deals'),

    // Пример ответа:
// {
//   data: [
//     {
//       id: 1,
//       status: 'active',
//       type: 'buy',
//       crypto: 'BTC',
//       amount: 0.05,
//       price: 50000,
//       totalPrice: 2500,
//       currency: 'RUB',
//       counterparty: {
//         name: 'User123',
//         deals: 45,
//       },
//       date: '2023-03-01T12:00:00Z',
//       paymentMethod: 'Сбербанк',
//       timeLimit: 15,
//       conditions: 'Оплата только с личного счета'
//     },
//     // ...другие сделки
//   ]
// }

    // Создание сделки
    createDeal: (dealData) => api.post('/p2p/deals', dealData),

    // Пример ответа:
// {
//   data: {
//     id: 2,
//     status: 'active',
//     message: 'Сделка успешно создана'
//   }
// }

    // Получение профиля пользователя
    getUserProfile: () => api.get('/p2p/profile'),

    // Пример ответа:
// {
//   data: {
//     name: 'CryptoTrader',
//     joinDate: '2022-01-15',
//     completedDeals: 78,
//   }
// }

    // Получение способов оплаты пользователя
    getPaymentMethods: () => api.get('/p2p/payment-methods'),

    // Пример ответа:
// {
//   data: [
//     {
//       id: 1,
//       name: 'Сбербанк',
//       details: '5536 9138 2846 1294',
//       active: true
//     },
//     {
//       id: 2,
//       name: 'Тинькофф',
//       details: '4276 8000 1234 5678',
//       active: true
//     },
//     // ...другие способы оплаты
//   ]
// }

    // Добавление способа оплаты
    addPaymentMethod: (methodData) => api.post('/p2p/payment-methods', methodData),

    // Пример ответа:
// {
//   data: {
//     id: 3,
//     name: 'QIWI',
//     details: '+7 (999) 123-45-67',
//     active: true,
//     message: 'Способ оплаты успешно добавлен'
//   }
// }

    // Удаление способа оплаты
    deletePaymentMethod: (id) => api.delete(`/p2p/payment-methods/${id}`),

    // Пример ответа:
// {
//   data: {
//     message: 'Способ оплаты успешно удален'
//   }
// }

    // Обновление способа оплаты
    updatePaymentMethod: (id, methodData) => api.put(`/p2p/payment-methods/${id}`, methodData),

    // Пример ответа:
// {
//   data: {
//     id: 2,
//     name: 'Тинькофф',
//     details: '5536 9138 2846 1294',
//     active: false,
//     message: 'Способ оплаты успешно обновлен'
//   }
// }
    // Получение деталей сделки
    getDealDetails: (id) => api.get(`/p2p/deals/${id}`),

    // Подтверждение оплаты
    confirmPayment: (id) => api.put(`/p2p/deals/${id}/confirm-payment`),

    // Выпуск криптовалюты
    releaseCrypto: (id) => api.put(`/p2p/deals/${id}/release`),

    // Отмена сделки
    cancelDeal: (id, reason) => api.put(`/p2p/deals/${id}/cancel`, { reason }),

    // Создание апелляции
    createAppeal: (id, reason) => api.post(`/p2p/deals/${id}/appeal`, { reason }),
};

// Wallet API
export const walletApi = {
    // Получение баланса пользователя
    getBalance: () => api.get('/wallet/balance'),

    // Пример ответа:
// {
//   data: {
//     TON: 10.5,
//     USDT: 500.25,
//     NOT: 1000,
//     BTC: 0.05,
//     ETH: 1.2,
//     SOL: 15,
//     TRX: 1000,
//     DOGE: 500
//   }
// }

    // Получение истории транзакций
    getTransactions: () => api.get('/wallet/transactions'),

    // Пример ответа:
// {
//   data: [
//     {
//       id: 1,
//       type: 'deposit',
//       currency: 'TON',
//       amount: 5.0,
//       status: 'completed',
//       timestamp: '2023-03-01T12:00:00Z',
//       txHash: '0x123abc...'
//     },
//     {
//       id: 2,
//       type: 'withdrawal',
//       currency: 'USDT',
//       amount: 100.0,
//       status: 'pending',
//       timestamp: '2023-03-02T14:30:00Z',
//       txHash: '0x456def...'
//     },
//     // ...другие транзакции
//   ]
// }

    // Получение адреса для депозита
    getDepositAddress: (currency) => api.get(`/wallet/deposit-address/${currency}`),

    // Пример ответа:
// {
//   data: {
//     address: 'UQCXJvvom3Z1GuOUVYnDYU6e1862WHR9ZI9HeuECW113d1T',
//     currency: 'TON',
//     network: 'TON',
//     minDeposit: 0.01
//   }
// }

    // Создание запроса на вывод средств
    createWithdrawal: (withdrawalData) => api.post('/wallet/withdraw', withdrawalData),

    // Пример ответа:
// {
//   data: {
//     id: 3,
//     currency: 'BTC',
//     amount: 0.01,
//     fee: 0.0005,
//     address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
//     status: 'pending',
//     timestamp: '2023-03-03T10:15:00Z'
//   }
// }

    // Обмен валюты
    exchangeCurrency: (exchangeData) => api.post('/wallet/exchange', exchangeData),

    // Пример ответа:
// {
//   data: {
//     id: 4,
//     fromCurrency: 'TON',
//     toCurrency: 'USDT',
//     fromAmount: 10,
//     toAmount: 25.5,
//     rate: 2.55,
//     fee: 0.1,
//     status: 'completed',
//     timestamp: '2023-03-04T09:45:00Z'
//   }
// }

    // Получение минимальных сумм для вывода
    getMinWithdrawalAmounts: () => api.get('/wallet/min-withdrawal-amounts'),
// Пример ответа:
// {
//   data: {
//     TON: 0.09,
//     USDT: 1,
//     NOT: 80,
//     BTC: 0.00015,
//     ETH: 0.003,
//     SOL: 0.01,
//     TRX: 10,
//     DOGE: 7
//   }
// }

    // Получение доступных монет для обмена
    getAvailableCoins: () => api.get('/wallet/available-coins'),

    // Получение истории транзакций с фильтрацией
    getTransactionsHistory: (filters) => api.post('/wallet/transactions/history', filters),


};

// Market API
export const marketApi = {
    // Получение курсов валют
    getPrices: (currency) => api.get('/market/prices', { params: { currency } }),

    // Пример ответа:
// {
//   data: {
//     TON: 5.25,
//     USDT: 1.0,
//     NOT: 0.05,
//     BTC: 50000,
//     ETH: 3000,
//     SOL: 100,
//     TRX: 0.1,
//     DOGE: 0.15
//   }
// }

    // Получение изменения цены
    getPriceChanges: (currencies) => api.get('/market/price-changes', { params: { currencies } }),

    // Пример ответа:
// {
//   data: {
//     TON: 2.5,
//     USDT: 0.0,
//     NOT: -1.2,
//     BTC: 1.8,
//     ETH: -0.5,
//     SOL: 3.2,
//     TRX: -0.8,
//     DOGE: 5.0
//   }
// }

// Получение курса обмена
    getExchangeRate: ({ fromCurrency, toCurrency }) =>
        api.get('/market/exchange-rate', { params: { fromCurrency, toCurrency } }),
// Пример ответа:
// {
//   data: {
//     fromCurrency: 'TON',
//     toCurrency: 'USDT',
//     rate: 2.55
//   }
// }

    // Получение исторических данных
    getHistoricalData: (currency, period) =>
        api.get('/market/historical', { params: { currency, period } }),

};

export const listingsApi = {
    // Получение объявлений
    getCoins: () => api.get('/coins', ), //протестировано

    // Пример ответа:
// {
//   data: [
//     { id: 1, name: 'Toncoin', logo: './toncoin.png', symbol: 'TON', network: 'TON' },
//     { id: 2, name: 'Tether', logo: './tether.png', symbol: 'USDT', network: 'TON' },
//     { id: 3, name: 'Notcoin', logo: './notcoin.png', symbol: 'NOT', network: 'TON' },
//     { id: 4, name: 'Bitcoin', logo: './bitcoin.png', symbol: 'BTC', network: 'BTC' },
//     { id: 5, name: 'Ethereum', logo: './etherium.png', symbol: 'ETH', network: 'ETH' },
//     { id: 6, name: 'Solana', logo: './solana.png', symbol: 'SOL', network: 'SOL' },
//     { id: 7, name: 'TRON', logo: './tron.png', symbol: 'TRX', network: 'TRX' },
//     { id: 8, name: 'Dogecoin', logo: './dogecoin.png', symbol: 'DOGE', network: 'DOGE' }
//   ]
// }

    getCurrencies: () => api.get('/currencies', ), //протестировано
// Пример ответа:
// {
//   data: [
//     { symbol: '₽', name: 'RUB', description: 'Российский рубль', icon: '₽' },
//     { symbol: '$', name: 'USD', description: 'Доллар США', icon: '$' },
//     { symbol: '€', name: 'EUR', description: 'Евро', icon: '€' },
//     { symbol: 'Br', name: 'BYN', description: 'Белорусский рубль', icon: 'Br' },
//     { symbol: '₴', name: 'UAH', description: 'Украинская гривна', icon: '₴' },
//     { symbol: '£', name: 'GBP', description: 'Британский фунт', icon: '£' },
//     { symbol: '¥', name: 'CNY', description: 'Китайский юань', icon: '¥' },
//     { symbol: '₸', name: 'KZT', description: 'Казахстанский тенге', icon: '₸' }
//   ]
// }
};

export default api;