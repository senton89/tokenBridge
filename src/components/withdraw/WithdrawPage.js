import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { walletApi } from '../../services/api';
import InsufficientFundsPage from './InsufficientFundsPage';

// Comment Modal Component
const CommentModal = ({ isOpen, onClose, comment, setComment, onSave }) => {
    if (!isOpen) return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [remainingChars, setRemainingChars] = useState(50 - comment.length);

    const handleChange = (e) => {
        const value = e.target.value;
        if (value.length <= 50) {
            setComment(value);
            setRemainingChars(50 - value.length);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Добавить комментарий</h1>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <p className="text-sm text-gray-400 mb-4">
                    Введите комментарий или текст для получателя, который будет виден в блокчейне.
                </p>

                <textarea
                    className="w-full h-52 p-2 border border-blue-500 rounded-2xl bg-gray-800 text-white text-md"
                    maxLength="50"
                    value={comment}
                    onChange={handleChange}
                />

                <div className="text-md text-right text-gray-400 mt-4">
                    {remainingChars} символов
                </div>

                <button
                    onClick={() => {
                        onSave();
                        onClose();
                    }}
                    className="w-full mt-4 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-sm text-white font-bold rounded-2xl"
                >
                    СОХРАНИТЬ
                </button>
            </div>
        </div>
    );
};

const WithdrawPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currency } = location.state || { currency: 'TON' }; // Default to TON if not provided

    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [isAddressEnabled, setIsAddressEnabled] = useState(true);
    const [userBalances, setUserBalances] = useState({});
    const [minWithdrawalAmounts, setMinWithdrawalAmounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [exchangeRate, setExchangeRate] = useState(1);

    // New state for comment functionality
    const [comment, setComment] = useState('');
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch user balance
                const balanceResponse = await walletApi.getBalance();
                setUserBalances(balanceResponse.data);

                // Fetch minimum withdrawal amounts
                const minAmountsResponse = await walletApi.getMinWithdrawalAmounts();
                setMinWithdrawalAmounts(minAmountsResponse.data);

                // Fetch exchange rate
                try {
                    const response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${currency}&tsyms=USD`);
                    const data = await response.json();
                    setExchangeRate(data.USD || 1);
                } catch (err) {
                    console.error('Error fetching exchange rate:', err);
                    setExchangeRate(1); // Default fallback
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currency]);

    const handleWithdraw = async () => {
        if (!amount || !address) {
            setError('Пожалуйста, заполните все поля');
            return;
        }

        if (parseFloat(amount) < minWithdrawalAmounts[currency]) {
            setError(`Минимальная сумма вывода: ${minWithdrawalAmounts[currency]} ${currency}`);
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const response = await walletApi.createWithdrawal({
                currency,
                amount: parseFloat(amount),
                address,
                comment // Include comment in the withdrawal request
            });

            // Redirect to success page
            navigate('/withdraw/success', {
                state: {
                    currency,
                    amount,
                    address,
                    comment, // Pass comment to success page
                    txId: response.data.id
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

    const handleAddressChange = (e) => {
        setAddress(e.target.value);
    };

    const handleMaxClick = () => {
        // Calculate maximum possible withdrawal amount (balance minus fee)
        const fee = minWithdrawalAmounts[currency] || 0;
        const maxAmount = Math.max(0, userBalances[currency] - fee);
        setAmount(maxAmount.toFixed(8));
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;

        // Allow only valid numeric input
        if (/^\d*\.?\d{0,8}$/.test(value) || value === '') {
            setAmount(value);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="text-white flex flex-col items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-4">Загрузка...</p>
            </div>
        );
    }

    // Проверяем, достаточно ли средств для вывода
    if (!loading && userBalances[currency] < minWithdrawalAmounts[currency]) {
        return <InsufficientFundsPage currency={currency} />;
    }

    const isValidAmount =
        amount !== '' &&
        parseFloat(amount) >= minWithdrawalAmounts[currency] &&
        parseFloat(amount) <= userBalances[currency] &&
        address.trim() !== '';

    return (
        <div className="text-white flex flex-col items-center justify-center mt-6">
            {error && (
                <div className="bg-red-500 text-white p-3 rounded-lg mb-4 w-full">
                    {error}
                </div>
            )}

            <div className="text-center flex flex-col items-center w-full pt-4 p-6">
                <div className="bg-gray-800 rounded-2xl pb-0 p-2 mb-2 w-full space-y-2 space-x-2">
                    <div className="flex justify-between mb-1">
                        <div className="rounded-full w-6 h-6 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-700 ml-2">
                            <i className="fas fa-arrow-up text-white text-sm mr-2 pl-2"></i>
                        </div>

                        <div className="flex justify-end w-full ml-1">
                            <span className="text-white text-lg mr-1 mt-1">Отправить:</span>
                            <input
                                type="text"
                                disabled={!isAddressEnabled}
                                value={address.length > 20 ? address.slice(0, 5) + '...' + address.slice(-10) : address}
                                onChange={handleAddressChange}
                                placeholder="Введите адрес кошелька"
                                className="text-gray-400 text-lg mr-6 mt-1 w-full bg-transparent outline-none appearance-none"
                                style={{
                                    color: 'inherit',
                                    WebkitAppearance: 'none',
                                    MozAppearance: 'textfield',
                                }}
                            />
                            <i
                                className="fas fa-pencil-alt text-blue-400 text-lg pt-1 pr-1 cursor-pointer"
                                onClick={() => setIsAddressEnabled(!isAddressEnabled)}
                            ></i>
                        </div>
                    </div>

                    <div className="border-b border-gray-600 opacity-30"></div>

                    <div className="flex justify-between">
                        <span className="text-gray-400 text-lg">Вывести</span>
                    </div>

                    <div className="flex">
                        <input
                            type="text"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="0.00"
                            className="text-gray-400 text-4xl font-bold w-full bg-transparent outline-none appearance-none"
                            style={{
                                color: 'inherit',
                                WebkitAppearance: 'none',
                                MozAppearance: 'textfield',
                            }}
                        />
                        <span className="text-gray-400 text-lg pt-4 pl-4">{currency}</span>
                    </div>

                    <div className="flex pb-2 text-sm">
            <span className="text-gray-400">
              Мин {minWithdrawalAmounts[currency]} Макс{' '}
                {(userBalances[currency] - minWithdrawalAmounts[currency]).toFixed(8)}
            </span>

                        <div className="flex items-center ml-auto">
                            <button className="text-blue-400 pr-6" onClick={handleMaxClick}>
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
                        ≈ {(parseFloat(amount || 0) * exchangeRate).toFixed(2)} USD
                    </div>

                    <div className="border-b border-gray-600 opacity-30"></div>

                    <div className="flex justify-between">
                        <span className="text-gray-400 ml-5">Комиссия</span>
                    </div>

                    <div className="flex justify-between ml-5">
            <span>
              {minWithdrawalAmounts[currency]} {currency}
            </span>
                        <span className="text-gray-400 mr-2">
              ≈ ${(minWithdrawalAmounts[currency] * exchangeRate).toFixed(2)}
            </span>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-2 mb-4 w-full text-lg">
                    <div className="flex justify-between text-gray-400">
                        <button
                            className="text-blue-400 px-2 rounded-xl flex items-center space-x-1"
                            onClick={() => setIsCommentModalOpen(true)}
                        >
                            <i className="far fa-comment-alt mr-2 mt-1"></i>
                            {comment ? 'Изменить комментарий' : 'Добавить комментарий'}
                        </button>
                    </div>

                    {comment && (
                        <div className="mt-2 p-2 bg-gray-700 rounded-lg text-sm">
                            {comment}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-2 w-full fixed bottom-0">
                <button
                    className={`w-full py-2 rounded-lg text-lg ${
                        isValidAmount && !submitting
                            ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!isValidAmount || submitting}
                    onClick={handleWithdraw}
                >
                    {submitting ? 'Отправка...' : 'Отправить'}
                </button>
            </div>

            {/* Comment Modal */}
            <CommentModal
                isOpen={isCommentModalOpen}
                onClose={() => setIsCommentModalOpen(false)}
                comment={comment}
                setComment={setComment}
                onSave={() => console.log('Comment saved:', comment)}
            />
        </div>
    );
};

export default WithdrawPage;