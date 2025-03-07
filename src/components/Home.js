import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const userBalances = {
    TON: 1,
    USDT: 1500,
    NOT: 80,
    BTC: 0.00015,
    ETH: 0.003,
    SOL: 0.01,
    TRX: 1000,
    DOGE: 7,
};

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

const currencies = [
    { id: 1, name: 'Российский рубль', symbol: 'RUB', icon: '₽' },
    { id: 2, name: 'Доллар США', symbol: 'USD', icon: '$' },
    { id: 3, name: 'Евро', symbol: 'EUR', icon: '€' },
    { id: 4, name: 'Белорусский рубль', symbol: 'BYN', icon: 'Br' },//не работает
    { id: 5, name: 'Украинская гривна', symbol: 'UAH', icon: '₴' },
    { id: 6, name: 'Британский фунт', symbol: 'GBP', icon: '£' },
    { id: 7, name: 'Китайский юань', symbol: 'CNY', icon: '¥' },//не работает
    { id: 8, name: 'Казахстанский тенге', symbol: 'KZT', icon: '₸' },
    { id: 9, name: 'Узбекский сум', symbol: 'UZS', icon: 'сум' },//не работает
    { id: 10, name: 'Грузинский лари', symbol: 'GEL', icon: '₾' },
    { id: 11, name: 'Турецкая лира', symbol: 'TRY', icon: '₺' },
    { id: 12, name: 'Армянский драм', symbol: 'AMD', icon: '֏' },//не работает
    { id: 13, name: 'Таиландский бат', symbol: 'THB', icon: '฿' },
    { id: 14, name: 'Индийская рупия', symbol: 'INR', icon: '₹' },
    { id: 15, name: 'Бразильский реал', symbol: 'BRL', icon: 'R$' },
    { id: 16, name: 'Индонезийская рупия', symbol: 'IDR', icon: 'Rp' },
    { id: 17, name: 'Азербайджанский манат', symbol: 'AZN', icon: '₼' },//не работает
    { id: 18, name: 'Объединенные Арабские Эмираты дирхам', symbol: 'AED', icon: 'د.إ' },
    { id: 19, name: 'Польский злотый', symbol: 'PLN', icon: 'zł' },
    { id: 20, name: 'Израильский шекель', symbol: 'ILS', icon: '₪' },
    { id: 21, name: 'Киргизский сом', symbol: 'KGS', icon: 'с' },//не работает
    { id: 22, name: 'Таджикский сомони', symbol: 'TJS', icon: 'ЅМ' },//не работает
];

const api_url = 'https://min-api.cryptocompare.com';

const getCoinPrice = async (coin_id, currency) => {
    try {
        const response = await axios.get(`${api_url}/data/price`, {
            params: {
                fsym: coin_id,
                tsyms: currency,
            },
        });
        const data = response.data;
        const price = data[currency];
        if (price === undefined) {
            const priceFromCoincap = await getCoinPriceFromCoincap(coin_id, currency);
            return priceFromCoincap;
        }
        return price;
    } catch (error) {
        console.error(error);
    }
};

const getCoinPriceChange = async (coin_id, currency) => {
    try {
        const response = await axios.get(`${api_url}/data/histohour`, {
            params: {
                fsym: coin_id,
                tsym: currency,
                limit: 24,
            },
        });
        const data = response.data;
        const prices = data.Data;
        const currentPrice = prices[prices.length - 1].close;
        const previousPrice = prices[prices.length - 2].close;
        const priceChange = (currentPrice - previousPrice) / previousPrice * 100;
        return priceChange;
    } catch (error) {
        console.error(error);
    }
};

const getCoinPriceFromCoincap = async (coin_id, currency) => {
    try {
        const response = await axios.get(`https://api.coincap.io/v2/rates`);
        const data = response.data;
        const coin = data.data.find((coin) => coin.symbol === coin_id);
        const price = coin.rateUsd;
        return price;
    } catch (error) {
        console.error(error);
    }
};

function Home() {
    const [prices, setPrices] = useState({});
    const [priceChanges, setPriceChanges] = useState({});
    const [currentCurrency, setCurrentCurrency] = useState('USD');
    const [hideSmallBalances, setHideSmallBalances] = useState(false); // Состояние для фильтра
    const [hideAmounts, setHideAmounts] = useState(false); // Состояние для отображения сумм валют пользователя

    const toggleHideAmounts = () => {
        setHideAmounts((prev) => !prev); // Переключаем состояние отображения сумм валют пользователя
    };

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.currentCurrency) {
            setCurrentCurrency(location.state.currentCurrency);
        }
    }, [location.state?.currentCurrency]);

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