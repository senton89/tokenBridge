import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { walletApi, marketApi } from '../services/api';
import {listingsApi} from "../services/api";

function Home() {
    const [prices, setPrices] = useState({});
    const [priceChanges, setPriceChanges] = useState({});
    const [userBalances, setUserBalances] = useState({});
    const [currentCurrency, setCurrentCurrency] = useState('USD');
    const [hideSmallBalances, setHideSmallBalances] = useState(false);
    const [hideAmounts, setHideAmounts] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [coins, setCoins] = useState([]);
    const [currencies, setCurrencies] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchCoins()
    }, []);

    const fetchCoins = async () => {
        try {
            const response = await listingsApi.getCoins();
            setCoins(response.data);
        } catch (err) {
            setError('Не удалось загрузить список монет');
            console.error('Error fetching coins:', err);
        }
    };

    useEffect(() => {
        fetchCurrencies()
    }, []);

    const fetchCurrencies = async () => {
        try {
            const response = await listingsApi.getCurrencies();
            setCurrencies(response.data);
        } catch (err) {
            setError('Не удалось загрузить список монет');
            console.error('Error fetching coins:', err);
        }
    };

    // Загрузка баланса пользователя
    useEffect(() => {
        fetchUserBalance();
    }, []);

    const fetchUserBalance = async () => {
        try {
            setLoading(true);
            const response = await walletApi.getBalance();
            setUserBalances(response.data);
            setLoading(false);
        } catch (err) {
            setError('Не удалось загрузить баланс');
            console.error('Error fetching balance:', err);
            setLoading(false);
        }
    };

    // Загрузка цен криптовалют
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                // Получаем список символов криптовалют
                const cryptoSymbols = Object.keys(userBalances);

                // Получаем цены
                const pricesResponse = await marketApi.getPrices({
                    currencies: cryptoSymbols,
                    baseCurrency: currentCurrency
                });
                setPrices(pricesResponse.data);

                // Получаем изменения цен
                const changesResponse = await marketApi.getPriceChanges({
                    currencies: cryptoSymbols,
                    baseCurrency: currentCurrency
                });
                setPriceChanges(changesResponse.data);
            } catch (err) {
                console.error('Error fetching prices:', err);
            }
        };

        if (Object.keys(userBalances).length > 0) {
            fetchPrices();

            // Обновляем цены каждые 30 секунд
            const intervalId = setInterval(fetchPrices, 30000);
            return () => clearInterval(intervalId);
        }
    }, [userBalances, currentCurrency]);

    const toggleHideAmounts = () => {
        setHideAmounts((prev) => !prev); // Переключаем состояние отображения сумм валют пользователя
    };

    useEffect(() => {
        if (location.state?.currentCurrency) {
            setCurrentCurrency(location.state.currentCurrency);
        }
    }, [location.state]);

    const handleCoinList = (type) => {
        navigate('/coinlist', {
            state: {
                type: type
            },
        });
    };

    const handleCurrencySelect = () => {
        navigate('/currencies',
            { state: { currentCurrency: currentCurrency } });
    };

    const toggleHideSmallBalances = () => {
        setHideSmallBalances((prev) => !prev); // Переключаем состояние фильтра
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            const getPrices = async () => {
                const prices = {};
                const priceChanges = {};
                for (const coin of coins) {
                    const price = await getCoinPrice(coin.symbol, currentCurrency);
                    prices[coin.symbol] = price;
                    const priceChange = await getCoinPriceChange(coin.symbol, currentCurrency);
                    priceChanges[coin.symbol] = priceChange;
                }
                setPrices(prices);
                setPriceChanges(priceChanges);
            };
            getPrices();
        }, 1000);
        return () => {
            clearInterval(intervalId);
        };
    }, [currentCurrency]);

    const filteredCoins = hideSmallBalances
        ? coins.filter((coin) => {
            return userBalances[coin.symbol] > 0; // Показываем только монеты с балансом больше 0
        })
        : coins;

    return (
        <div>
            <div className="relative text-right p-1">
                <button className="text-gray-400 hover:text-blue-400 focus:outline-none">
                    <i className="fas fa-cog text-xl"></i>
                </button>
            </div>
            <div className="p-1 mt-10">
                <div className="flex items-center justify-center mb-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold mb-1">
                            {hideAmounts ? (
                                `${currencies.find(c => c.symbol === currentCurrency).icon} ***`
                            ) : (
                                Object.keys(prices).length === Object.keys(userBalances).length ? (
                                    `${currencies.find(c => c.symbol === currentCurrency).icon} ${Object.keys(userBalances).reduce((acc, symbol) => acc + userBalances[symbol] * prices[symbol], 0).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}`
                                ) : (
                                    'Loading...'
                                )
                            )}
                            <i className={`fas ${hideAmounts ? 'fa-eye-slash' : 'fa-eye'} text-white opacity-50 pl-1`}
                               onClick={toggleHideAmounts}></i>
                        </div>
                        <div className="text-gray-400 text-md" onClick={handleCurrencySelect}>
                            Общий баланс в <span className="text-blue-400">{currentCurrency}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row justify-around gap-6 mt-12 m-2">
                    <div className="text-center flex flex-col items-center">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-1"
                            onClick={() => handleCoinList('deposit')}>
                            <i className="fas fa-arrow-down text-white text-md"></i>
                        </div>
                        <div className="text-blue-500 font-bold text-sm">Пополнить</div>
                    </div>
                    <div className="text-center flex flex-col items-center mr-3">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-1"
                            onClick={() => handleCoinList('withdraw')}>
                            <i className="fas fa-arrow-up text-white text-md"></i>
                        </div>
                        <div className="text-blue-500 font-bold text-sm">Вывести</div>
                    </div>
                    <div className="text-center flex flex-col items-center mr-3">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-1"
                            onClick={() => navigate('/exchange')}>
                            <i className="fas fa-exchange-alt text-white text-md"></i>
                        </div>
                        <div className="text-blue-500 font-bold text-sm">Обмен</div>
                    </div>
                    <div className="text-center flex flex-col items-center mr-3">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-1"
                            onClick={() => navigate('/p2p')}>
                            <i className="fas fa-sync-alt text-white text-md"></i>
                        </div>
                        <div className="text-blue-500 font-bold text-sm">P2P</div>
                    </div>
                </div>
                <div className="ml-1 mr-1 mb-4 mt-12">
                    <div className="flex justify-between text-gray-400 text-sm">
                        <div>АКТИВЫ</div>
                        <div className="text-blue-400" onClick={toggleHideSmallBalances}>
                            {hideSmallBalances ? 'Показать все' : 'СКРЫТЬ МЕЛКИЕ БАЛАНСЫ'}
                        </div>
                    </div>
                </div>
                <div className="ml-1 mr-1 mt-4">
                    <div className="flex flex-col">
                        {filteredCoins.map((coin, index) => (
                            <div>
                                <div key={coin.id} className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                        <div className="rounded-full w-12 h-12 flex items-center justify-center mr-3">
                                            <img alt={`${coin.name} logo`} className="w-12 h-12" src={coin.logo}/>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-lg">{coin.name}</div>
                                            </div>
                                            <div className="text-gray-400 text-sm">
                                                {prices[coin.symbol] !== undefined && priceChanges[coin.symbol] !== undefined ? (
                                                    <span>
                        {currencies.find(c => c.symbol === currentCurrency).icon} {prices[coin.symbol].toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}{' '}
                                                        <span
                                                            className={priceChanges[coin.symbol] === 0 ? 'text-gray-500' : (priceChanges[coin.symbol] > 0 ? 'text-green-500' : 'text-red-500')}>
                          {priceChanges[coin.symbol] > 0 ? '+' : ''}{priceChanges[coin.symbol].toFixed(2)}%
                        </span>
                      </span>
                                                ) : (
                                                    'Loading...'
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div
                                            className="text-md">{hideAmounts ? '***' : (userBalances[coin.symbol] === 0 ? '0' : userBalances[coin.symbol].toLocaleString('en-US', {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 7
                                        }))} {coin.symbol}</div>
                                        <div className="text-gray-400 text-sm">
                                            {hideAmounts ? '***' : `${currencies.find(c => c.symbol === currentCurrency).icon} ${userBalances[coin.symbol] * prices[coin.symbol] !== undefined ? (userBalances[coin.symbol] * prices[coin.symbol]).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }) : 'Loading...'}`}
                                        </div>
                                    </div>
                                </div>
                                {index < coins.length - 1 &&
                                    <div className="border-b border-gray-600 opacity-50 mb-2 ml-12 "></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;