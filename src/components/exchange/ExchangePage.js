import React, {useState, useEffect, useCallback} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

const userBalances = {
    TON: 1,
    USDT: 500,
    NOT: 80,
    BTC: 0.00015,
    ETH: 0.003,
    SOL: 0.01,
    TRX: 1000,
    DOGE: 7,
};

const EXCHANGE_RATE_API = 'https://min-api.cryptocompare.com/data/price';

const ExchangePage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [fromCoin, setFromCoin] = useState(coins[0]);
    const [toCoin, setToCoin] = useState(coins[1]);
    const [amount, setAmount] = useState(0);
    const [result, setResult] = useState(0);
    const [exchangeRate, setExchangeRate] = useState(0);


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
        const url = `${EXCHANGE_RATE_API}?fsym=${fromCoin.symbol}&tsyms=${toCoin.symbol}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                const exchangeRate = data[toCoin.symbol];
                const resultAmount = amount * exchangeRate;
                setResult(formatNumber(resultAmount));
                setExchangeRate(exchangeRate);
            });
    };

    const updateAmount = (result) => {
        const url = `${EXCHANGE_RATE_API}?fsym=${toCoin.symbol}&tsyms=${fromCoin.symbol}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                const exchangeRate = data[fromCoin.symbol];
                const amountValue = result * exchangeRate;
                setAmount(formatNumber(amountValue));
                setExchangeRate(1 / exchangeRate);
            });
    };

    const updateExchangeRate = () => {
        const url = `${EXCHANGE_RATE_API}?fsym=${fromCoin.symbol}&tsyms=${toCoin.symbol}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                const exchangeRate = data[toCoin.symbol];
                setExchangeRate(exchangeRate);
            });
    };

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
        const intervalId = setInterval(updateExchangeRate, 1000);
        return () => clearInterval(intervalId);
    }, [fromCoin, toCoin]);

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