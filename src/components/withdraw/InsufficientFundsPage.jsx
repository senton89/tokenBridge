import React from 'react';

// Массив с данными о криптовалютах
const coins = [
    { id: 1, name: 'Toncoin', logo: './toncoin.png', symbol: 'TON' },
    { id: 2, name: 'Tether', logo: './tether.png', symbol: 'USDT' },
    { id: 3, name: 'Notcoin', logo: './notcoin.png', symbol: 'NOT' },
    { id: 4, name: 'Bitcoin', logo: './bitcoin.png', symbol: 'BTC' },
    { id: 5, name: 'Ethereum', logo: './etherium.png', symbol: 'ETH' },
    { id: 6, name: 'Solana', logo: './solana.png', symbol: 'SOL' },
    { id: 7, name: 'TRON', logo: './tron.png', symbol: 'TRX' },
    { id: 8, name: 'Dogecoin', logo: './dogecoin.png', symbol: 'DOGE' },
];

// Константы для минимального вывода и баланса пользователя
const MIN_WITHDRAWAL = {
    TON: 0.09,
    USDT: 1,
    NOT: 80,
    BTC: 0.00015,
    ETH: 0.003,
    SOL: 0.01,
    TRX: 10,
    DOGE: 7,
};

const userBalances = {
    TON: 0,
    USDT: 0.5,
    NOT: 80,
    BTC: 0.00015,
    ETH: 0.003,
    SOL: 0.01,
    TRX: 5,
    DOGE: 6,
};

const InsufficientFundsPage = ({ currency }) => {
    // Находим данные о выбранной валюте
    const selectedCoin = coins.find(coin => coin.symbol === currency);

    // Если валюта не найдена, возвращаем null или сообщение об ошибке
    if (!selectedCoin) {
        return <div>Валюта не найдена</div>;
    }

    return (
        <div className="text-white flex flex-col items-center justify-center mt-20">
            <img alt={`${selectedCoin.name} logo`} className="w-28 h-28" src={selectedCoin.logo} />
            <div className="text-center flex flex-col items-center w-full pt-6 p-10">
                <h1 className="text-3xl font-bold mb-16">
                    Недостаточно {selectedCoin.name} для вывода
                </h1>
                <div className="bg-gray-800 rounded-2xl pb-3 p-3 w-full text-md space-y-3">
                    <div className="flex justify-between mb-2 text-gray-400">
                        <span>Баланс</span>
                        <span className="text-red-500">
                            {userBalances[currency]} {currency}
                        </span>
                    </div>
                    <div className="border-b border-gray-600 opacity-30"></div>
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Вывод от</span>
                        <span>
                            {MIN_WITHDRAWAL[currency]} {currency}
                        </span>
                    </div>
                    <div className="border-b border-gray-600 opacity-30"></div>
                    {/* Комиссия */}
                    <div className="flex justify-between pb-2">
                        <span className="text-gray-400">Комиссия</span>
                        <span>
                            {MIN_WITHDRAWAL[currency]} {currency}
                        </span>
                    </div>
                </div>
                <p className="text-gray-400 m-6 text-lg">
                    Комиссии и лимиты для {selectedCoin.name} в сети TON.
                </p>
            </div>
            <div className="p-4 w-full absolute bottom-0">
                <button
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-xl text-lg">
                    Назад
                </button>
            </div>
        </div>
    );
};

export default InsufficientFundsPage;