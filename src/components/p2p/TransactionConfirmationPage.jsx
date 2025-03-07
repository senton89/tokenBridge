import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const TransactionPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [listing, setListing] = useState(null);
    const [timeLeft, setTimeLeft] = useState(176); // 2:56 in seconds
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (location.state?.listing) {
            setListing(location.state.listing);
            setLoading(false);
        } else {
            fetchListing();
        }
    }, [id, location.state]);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);

    const fetchListing = async () => {
        try {
            // In a real app, this would be an API call
            const response = await fetch(`/api/p2p/listings/${id}`);
            if (!response.ok) throw new Error('Failed to fetch listing');
            const data = await response.json();
            setListing(data);
        } catch (err) {
            setError('Не удалось загрузить данные объявления');
            console.error('Error fetching listing:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCreateDeal = () => {
        navigate(`/p2p/payment-confirmation`, {
            state: {
                newDeal: {
                    id: Date.now(),
                    status: 'active',
                    type: listing.type === 'buy' ? 'sell' : 'buy',
                    crypto: listing.crypto,
                    amount: location.state?.amount || 10.085728,
                    price: listing.price,
                    totalPrice: location.state?.total || 1000,
                    currency: listing.currency,
                    counterparty: {
                        name: listing.user.name,
                        avatar: listing.user.avatar,
                        deals: listing.user.deals,
                        rating: listing.user.rating
                    },
                    paymentMethod: listing.paymentMethods[0],
                    date: new Date().toISOString()
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-center text-red-500">
                    <i className="fas fa-exclamation-circle text-3xl mb-2" />
                    <p>{error || 'Объявление не найдено'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-4 min-h-screen bg-gray-900">
            <div className="flex items-center mb-4 justify-center">
                <span className="ml-1">
          Вы {listing.type === 'buy' ? 'продаёте' : 'покупаете у'}
          <span className="font-bold"> {listing.user.name}</span>
        </span>
            </div>

            <div className="text-center mb-4">
                <div className="text-4xl font-bold">
                    {location.state?.amount || '10,085728'}
                    <span className="text-gray-400"> {listing.crypto}</span>
                </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <div className="flex items-center mb-2">
                    <i className="fas fa-clock text-blue-500 mr-2"></i>
                    <span>Статус</span>
                </div>
                <div className="text-lg font-bold mb-2">
                    Сделка формируется
                </div>
                <div className="flex items-center mb-2">
                    <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                    <span>Внимание</span>
                </div>
                <div className="text-sm text-gray-400 mb-2">
                    Продавец должен подтвердить сделку в течение 10 минут после ее создания
                </div>
                <div className="text-sm text-gray-400">
                    Завершите создание сделки в течение {formatTime(timeLeft)}
                </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                    <span>Сумма</span>
                    <span>{location.state?.total || '1 000'} {listing.currency}</span>
                </div>
                <div className="w-full border-b border-gray-600 opacity-50 mb-2"></div>
                <div className="flex justify-between mb-2">
                    <span>Цена за 1 {listing.crypto}</span>
                    <span>{listing.price} {listing.currency}</span>
                </div>
                <div className="w-full border-b border-gray-600 opacity-50 mb-2"></div>
                <div className="flex justify-between mb-2">
                    <span>Метод оплаты</span>
                    <span>{listing.paymentMethods[0]}</span>
                </div>
                <div className="w-full border-b border-gray-600 opacity-50 mb-2"></div>
                <div className="flex justify-between">
                    <span>Оплатить в течение</span>
                    <span>15 мин</span>
                </div>
            </div>

            {listing.terms && (
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                    <div className="flex items-center mb-2">
                        <i className="fas fa-comment text-white mr-2"></i>
                        <span>Комментарий</span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                        {listing.terms || listing.autoReply || 'Быстрый обмен✅🤝 Сбер/Тиньк/СБП\nПолучатель Иван.М\nПри оплате от 3х лиц обязательно прислать чек!'}
                    </div>
                </div>
            )}

            <div className="flex items-center text-yellow-500 text-sm mb-4">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                <span>
          Только мошенники предлагают общение и проведение сделок вне P2P Маркета.
        </span>
            </div>

            <span className="text-md text-gray-400">ДАННЫЕ ПРОДАВЦА</span>
            <div className="bg-gray-800 p-4 rounded-lg mb-20 mt-2">
                <div className="flex justify-between mb-4">
                    <span>Имя {listing.type === 'buy' ? 'покупателя' : 'продавца'}</span>
                    <span>{listing.user.name}</span>
                </div>
                <div className="w-full border-b border-gray-600 opacity-50 mb-4"></div>
                <div className="flex justify-between">
                    <span>Статистика торгов</span>
                    <span>сделок: {listing.user.deals}</span>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900">
                <button
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg w-full text-md font-bold"
                    onClick={handleCreateDeal}
                >
                    СОЗДАТЬ СДЕЛКУ
                </button>
            </div>
        </div>
    );
};

export default TransactionPage;