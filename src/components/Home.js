import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { walletApi, marketApi, listingsApi } from '../services/api';


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
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [showCoinMenu, setShowCoinMenu] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const handleCoinClick = (coin) => {
        setSelectedCoin(coin);
        setShowCoinMenu(true);
    };

// Add this function inside the Home component
    const handleCloseCoinMenu = () => {
        setShowCoinMenu(false);
    };

    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchCoins(),
                    fetchCurrencies(),
                    fetchUserBalance()
                ]);
            } catch (err) {
                console.error('Error initializing data:', err);
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, []);

    // Fetch coins list
    const fetchCoins = async () => {
        try {
            const response = await listingsApi.getCoins();
            setCoins(response.data);
            return response.data;
        } catch (err) {
            setError('Не удалось загрузить список монет');
            console.error('Error fetching coins:', err);
            return [];
        }
    };

    // Fetch currencies list
    const fetchCurrencies = async () => {
        try {
            const response = await listingsApi.getCurrencies();
            setCurrencies(response.data);
            return response.data;
        } catch (err) {
            setError('Не удалось загрузить список валют');
            console.error('Error fetching currencies:', err);
            return [];
        }
    };

    // Fetch user balance
    const fetchUserBalance = async () => {
        try {
            const response = await walletApi.getBalance();
            setUserBalances(response.data);
            return response.data;
        } catch (err) {
            setError('Не удалось загрузить баланс');
            console.error('Error fetching balance:', err);
            return {};
        }
    };

    // Fetch prices and price changes
    const fetchPricesAndChanges = async () => {
        try {
            // Get list of crypto symbols from user balances
            const cryptoSymbols = Object.keys(userBalances).length > 0
                ? Object.keys(userBalances)
                : coins.map(coin => coin.symbol);

            if (cryptoSymbols.length === 0) return;

            // Get prices
            const pricesResponse = await marketApi.getPrices(currentCurrency);
            setPrices(pricesResponse.data.data);

            // Get price changes
            const changesResponse = await marketApi.getPriceChanges(cryptoSymbols.join(','));
            setPriceChanges(changesResponse.data);
        } catch (err) {
            console.error('Error fetching prices and changes:', err);
        }
    };

    // Загрузка цен криптовалют
    // Update prices when user balances or currency changes
    useEffect(() => {
        if (Object.keys(userBalances).length > 0 || coins.length > 0) {
            fetchPricesAndChanges();

            // Update prices every 30 seconds
            const intervalId = setInterval(fetchPricesAndChanges, 30000);
            return () => clearInterval(intervalId);
        }
    }, [userBalances, currentCurrency, coins]);

    // Update currency from location state if available
    useEffect(() => {
        if (location.state?.selectedCurrency) {
            setCurrentCurrency(location.state.selectedCurrency);
        }
    }, [location.state]);

    // Toggle visibility of amounts
    const toggleHideAmounts = () => {
        setHideAmounts(prev => !prev);
    };

    // Toggle visibility of small balances
    const toggleHideSmallBalances = () => {
        setHideSmallBalances(prev => !prev);
    };

    // Navigate to coin list with type parameter
    const handleCoinList = (type) => {
        navigate('/coinlist', {
            state: { type }
        });
    };

    // Navigate to currency selection
    const handleCurrencySelect = () => {
        navigate('/currencies', {
            state: { currentCurrency }
        });
    };

    // Filter coins based on hideSmallBalances setting
    const filteredCoins = hideSmallBalances
        ? coins.filter(coin => userBalances[coin.symbol] > 0)
        : coins;

    // Calculate total balance in current currency
    const calculateTotalBalance = () => {
        if (Object.keys(prices).length === 0) return 0;

        return Object.keys(userBalances).reduce((acc, symbol) => {
            const balance = userBalances[symbol] || 0;
            const price = prices[symbol] || 0;
            return acc + (balance * price);
        }, 0);
    };

    // Get currency symbol
    const getCurrencySymbol = () => {
        const currency = currencies.find(c => c.name === currentCurrency);
        return currency ? currency.symbol : '';
    };

    if (loading && coins.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="relative text-right p-1">
                <button className="text-gray-400 hover:text-blue-400 focus:outline-none">
                    <i className="fas fa-cog text-xl" onClick={() => navigate("/settings")}></i>
                </button>
            </div>

            <div className="p-1 mt-10">
                <div className="flex items-center justify-center mb-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold mb-1">
                            {hideAmounts ? (
                                `${getCurrencySymbol()} ***`
                            ) : (
                                loading ? 'Loading...' : (
                                    `${getCurrencySymbol()} ${calculateTotalBalance().toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}`
                                )
                            )}
                            <i
                                className={`fas ${hideAmounts ? 'fa-eye-slash' : 'fa-eye'} text-white opacity-50 pl-1 cursor-pointer`}
                                onClick={toggleHideAmounts}
                            ></i>
                        </div>
                        <div
                            className="text-gray-400 text-md cursor-pointer"
                            onClick={handleCurrencySelect}
                        >
                            Общий баланс в <span className="text-blue-400">{currentCurrency}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row justify-around gap-6 mt-12 m-2">
                    <div className="text-center flex flex-col items-center">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-1 cursor-pointer"
                            onClick={() => handleCoinList('deposit')}
                        >
                            <i className="fas fa-arrow-down text-white text-md"></i>
                        </div>
                        <div className="text-blue-500 font-bold text-sm">Пополнить</div>
                    </div>

                    <div className="text-center flex flex-col items-center mr-3">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-1 cursor-pointer"
                            onClick={() => handleCoinList('withdraw')}
                        >
                            <i className="fas fa-arrow-up text-white text-md"></i>
                        </div>
                        <div className="text-blue-500 font-bold text-sm">Вывести</div>
                    </div>

                    <div className="text-center flex flex-col items-center mr-3">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-1 cursor-pointer"
                            onClick={() => navigate('/exchange')}
                        >
                            <i className="fas fa-exchange-alt text-white text-md"></i>
                        </div>
                        <div className="text-blue-500 font-bold text-sm">Обмен</div>
                    </div>

                    <div className="text-center flex flex-col items-center mr-3">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-1 cursor-pointer"
                            onClick={() => navigate('/p2p')}
                        >
                            <i className="fas fa-sync-alt text-white text-md"></i>
                        </div>
                        <div className="text-blue-500 font-bold text-sm">P2P</div>
                    </div>
                </div>

                <div className="ml-1 mr-1 mb-4 mt-12">
                    <div className="flex justify-between text-gray-400 text-sm">
                        <div>АКТИВЫ</div>
                        <div
                            className="text-blue-400 cursor-pointer"
                            onClick={toggleHideSmallBalances}
                        >
                            {hideSmallBalances ? 'Показать все' : 'СКРЫТЬ МЕЛКИЕ БАЛАНСЫ'}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="ml-1 mr-1 mt-4">
                    {loading && filteredCoins.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {filteredCoins.map((coin, index) => (
                                <div key={coin.id}>
                                    <div
                                        className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-800 rounded-lg"
                                        onClick={() => navigate(`/coin/${coin.symbol}`)}
                                    >
                                        <div className="flex items-center">
                                            <div
                                                className="rounded-full w-12 h-12 flex items-center justify-center mr-3">
                                                <img alt={`${coin.name} logo`} className="w-12 h-12" src={coin.logo}/>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center">
                                                    <div className="text-lg">{coin.name}</div>
                                                </div>
                                                <div className="text-gray-400 text-sm">
                                                    {prices[coin.symbol] !== undefined && priceChanges[coin.symbol] !== undefined ? (
                                                        <span>
                              {getCurrencySymbol()} {prices[coin.symbol].toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}{' '}
                                                            <span
                                                                className={
                                                                    priceChanges[coin.symbol] === 0
                                                                        ? 'text-gray-500'
                                                                        : (priceChanges[coin.symbol] > 0 ? 'text-green-500' : 'text-red-500')
                                                                }
                                                            >
                                {priceChanges[coin.symbol] > 0 ? '+' : ''}
                                                                {priceChanges[coin.symbol].toFixed(2)}%
                              </span>
                            </span>
                                                    ) : (
                                                        'Loading...'
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-md">
                                                {hideAmounts
                                                    ? '***'
                                                    : ((userBalances[coin.symbol] || 0) === 0
                                                            ? '0'
                                                            : (userBalances[coin.symbol] || 0).toLocaleString('en-US', {
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 7
                                                            })
                                                    )
                                                } {coin.symbol}
                                            </div>
                                            <div className="text-gray-400 text-sm">
                                                {hideAmounts
                                                    ? '***'
                                                    : `${getCurrencySymbol()} ${
                                                        prices[coin.symbol] !== undefined
                                                            ? ((userBalances[coin.symbol] || 0) * prices[coin.symbol]).toLocaleString('en-US', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })
                                                            : 'Loading...'
                                                    }`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    {index < filteredCoins.length - 1 && (
                                        <div className="border-b border-gray-600 opacity-50 mb-2 ml-12"></div>
                                    )}
                                </div>
                            ))}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;