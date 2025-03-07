import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {walletApi, marketApi, listingsApi} from '../../services/api';

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
    const [error, setError] = useState(null);

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
                if (coinsResponse.data.length >= 2) {
                    setFromCoin(coinsResponse.data[0]);
                    setToCoin(coinsResponse.data[1]);
                }

                // Получаем баланс пользователя
                const balanceResponse = await walletApi.getBalance();
                setUserBalances(balanceResponse.data);

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
        try {
            const response = await marketApi.getExchangeRate({
                fromCurrency: fromCoin.symbol,
                toCurrency: toCoin.symbol
            });

            setExchangeRate(response.data.rate);
        } catch (err) {
            console.error('Error fetching exchange rate:', err);
        }
    };

    const handleAmountChange = (event) => {
        const value = event.target.value;
        if (value >= 0) {
            setAmount(value);
            updateResult(value);
        }
    };

    const handleResultChange = (event) => {
        const value = event.target.value;
        if (value >= 0) {
            setResult(value);
            updateAmount(value);
        }
    };

    const updateResult = (amount) => {
        if (!fromCoin || !toCoin || !amount) return;

        try {
            setLoading(true);
            marketApi.getExchangeRate({
                fromCurrency: fromCoin.symbol,
                toCurrency: toCoin.symbol
            })
                .then(response => {
                    const exchangeRate = response.data.rate;
                    const resultAmount = amount * exchangeRate;
                    setResult(formatNumber(resultAmount));
                    setExchangeRate(exchangeRate);
                })
                .catch(error => {
                    console.error('Error fetching exchange rate:', error);
                    setError('Не удалось получить курс обмена');
                })
                .finally(() => {
                    setLoading(false);
                });
        } catch (err) {
            console.error('Error in updateResult:', err);
            setLoading(false);
        }
    };

    const updateAmount = useCallback((result) => {
        if (!fromCoin || !toCoin || !result) return;

        try {
            setLoading(true);
            marketApi.getExchangeRate({
                fromCurrency: toCoin.symbol,
                toCurrency: fromCoin.symbol
            })
                .then(response => {
                    const exchangeRate = response.data.rate;
                    const amountValue = result / exchangeRate;
                    setAmount(formatNumber(amountValue));
                    setExchangeRate(1 / exchangeRate);
                })
                .catch(error => {
                    console.error('Error fetching exchange rate:', error);
                    setError('Не удалось получить курс обмена');
                })
                .finally(() => {
                    setLoading(false);
                });
        } catch (err) {
            console.error('Error in updateAmount:', err);
            setLoading(false);
        }
    }, [fromCoin, toCoin]);

    const updateExchangeRate = useCallback(() => {
        if (!fromCoin || !toCoin) return;

        try {
            setLoading(true);
            marketApi.getExchangeRate({
                fromCurrency: fromCoin.symbol,
                toCurrency: toCoin.symbol
            })
                .then(response => {
                    const exchangeRate = response.data.rate;
                    setExchangeRate(exchangeRate);
                })
                .catch(error => {
                    console.error('Error fetching exchange rate:', error);
                    setError('Не удалось получить курс обмена');
                })
                .finally(() => {
                    setLoading(false);
                });
        } catch (err) {
            console.error('Error in updateExchangeRate:', err);
            setLoading(false);
        }
    }, [fromCoin, toCoin]);

    // Функция для форматирования числа (удаление лишних нулей)
    const formatNumber = (value) => {
        const num = Number(value);
        if (isNaN(num)) return 0; // Если значение не число, возвращаем 0
        return num.toFixed(8).replace(/\.?0+$/, ''); // Убираем лишние нули после запятой
    };

    const handleFromCoinChange = useCallback(() => {
        navigate('/coinlist', {
            state: {
                type: 'exchange',
                coinFrom: fromCoin,
                coinTo: toCoin,
                isFrom: true,
            },
        });
    }, [toCoin, navigate]);

    const handleToCoinChange = useCallback(() => {
        navigate('/coinlist', {
            state: {
                type: 'exchange',
                coinFrom: fromCoin,
                coinTo: toCoin,
                isFrom: false,
            },
        });
    }, [fromCoin, navigate]);

    useEffect(() => {
        if (location.state && location.state.coinFrom && location.state.coinTo) {
            console.log(location.state);
            const selectedCoin = coins.find((coin) => coin.symbol === location.state.currency);
            if (selectedCoin) {
                if (location.state.isFrom) {
                    setFromCoin(selectedCoin);
                    setToCoin(location.state.coinTo);
                } else {
                    setToCoin(selectedCoin);
                    setFromCoin(location.state.coinFrom);
                }
            }
        }
    }, [location.state, coins]);


    useEffect(() => {
        updateResult(amount);
        updateExchangeRate();
    }, [fromCoin, toCoin, amount]);

    return (
        <div className="flex h-screen">
            <div className="text-white flex flex-col justify-between m-4">
                <div className="p-1 mt-4">
                    <div className="flex justify-between items-center mb-1 space-y-4">
                        <span className="text-lg mt-4">Вы отправляете</span>
                        <div className="flex items-center space-x-1 text-lg">
                            <i className="far fa-credit-card text-gray-400"></i>
                            <span className="text-gray-400 font-bold">{userBalances[fromCoin.symbol]}</span>
                            <span
                                className="text-blue-400 font-semibold cursor-pointer"
                                onClick={() =>{ setAmount(userBalances[fromCoin.symbol]);
                                    handleAmountChange({ target: { value: userBalances[fromCoin.symbol] } });
                                }}
                            >
          МАКС
          </span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-1"
                             onClick={handleFromCoinChange}>
                            <img alt={fromCoin.name} className="w-12 h-12" src={fromCoin.logo}/>
                            <span className="text-lg">{fromCoin.symbol}</span>
                            <i className="fas fa-chevron-right"></i>
                        </div>
                        <input
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            className="font-bold w-full bg-transparent py-2 pl-8 text-right text-3xl"
                            placeholder="0"
                            min="0"
                            style={{
                                color: 'gray', // Цвет текста как у фона
                                caretColor: 'gray', // Цвет курсора как у фона
                                WebkitAppearance: 'none', // Убираем стрелочки в Safari
                                MozAppearance: 'textfield',
                                outline: 'none', // Убираем стрелочки в Firefox
                            }}
                        />
                    </div>
                    {amount > userBalances[fromCoin.symbol] ? (
                        <div className="text-red-500 text-lg text-right mb-2">
                            Недостаточный баланс. <span
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
                    ) : (<div></div>
                    )}
                    <div className="flex justify-center items-center mb-1">
                        <div className="w-full border-t border-gray-700"></div>
                        <i
                            className="fas fa-exchange-alt rotate-90 text-2xl opacity-50 mx-2"
                            onClick={() => {
                                const tempCoin = fromCoin;
                                setFromCoin(toCoin);
                                setToCoin(tempCoin);
                            }}
                        ></i>
                        <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-lg">Вы получаете</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-1"
                             onClick={handleToCoinChange}>
                            <img alt={toCoin.name} className="w-12 h-12" src={toCoin.logo} />
                            <span className="text-lg">{toCoin.symbol}</span>
                            <i className="fas fa-chevron-right"></i>
                        </div>
                        <input
                            type="number"
                            value={result}
                            onChange={handleResultChange}
                            className="font-bold w-full bg-transparent py-2 pl-8 text-right text-3xl"
                            placeholder="0"
                            min="0"
                            style={{
                                color: 'gray', // Цвет текста как у фона
                                caretColor: 'gray', // Цвет курсора как у фона
                                WebkitAppearance: 'none', // Убираем стрелочки в Safari
                                MozAppearance: 'textfield',
                                outline: 'none', // Убираем стрелочки в Firefox
                            }}
                        />
                    </div>
                    <div className="text-gray-400 text-lg mt-2 text-right">
                        1 {fromCoin.symbol} ≈ {formatNumber(exchangeRate)} {toCoin.symbol}
                    </div>
                </div>
                <div className="p-2">
                    <button
                        onClick={() => console.log('Продолжить')}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 rounded-lg text-lg mt-2"
                    >
                        Продолжить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExchangePage;