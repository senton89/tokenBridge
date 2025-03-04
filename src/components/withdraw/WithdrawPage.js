import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import InsufficientFundsPage from "./InsufficientFundsPage";

// Константы
const MIN_WITHDRAWAL = {
    BTC: 0.00015,
    ETH: 0.003,
    DOGE: 7,
    SOL: 0.01,
    TRX: 10,
    TON: 0.09,
    NOT: 80,
    USDT: 1,
};

const userBalances = {
    TON: 1,
    USDT: 0.5,
    NOT: 80,
    BTC: 0.00015,
    ETH: 0.003,
    SOL: 0.01,
    TRX: 500,
    DOGE: 6,
};

const EXCHANGE_RATE_API = 'https://min-api.cryptocompare.com/data/price';


const WithdrawPage = () => {
    const location = useLocation();
    const { currency } = location.state || {};
    const [amount, setAmount] = useState(userBalances[currency] || 0);
    const [exchangeRate, setExchangeRate] = useState(0);
    const [address, setAddress] = useState('UQC4JF09v...gLKHBriv');
    const [isAddressEnabled, setAddressEnabled] = useState(false);

    const handleAddressChange = (e) => {
        setAddress(e.target.value);
    };

    useEffect(() => {
        const fetchExchangeRate = async () => {
            const response = await fetch(`${EXCHANGE_RATE_API}?fsym=${currency}&tsyms=USD`);
            const data = await response.json();
            setExchangeRate(data.USD);
        };
        fetchExchangeRate();
    }, [currency]);

    const handleMaxClick = () => {
        // Рассчитываем максимально возможную сумму вывода
        const maxAmount = userBalances[currency];
        setAmount(parseFloat(maxAmount).toFixed(8));
    };

    const [isValidAmount, setIsValidAmount] = useState(true);

    const handleAmountChange = (e) => {
        const value = e.target.value;
        setAmount(value);
        // Ограничиваем ввод до 9 знаков, не выше максимума и не ниже 0
        if (value.length <= 9 && parseFloat(value) >= 0 && parseFloat(value) <= userBalances[currency]) {
            setIsValidAmount(true);
        } else {
            setIsValidAmount(false);
        }
    };

    if (userBalances[currency] < MIN_WITHDRAWAL[currency]) {
        return <InsufficientFundsPage currency={currency}/>;
    }

    return (
        <div className="text-white flex flex-col items-center justify-center mt-6">
            <div className="text-center flex flex-col items-center w-full pt-4 p-6">
                <div className="bg-gray-800 rounded-2xl pb-0 p-2 mb-2 w-full space-y-2 space-x-2">
                    <div className="flex justify-between mb-1 ">
                        <div
                            className="rounded-full w-6 h-6 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-700 ml-2">
                            <i className="fas fa-arrow-up text-white text-sm mr-2 pl-2"></i>
                        </div>
                        <div className="flex justify-end w-full ml-1">
          <span className="text-white text-lg mr-1 mt-1">
            Отправить:
          </span>
                            <input
                                type="text"
                                disabled={isAddressEnabled}
                                value={address.length > 10 ? address.slice(0, 5) + '...' + address.slice(-10) : address}
                                onChange={handleAddressChange}
                                className="text-gray-400 text-lg mr-6 mt-1 w-full bg-transparent outline-none appearance-none"
                                style={{
                                    color: 'inherit', // Цвет текста как у фона
                                    WebkitAppearance: 'none', // Убираем стрелочки в Safari
                                    MozAppearance: 'textfield', // Убираем стрелочки в Firefox
                                }}
                            />
                            <i className="fas fa-pencil-alt text-blue-400 text-lg pt-1 pr-1"
                               onClick={() => setAddressEnabled(!isAddressEnabled)}></i>
                        </div>
                    </div>
                    <div className="border-b border-gray-600 opacity-30"></div>
                    <div className="flex justify-between">
                        <span className="text-gray-400 text-lg">Вывести</span>
                    </div>
                    <div className="flex">
                        <input
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            min="0"
                            className="text-gray-400 text-4xl font-bold w-full bg-transparent outline-none appearance-none"
                            style={{
                                color: 'inherit', // Цвет текста как у фона
                                WebkitAppearance: 'none', // Убираем стрелочки в Safari
                                MozAppearance: 'textfield', // Убираем стрелочки в Firefox
                            }}
                        />
                        <span className="text-gray-400 text-lg pt-4 pl-4">{currency}</span>
                    </div>
                    <div className="flex pb-2 text-sm">
                        <span className="text-gray-400">Мин {MIN_WITHDRAWAL[currency]} - Макс {userBalances[currency]}</span>
                        <div className="flex items-center ml-auto">
                            <button
                                className="text-blue-400 pr-6"
                                onClick={handleMaxClick}
                            >
                                МАКС
                            </button>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800 rounded-2xl pb-2 py-2 mb-2 w-full text-lg space-y-1">
                    <div className="flex justify-between text-gray-400">
                        <span className="ml-5">Сумма</span>
                    </div>
                    <div className="flex justify-between ml-5">
                        ≈ {amount * exchangeRate} USD
                    </div>
                    <div className="border-b border-gray-600 opacity-30"></div>
                    <div className="flex justify-between">
                        <span className="text-gray-400 ml-5">Комиссия</span>
                    </div>
                    <div className="flex justify-between ml-5">
                        <span>{MIN_WITHDRAWAL[currency]} {currency}</span>
                        <span className="text-gray-400 mr-2">≈ ${(MIN_WITHDRAWAL[currency] * exchangeRate).toFixed(2)}</span>
                    </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-2 mb-4 w-full text-lg">
                    <div className="flex justify-between text-gray-400">
                        <button className="text-blue-400 px-2 rounded-xl flex items-center space-x-1">
                            <i className="far fa-comment-alt mr-2 mt-1"></i>
                            Добавить комментарий
                        </button>
                    </div>
                </div>
            </div>
            <div className="p-2 w-full absolute bottom-0">
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 rounded-lg text-lg"
                        disabled={!isValidAmount}>
                    Отправить
                </button>
            </div>
        </div>
    );
};

export default WithdrawPage;