import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { walletApi, marketApi, listingsApi } from '../../services/api';

const ExchangePage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [coins, setCoins] = useState([]);
    const [fromCoin, setFromCoin] = useState(null);
    const [toCoin, setToCoin] = useState(null);
    const [amount, setAmount] = useState('');
    const [result, setResult] = useState('');
    const [exchangeRate, setExchangeRate] = useState(0);
    const [userBalances, setUserBalances] = useState({});
    const [availableCoins, setAvailableCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exchangeLoading, setExchangeLoading] = useState(false);
    const [error, setError] = useState(null);
    const [exchangeError, setExchangeError] = useState(null);


    useEffect(() => {
        const fetchCoins = async () => {
            try {
                setLoading(true);
                const response = await listingsApi.getCoins();
                setCoins(response.data);
            } catch (err) {
                console.error('Error fetching coins:', err);
                setError('Не удалось загрузить список монет');
            } finally {
                setLoading(false);
            }
        };

        fetchCoins();
    }, []);

    // Загрузка доступных монет и баланса пользователя
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // Получаем список доступных монет
                const coinsResponse = await walletApi.getAvailableCoins();
                setAvailableCoins(coinsResponse.data);

                // Устанавливаем начальные монеты
                if (coinsResponse.data && coinsResponse.data.length >= 2) {
                    setFromCoin(coinsResponse.data[0]);
                    setToCoin(coinsResponse.data[1]);
                }

                // Получаем баланс пользователя
                const balanceResponse = await walletApi.getBalance();
                setUserBalances(balanceResponse.data || {});

                setLoading(false);
            } catch (err) {
                setError('Не удалось загрузить данные');
                console.error('Error fetching initial data:', err);
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Обновление курса обмена при изменении монет
    useEffect(() => {
        if (fromCoin && toCoin) {
            fetchExchangeRate();
        }
    }, [fromCoin, toCoin]);

    const fetchExchangeRate = async () => {
        if (!fromCoin || !toCoin) return;

        try {
            const response = await marketApi.getExchangeRate({
                fromCurrency: fromCoin.symbol,
                toCurrency: toCoin.symbol
            });

            setExchangeRate(response.data.rate);

            // If amount is set, update the result
            if (amount) {
                const resultAmount = amount * response.data.rate;
                setResult(formatNumber(resultAmount));
            }
        } catch (err) {
            console.error('Error fetching exchange rate:', err);
            setExchangeError('Не удалось получить курс обмена');
        }
    };

    const handleAmountChange = (event) => {
        const value = event.target.value;
        if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
            setAmount(value);
            updateResult(value);
        }
    };


    const handleResultChange = (event) => {
        const value = event.target.value;
        if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
            setResult(value);
            updateAmount(value);
        }
    };

    const updateResult = (amount) => {
        if (!fromCoin || !toCoin || !amount) {
            setResult('');
            return;
        }

        try {
            setExchangeLoading(true);
            marketApi.getExchangeRate({
                fromCurrency: fromCoin.symbol,
                toCurrency: toCoin.symbol
            })
                .then(response => {
                    const exchangeRate = response.data.rate;
                    const resultAmount = amount * exchangeRate;
                    setResult(formatNumber(resultAmount));
                    setExchangeRate(exchangeRate);
                    setExchangeError(null);
                })
                .catch(error => {
                    console.error('Error fetching exchange rate:', error);
                    setExchangeError('Не удалось получить курс обмена');
                })
                .finally(() => {
                    setExchangeLoading(false);
                });
        } catch (err) {
            console.error('Error in updateResult:', err);
            setExchangeLoading(false);
        }
    };

    const updateAmount = useCallback((result) => {
        if (!fromCoin || !toCoin || !result) {
            setAmount('');
            return;
        }

        try {
            setExchangeLoading(true);
            marketApi.getExchangeRate({
                fromCurrency: toCoin.symbol,
                toCurrency: fromCoin.symbol
            })
                .then(response => {
                    const inverseRate = response.data.rate;
                    const amountValue = result * inverseRate;
                    setAmount(formatNumber(amountValue));
                    setExchangeRate(1 / inverseRate);
                    setExchangeError(null);
                })
                .catch(error => {
                    console.error('Error fetching exchange rate:', error);
                    setExchangeError('Не удалось получить курс обмена');
                })
                .finally(() => {
                    setExchangeLoading(false);
                });
        } catch (err) {
            console.error('Error in updateAmount:', err);
            setExchangeLoading(false);
        }
    }, [fromCoin, toCoin]);

    const formatNumber = (value) => {
        const num = Number(value);
        if (isNaN(num)) return '0';
        return num.toFixed(8).replace(/\.?0+$/, '');
    };

    // const updateExchangeRate = useCallback(() => {
    //     if (!fromCoin || !toCoin) return;
    //
    //     try {
    //         setLoading(true);
    //         marketApi.getExchangeRate({
    //             fromCurrency: fromCoin.symbol,
    //             toCurrency: toCoin.symbol
    //         })
    //             .then(response => {
    //                 const exchangeRate = response.data.rate;
    //                 setExchangeRate(exchangeRate);
    //             })
    //             .catch(error => {
    //                 console.error('Error fetching exchange rate:', error);
    //                 setError('Не удалось получить курс обмена');
    //             })
    //             .finally(() => {
    //                 setLoading(false);
    //             });
    //     } catch (err) {
    //         console.error('Error in updateExchangeRate:', err);
    //         setLoading(false);
    //     }
    // }, [fromCoin, toCoin]);
    //
    // // Функция для форматирования числа (удаление лишних нулей)
    // const formatNumber = (value) => {
    //     const num = Number(value);
    //     if (isNaN(num)) return 0; // Если значение не число, возвращаем 0
    //     return num.toFixed(8).replace(/\.?0+$/, ''); // Убираем лишние нули после запятой
    // };


    const handleFromCoinChange = useCallback(() => {
        navigate('/coinlist', {
            state: {
                type: 'exchange',
                coinFrom: fromCoin,
                coinTo: toCoin,
                isFrom: true,
            },
        });
    }, [fromCoin, toCoin, navigate]);


    const handleToCoinChange = useCallback(() => {
        navigate('/coinlist', {
            state: {
                type: 'exchange',
                coinFrom: fromCoin,
                coinTo: toCoin,
                isFrom: false,
            },
        });
    }, [fromCoin, toCoin, navigate]);

// Handle returning from CoinList page
    useEffect(() => {
        if (location.state && location.state.type === 'exchange') {
            const { currency, isFrom } = location.state;

            if (currency) {
                // Find the selected coin in the available coins array
                const selectedCoin = availableCoins.find(coin => coin.symbol === currency);

                if (selectedCoin) {
                    if (isFrom) {
                        setFromCoin(selectedCoin);
                    } else {
                        setToCoin(selectedCoin);
                    }
                }
            }
        }
    }, [location.state, availableCoins]);

    // useEffect(() => {
    //     if (location.state && location.state.coinFrom && location.state.coinTo) {
    //         console.log(location.state);
    //         const selectedCoin = coins.find((coin) => coin.symbol === location.state.currency);
    //         if (selectedCoin) {
    //             if (location.state.isFrom) {
    //                 setFromCoin(selectedCoin);
    //                 setToCoin(location.state.coinTo);
    //             } else {
    //                 setToCoin(selectedCoin);
    //                 setFromCoin(location.state.coinFrom);
    //             }
    //         }
    //     }
    // }, [location.state, coins]);

    const handleExchange = async () => {
        if (!fromCoin || !toCoin || !amount || !result) {
            setExchangeError('Пожалуйста, заполните все поля');
            return;
        }

        if (parseFloat(amount) > userBalances[fromCoin.symbol]) {
            setExchangeError('Недостаточно средств для обмена');
            return;
        }

        try {
            setExchangeLoading(true);

            const exchangeData = {
                fromCurrency: fromCoin.symbol,
                toCurrency: toCoin.symbol,
                fromAmount: parseFloat(amount),
                toAmount: parseFloat(result)
            };

            const response = await walletApi.exchangeCurrency(exchangeData);

            // Handle successful exchange
            if (response.data) {
                // Update balances
                const balanceResponse = await walletApi.getBalance();
                setUserBalances(balanceResponse.data || {});

                // Reset form
                setAmount('');
                setResult('');

                // Show success message or navigate to success page
                navigate('/exchange/success', {
                    state: {
                        transaction: response.data,
                        fromCoin,
                        toCoin
                    }
                });
            }
        } catch (err) {
            console.error('Error during exchange:', err);
            setExchangeError(err.response?.data?.message || 'Ошибка при выполнении обмена');
        } finally {
            setExchangeLoading(false);
        }
    };

    const handleSwapCoins = () => {
        const tempCoin = fromCoin;
        setFromCoin(toCoin);
        setToCoin(tempCoin);

        // Also swap the values
        if (amount) {
            setAmount(result);
            setResult(amount);
        }
    };

    if (loading && (!fromCoin || !toCoin)) {
        return (
            <div className="flex h-screen justify-center items-center">
                Loading...
            </div>
        );
    }


    if (!fromCoin || !toCoin) {
        return (
            <div className="flex h-screen justify-center items-center text-white">
                <div className="text-center">
                    <p className="text-xl mb-4">Нет доступных монет для обмена</p>
                    <button
                        onClick={() => navigate('/wallet')}
                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-4 rounded-lg"
                    >
                        Вернуться в кошелек
                    </button>
                </div>
            </div>
        );
    }


    // useEffect(() => {
    //     updateResult(amount);
    //     updateExchangeRate();
    // }, [fromCoin, toCoin, amount]);

    return (
        <div className="flex h-screen">
            <div className="text-white flex flex-col justify-between m-4 w-full max-w-md mx-auto">
                <div className="p-1 mt-4">
                    <div className="flex justify-between items-center mb-1 space-y-4">
                        <span className="text-lg mt-4">Вы отправляете</span>
                        <div className="flex items-center space-x-1 text-lg">
                            <i className="far fa-credit-card text-gray-400"></i>
                            <span className="text-gray-400 font-bold">
                {userBalances[fromCoin.symbol] ? formatNumber(userBalances[fromCoin.symbol]) : '0'}
              </span>
                            <span
                                className="text-blue-400 font-semibold cursor-pointer"
                                onClick={() => {
                                    if (userBalances[fromCoin.symbol]) {
                                        const maxBalance = userBalances[fromCoin.symbol];
                                        setAmount(formatNumber(maxBalance));
                                        updateResult(maxBalance);
                                    }
                                }}
                            >
                МАКС
              </span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                        <div
                            className="flex items-center space-x-1 cursor-pointer"
                            onClick={handleFromCoinChange}
                        >
                            <img alt={fromCoin.name} className="w-12 h-12" src={fromCoin.logo} />
                            <span className="text-lg">{fromCoin.symbol}</span>
                            <i className="fas fa-chevron-right"></i>
                        </div>
                        <input
                            type="text"
                            value={amount}
                            onChange={handleAmountChange}
                            className="font-bold w-full bg-transparent py-2 pl-8 text-right text-3xl"
                            placeholder="0"
                            style={{
                                color: 'white',
                                caretColor: 'white',
                                WebkitAppearance: 'none',
                                MozAppearance: 'textfield',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {amount && parseFloat(amount) > (userBalances[fromCoin.symbol] || 0) ? (
                        <div className="text-red-500 text-lg text-right mb-2">
                            Недостаточный баланс.{' '}
                            <span
                                className="text-blue-500 cursor-pointer"
                                onClick={() =>
                                    navigate('/deposit', {
                                        state: { currency: fromCoin.symbol },
                                    })
                                }
                            >
                Пополнить
              </span>
                        </div>
                    ) : null}

                    <div className="flex justify-center items-center mb-1">
                        <div className="w-full border-t border-gray-700"></div>
                        <i
                            className="fas fa-exchange-alt rotate-90 text-2xl opacity-50 mx-2 cursor-pointer"
                            onClick={handleSwapCoins}
                        ></i>
                        <div className="w-full border-t border-gray-700"></div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                        <span className="text-lg">Вы получаете</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <div
                            className="flex items-center space-x-1 cursor-pointer"
                            onClick={handleToCoinChange}
                        >
                            <img alt={toCoin.name} className="w-12 h-12" src={toCoin.logo} />
                            <span className="text-lg">{toCoin.symbol}</span>
                            <i className="fas fa-chevron-right"></i>
                        </div>
                        <input
                            type="text"
                            value={result}
                            onChange={handleResultChange}
                            className="font-bold w-full bg-transparent py-2 pl-8 text-right text-3xl"
                            placeholder="0"
                            style={{
                                color: 'white',
                                caretColor: 'white',
                                WebkitAppearance: 'none',
                                MozAppearance: 'textfield',
                                outline: 'none',
                            }}
                        />
                    </div>

                    <div className="text-gray-400 text-lg mt-2 text-right">
                        1 {fromCoin.symbol} ≈ {formatNumber(exchangeRate)} {toCoin.symbol}
                    </div>

                    {exchangeError && (
                        <div className="text-red-500 text-lg text-center mt-4">
                            {exchangeError}
                        </div>
                    )}
                </div>

                <div className="p-2">
                    <button
                        onClick={handleExchange}
                        disabled={
                            exchangeLoading ||
                            !amount ||
                            !result ||
                            parseFloat(amount) > (userBalances[fromCoin.symbol] || 0)
                        }
                        className={`w-full py-2 rounded-lg text-lg mt-2 ${
                            exchangeLoading ||
                            !amount ||
                            !result ||
                            parseFloat(amount) > (userBalances[fromCoin.symbol] || 0)
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-blue-700 text-white cursor-pointer'
                        }`}
                    >
                        {exchangeLoading ? 'Обработка...' : 'Обменять'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExchangePage;