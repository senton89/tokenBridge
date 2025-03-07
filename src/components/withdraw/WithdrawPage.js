import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { walletApi } from '../../services/api';
import InsufficientFundsPage from './InsufficientFundsPage';

const WithdrawPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currency } = location.state || {};
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [userBalances, setUserBalances] = useState({});
    const [minWithdrawalAmounts, setMinWithdrawalAmounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserBalance();
    }, []);

    const fetchUserBalance = async () => {
        try {
            const response = await walletApi.getBalance();
            setUserBalances(response.data);
        } catch (err) {
            console.error('Error fetching balance:', err);
        }
    };

    useEffect(() => {
        const fetchMinWithdrawalAmounts = async () => {
            try {
                setLoading(true);
                const response = await walletApi.getMinWithdrawalAmounts();
                setMinWithdrawalAmounts(response.data);
            } catch (err) {
                console.error('Error fetching min withdrawal amounts:', err);
                setError('Не удалось загрузить минимальные суммы вывода');
            } finally {
                setLoading(false);
            }
        };

        fetchMinWithdrawalAmounts();
    }, []);

    const handleWithdraw = async () => {
        if (!amount || !address) {
            setError('Пожалуйста, заполните все поля');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const response = await walletApi.createWithdrawal({
                currency,
                amount: parseFloat(amount),
                address
            });

            // Перенаправляем на страницу успешного вывода
            navigate('/withdraw/success', {
                state: {
                    currency,
                    amount,
                    address,
                    txId: response.data.txId
                }
            });
        } catch (err) {
            console.error('Error creating withdrawal:', err);

            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Не удалось создать запрос на вывод. Пожалуйста, попробуйте позже.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Проверяем, достаточно ли средств для вывода
    if (!loading && userBalances[currency] < minWithdrawalAmounts[currency]) {
        return <InsufficientFundsPage currency={currency} />;
    }

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