import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const SellPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [listing, setListing] = useState(null);
    const [amount, setAmount] = useState('');
    const [total, setTotal] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (location.state?.listing) {
            setListing(location.state.listing);
            // Set default payment details based on payment method
            if (location.state.listing.paymentMethods && location.state.listing.paymentMethods.length > 0) {
                const method = location.state.listing.paymentMethods[0];
                if (method === 'Тинькофф') {
                    setPaymentDetails('5536 9138 2846 1294');
                } else if (method === 'Сбербанк') {
                    setPaymentDetails('4276 8000 1234 5678');
                } else if (method === 'QIWI') {
                    setPaymentDetails('+7 (999) 123-45-67');
                } else if (method === 'ЮMoney') {
                    setPaymentDetails('4100 1234 5678 9101');
                } else {
                    setPaymentDetails('Запросите реквизиты у продавца');
                }
            }
            setLoading(false);
        } else {
            fetchListing();
        }
    }, [id, location.state]);

    const fetchListing = async () => {
        try {
            // In a real app, this would be a real API call
            const response = await fetch(`/api/p2p/listings/sell/${id}`);
            if (!response.ok) throw new Error('Failed to fetch listing');
            const data = await response.json();
            setListing(data);

            // Set default payment details based on payment method
            if (data.paymentMethods && data.paymentMethods.length > 0) {
                const method = data.paymentMethods[0];
                if (method === 'Тинькофф') {
                    setPaymentDetails('5536 9138 2846 1294');
                } else if (method === 'Сбербанк') {
                    setPaymentDetails('4276 8000 1234 5678');
                } else if (method === 'QIWI') {
                    setPaymentDetails('+7 (999) 123-45-67');
                } else if (method === 'ЮMoney') {
                    setPaymentDetails('4100 1234 5678 9101');
                } else {
                    setPaymentDetails('Запросите реквизиты у продавца');
                }
            }
        } catch (err) {
            setError('Не удалось загрузить объявление');
            console.error('Error fetching listing:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        setAmount(value);

        if (listing && !isNaN(value) && value !== '') {
            setTotal((parseFloat(value) * listing.price).toFixed(2));
        } else {
            setTotal('');
        }
    };

    const handleTotalChange = (e) => {
        const value = e.target.value;
        setTotal(value);

        if (listing && !isNaN(value) && value !== '') {
            setAmount((parseFloat(value) / listing.price).toFixed(8));
        } else {
            setAmount('');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(paymentDetails)
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    };

    const handleSell = () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError('Пожалуйста, укажите сумму');
            return;
        }

        // In a real app, this would create a deal via API
        navigate('/p2p/deals', {
            state: {
                newDeal: {
                    id: Date.now(),
                    status: 'active',
                    type: 'sell',
                    crypto: listing.crypto,
                    amount: parseFloat(amount),
                    price: listing.price,
                    totalPrice: parseFloat(total),
                    currency: listing.currency,
                    counterparty: listing.user.name,
                    date: new Date().toISOString(),
                    paymentDetails: paymentDetails
                }
            }
        });
    };

    const handleBack = () => {
        navigate(-1);
    };

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-center text-red-500">
                    <i className="fas fa-exclamation-circle text-3xl mb-2" />
                    <p>Объявление не найдено</p>
                </div>
            </div>
        );
    }

    const isButtonActive = amount && parseFloat(amount) > 0;
    const selectedPaymentMethod = listing.paymentMethods && listing.paymentMethods.length > 0
        ? listing.paymentMethods[0]
        : 'Не указан';

    return (
        <div className="min-h-screen bg-gray-900 p-4 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={handleBack} className="text-gray-400 hover:text-white">
                    <i className="fas fa-arrow-left text-xl" />
                </button>
                <h2 className="text-xl font-bold">Продать {listing.crypto}</h2>
                <div className="w-8"></div> {/* For centering the title */}
            </div>

            {error && (
                <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {/* Main Card */}
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <div className="flex items-center mb-4">
                    <span className="text-sm">
                        Вы продаете <span className="font-bold">{listing.user.name}</span>
                    </span>
                </div>

                <div className="mb-4">
                    <input
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0"
                        className="w-full bg-transparent text-5xl font-bold focus:outline-none"
                    />
                    <span className="text-3xl text-gray-500 ml-2">
                        {listing.crypto}
                    </span>
                </div>

                <div className="text-gray-500 mb-4">
                    Цена за 1 {listing.crypto} ≈ {listing.price} {listing.currency}
                </div>

                <div className="flex items-center justify-between mb-4">
                    <span className="text-md">Доступный баланс</span>
                    <span className="text-gray-500">0 {listing.crypto}</span>
                </div>

                <div className="w-full border-b border-gray-600 opacity-50 mb-4"></div>

                <div className="flex items-center justify-between mb-4">
                    <span className="text-md">Метод оплаты</span>
                    <span className="text-blue-600">
                        {selectedPaymentMethod}
                    </span>
                </div>

                <div className="w-full border-b border-gray-600 opacity-50 mb-4"></div>

                {/* Payment Details Section */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-md">Реквизиты для оплаты</span>
                        {copySuccess && (
                            <span className="text-green-500 text-sm">Скопировано!</span>
                        )}
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                        <span className="text-white font-mono">{paymentDetails}</span>
                        <button
                            className="text-blue-500 ml-2"
                            onClick={copyToClipboard}
                        >
                            <i className="fas fa-copy"></i>
                        </button>
                    </div>
                </div>

                <div className="w-full border-b border-gray-600 opacity-50 mb-4"></div>

                <div className="flex items-center justify-between mb-4">
                    <span className="text-md">Лимиты</span>
                    <span className="text-gray-500">
                        {listing.minAmount || '0'} ~ {listing.maxAmount || 'неограничено'} {listing.currency}
                    </span>
                </div>

                <div className="w-full border-b border-gray-600 opacity-50 mb-4"></div>

                <div
                    className="text-md mb-2 flex items-center justify-between cursor-pointer"
                    onClick={toggleDetails}
                >
                    Детали объявления
                    <i className={`fas fa-chevron-${showDetails ? 'down' : 'right'} ml-2 mr-2`}></i>
                </div>

                {showDetails && (
                    <div className="mt-4 text-sm text-gray-400">
                        <p className="mb-2">Продавец: {listing.user.name}</p>
                        <p className="mb-2">Завершенных сделок: {listing.user.deals}</p>
                        <p className="mb-2">Цена: {listing.price} {listing.currency}</p>
                        <p>Доступно: {listing.availableAmount || listing.available} {listing.crypto}</p>
                    </div>
                )}
            </div>

            {/* Instructions Card */}
            <div className="bg-gray-800 pl-4 p-3 rounded-lg mb-4">
                <div className="text-gray-500 text-sm">
                    Инструкция от {listing.user.name}
                </div>
                <div className="text-md">
                    {listing.instructions || 'Отправитель должен совпадать с именем аккаунта. Укажите номер сделки в комментарии к платежу.'}
                </div>
            </div>

            {/* Warning */}
            <div className="flex items-center text-yellow-500 text-sm mb-4">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                <span>
                    Только мошенники предлагают общение и проведение сделок вне P2P Маркета.
                </span>
            </div>

            {/* Action Button */}
            <button
                onClick={handleSell}
                disabled={!isButtonActive}
                className={`w-full py-3 rounded-lg fixed bottom-4 left-4 right-4 ${
                    isButtonActive
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
            >
                {isButtonActive
                    ? `Продать ${amount} ${listing.crypto} за ${total} ${listing.currency}`
                    : 'Введите сумму для продажи'}
            </button>
        </div>
    );
};

export default SellPage;