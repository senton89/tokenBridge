import axios from 'axios';

// Базовый URL для API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

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

    // Получение объявлений о продаже
    getSellListings: (filters) => api.post('/p2p/listings/sell', filters),

    // Получение деталей объявления
    getAdDetails: (id) => api.get(`/p2p/ads/${id}`),

    // Создание объявления
    createAd: (adData) => api.post('/p2p/ads', adData),

    // Обновление объявления
    updateAd: (id, adData) => api.put(`/p2p/ads/${id}`, adData),

    // Удаление объявления
    deleteAd: (id) => api.delete(`/p2p/ads/${id}`),

    // Изменение статуса объявления
    updateAdStatus: (id, status) => api.put(`/p2p/ads/${id}/status`, { status }),

    // Получение сделок пользователя
    getUserDeals: () => api.get('/p2p/deals'),

    // Создание сделки
    createDeal: (dealData) => api.post('/p2p/deals', dealData),

    // Получение профиля пользователя
    getUserProfile: () => api.get('/p2p/profile'),

    // Получение способов оплаты пользователя
    getPaymentMethods: () => api.get('/p2p/payment-methods'),

    // Добавление способа оплаты
    addPaymentMethod: (methodData) => api.post('/p2p/payment-methods', methodData),

    // Удаление способа оплаты
    deletePaymentMethod: (id) => api.delete(`/p2p/payment-methods/${id}`),

    // Обновление способа оплаты
    updatePaymentMethod: (id, methodData) => api.put(`/p2p/payment-methods/${id}`, methodData),
};

// Wallet API
export const walletApi = {
    // Получение баланса пользователя
    getBalance: () => api.get('/wallet/balance'),

    // Получение истории транзакций
    getTransactions: () => api.get('/wallet/transactions'),

    // Получение адреса для депозита
    getDepositAddress: (currency) => api.get(`/wallet/deposit/${currency}`),

    // Создание запроса на вывод средств
    createWithdrawal: (withdrawalData) => api.post('/wallet/withdraw', withdrawalData),

    // Обмен валюты
    exchangeCurrency: (exchangeData) => api.post('/wallet/exchange', exchangeData),
};

// Market API
export const marketApi = {
    // Получение курсов валют
    getPrices: (currencies) => api.get('/market/prices', { params: { currencies } }),

    // Получение изменения цены
    getPriceChanges: (currencies) => api.get('/market/price-changes', { params: { currencies } }),
};

export default api;