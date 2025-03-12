import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletApi } from '../../services/api';

const InsufficientFundsPage = ({ currency }) => {
    const navigate = useNavigate();
    const [coinData, setCoinData] = useState(null);
    const [userBalance, setUserBalance] = useState(0);
    const [minWithdrawal, setMinWithdrawal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch coin data
                const coinsResponse = await walletApi.getAvailableCoins();
                const selectedCoin = coinsResponse.data.find(coin => coin.symbol === currency);
                setCoinData(selectedCoin);

                // Fetch user balance
                const balanceResponse = await walletApi.getBalance();
                setUserBalance(balanceResponse.data[currency] || 0);

                // Fetch minimum withdrawal amounts
                const minAmountsResponse = await walletApi.getMinWithdrawalAmounts();
                setMinWithdrawal(minAmountsResponse.data[currency] || 0);
            } catch (err) {
                console.error('Error fetching data:', err);
                // Fallback to static data if API fails
                setCoinData({
                    name: currency,
                    logo: `./${currency.toLowerCase()}.png`,
                    symbol: currency
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currency]);

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="text-white flex flex-col items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-4">Загрузка...</p>
            </div>
        );
    }

    if (!coinData) {
        return <div className="text-white text-center mt-20">Валюта не найдена</div>;
    }

    return (
        <div className="text-white flex flex-col items-center justify-center mt-20">
            <img
                alt={`${coinData.name} logo`}
                className="w-28 h-28"
                src={coinData.logo}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/112?text=' + currency;
                }}
            />

            <div className="text-center flex flex-col items-center w-full pt-6 p-10">
                <h1 className="text-3xl font-bold mb-16">
                    Недостаточно {coinData.name} для вывода
                </h1>

                <div className="bg-gray-800 rounded-2xl pb-3 p-3 w-full text-md space-y-3">
                    <div className="flex justify-between mb-2 text-gray-400">
                        <span>Баланс</span>
                        <span className="text-red-500">
              {userBalance} {currency}
            </span>
                    </div>

                    <div className="border-b border-gray-600 opacity-30"></div>

                    <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Вывод от</span>
                        <span>
              {minWithdrawal} {currency}
            </span>
                    </div>

                    <div className="border-b border-gray-600 opacity-30"></div>

                    <div className="flex justify-between pb-2">
                        <span className="text-gray-400">Комиссия</span>
                        <span>
              {minWithdrawal} {currency}
            </span>
                    </div>
                </div>

                <p className="text-gray-400 m-6 text-lg">
                    Комиссии и лимиты для {coinData.name} в сети {coinData.network || 'TON'}.
                </p>
            </div>

            <div className="p-4 w-full fixed bottom-0">
                <button
                    onClick={handleBack}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-xl text-lg"
                >
                    Назад
                </button>
            </div>
        </div>
    );
};

export default InsufficientFundsPage;