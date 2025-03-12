import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import { listingsApi } from "../services/api";

const CoinList = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const {
        type,
        coinTo,
        coinFrom,
        isFrom,
        returnPath,
        selectedCurrency,
        selectedPaymentMethod,
        amountFilter
    } = location.state || {};

    const fetchCoins = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await listingsApi.getCoins();

            if (response && response.data) {
                setCoins(response.data);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching coins:', err);
            setError('Не удалось загрузить список монет. ' + (err.response?.data?.message || err.message));

            // Implement retry logic (max 3 retries)
            if (retryCount < 3) {
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                }, 2000); // Retry after 2 seconds
            }
        } finally {
            setLoading(false);
        }
    }, [retryCount]);

    useEffect(() => {
        fetchCoins();
    }, [fetchCoins]);

// Handle retry button click
    const handleRetry = () => {
        setRetryCount(0);
        fetchCoins();
    };

    // Loading state with better UI
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-400">Загрузка списка монет...</p>
            </div>
        );
    }

    // Error state with retry button
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <div className="text-red-500 text-center mb-4">{error}</div>
                <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Попробовать снова
                </button>
            </div>
        );
    }


    let title;
    let link;

    switch (type) {
        case 'deposit':
            title = 'ПОПОЛНЕНИЕ КРИПТОВАЛЮТЫ';
            link = '/deposit';
            break;
        case 'withdraw':
            title = 'ВЫВОД КРИПТОВАЛЮТЫ';
            link = '/withdraw';
            break;
        case 'exchange':
            title = 'ОБМЕН КРИПТОВАЛЮТЫ';
            link = '/exchange';
            break;
        case 'p2p':
            title = 'ВЫБОР КРИПТОВАЛЮТЫ';
            link = returnPath || '/p2p/buy';
            break;
        default:
            title = 'ВЫБОР КРИПТОВАЛЮТЫ';
            link = '/';
    }

    // Filter coins based on selection context
    const filteredCoins = coins.filter((coin) => {
        if (!isFrom) {
            return !coinFrom || coin.symbol !== coinFrom.symbol;
        } else {
            return !coinTo || coin.symbol !== coinTo.symbol;
        }
    });

    // Handle coin selection
    const handleCoinClick = (coin) => {
        if (type === 'p2p') {
            navigate(link, {
                state: {
                    selectedCrypto: coin.symbol,
                    selectedCurrency,
                    selectedPaymentMethod,
                    amountFilter
                }
            });
        } else if (type === 'exchange') {
            navigate(link, {
                state: {
                    type: 'exchange',
                    currency: coin.symbol,
                    isFrom,
                    coinTo,
                    coinFrom
                }
            });
        } else {
            navigate(link, {
                state: {
                    currency: coin.symbol
                }
            });
        }
    };



    return (
        <div className="p-1 mt-6">
            <div className="text-md font-bold mb-6 text-gray-400">{title}</div>

            {filteredCoins.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                    Нет доступных монет для выбора
                </div>
            ) : (
                <div className="flex flex-col">
                    {filteredCoins.map((coin, index) => (
                        <div key={coin.id || index}>
                            <button
                                onClick={() => handleCoinClick(coin)}
                                className="flex items-center justify-between w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <div className="flex items-center">
                                    <div className="rounded-full w-10 h-10 flex items-center justify-center mr-3">
                                        {coin.logo ? (
                                            <img
                                                alt={`${coin.name} logo`}
                                                className="w-10 h-10 rounded-full"
                                                src={coin.logo}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/fallback-coin.png'; // Fallback image
                                                }}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                {coin.symbol?.charAt(0) || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-md font-medium">{coin.symbol}</div>
                                        <div className="text-gray-400 text-xs">{coin.name}</div>
                                    </div>
                                </div>
                                <div className="text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </button>

                            {index < filteredCoins.length - 1 && (
                                <div className="border-b border-gray-200 dark:border-gray-700 opacity-50 my-2 ml-16"></div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CoinList;