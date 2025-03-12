import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { p2pApi } from '../../services/api';

const DealDetailsPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [deal, setDeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    // Get deal from location state or fetch it
    useEffect(() => {
        if (location.state?.selectedDeal) {
            setDeal(location.state.selectedDeal);
            setLoading(false);

            // If deal is active, calculate time left for payment
            if (location.state.selectedDeal.status === 'active') {
                calculateTimeLeft(location.state.selectedDeal);
            }
        } else {
            fetchDeal();
        }
    }, [id, location.state]);

    // Fetch deal data from API
    const fetchDeal = async () => {
        try {
            setLoading(true);
            const response = await p2pApi.getDealDetails(id);
            const data = response.data;
            setDeal(data);

            // If deal is active, calculate time left for payment
            if (data.status === 'active') {
                calculateTimeLeft(data);
            }
        } catch (err) {
            setError('Не удалось загрузить данные сделки');
            console.error('Error fetching deal:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate time left for payment
    const calculateTimeLeft = (dealData) => {
        const startTime = new Date(dealData.date).getTime();
        const timeLimit = dealData.timeLimit * 60 * 1000; // convert minutes to milliseconds
        const endTime = startTime + timeLimit;
        const now = new Date().getTime();

        const remaining = endTime - now;

        if (remaining > 0) {
            setTimeLeft(Math.floor(remaining / 60000)); // convert to minutes

            // Update time left every minute
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 60000);

            return () => clearInterval(timer);
        } else {
            setTimeLeft(0);
        }
    };

    // Handle confirming payment (for buyer)
    const handleConfirmPayment = async () => {
        try {
            await p2pApi.confirmPayment(id);
            // Refresh deal data
            await fetchDeal();
        } catch (err) {
            setError('Не удалось подтвердить оплату');
            console.error('Error confirming payment:', err);
        }
    };

    // Handle releasing crypto (for seller)
    const handleReleaseCrypto = async () => {
        try {
            await p2pApi.releaseCrypto(id);
            // Refresh deal data
            await fetchDeal();
        } catch (err) {
            setError('Не удалось выпустить криптовалюту');
            console.error('Error releasing crypto:', err);
        }
    };

    // Handle cancelling the deal
    const handleCancelDeal = async () => {
        if (!window.confirm('Вы уверены, что хотите отменить сделку?')) {
            return;
        }

        try {
            const reason = prompt('Укажите причину отмены сделки:');
            if (reason === null) return; // User cancelled the prompt

            await p2pApi.cancelDeal(id, reason);
            // Refresh deal data
            await fetchDeal();
        } catch (err) {
            setError('Не удалось отменить сделку');
            console.error('Error cancelling deal:', err);
        }
    };

    const handleCreateAppeal = async () => {
        try {
            const reason = prompt('Укажите причину апелляции:');
            if (reason === null) return; // User cancelled the prompt

            await p2pApi.createAppeal(id, reason);
            alert('Апелляция создана успешно');
        } catch (err) {
            setError('Не удалось создать апелляцию');
            console.error('Error creating appeal:', err);
        }
    };

    // Handle back button
    const handleBack = () => {
        navigate('/p2p/deals');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!deal) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-center text-red-500">
                    <i className="fas fa-exclamation-circle text-3xl mb-2" />
                    <p>Сделка не найдена</p>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-yellow-500';
            case 'completed': return 'text-green-500';
            case 'cancelled': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return 'fa-clock';
            case 'completed': return 'fa-check-circle';
            case 'cancelled': return 'fa-times-circle';
            default: return 'fa-question-circle';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'В процессе';
            case 'completed': return 'Завершена';
            case 'cancelled': return 'Отменена';
            default: return 'Неизвестно';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2">
                            {deal.type === 'buy' ? 'Покупка' : 'Продажа'} {deal.crypto}
                        </h2>
                        <p className="text-gray-400">Детали сделки</p>
                    </div>
                    <button onClick={handleBack} className="text-gray-400 hover:text-white">
                        <i className="fas fa-times text-xl" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {/* Status and Deal Info */}
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
                <div className="flex items-center mb-4">
                    <i className={`fas ${getStatusIcon(deal.status)} ${getStatusColor(deal.status)} text-lg mr-2`} />
                    <span className={`${getStatusColor(deal.status)}`}>
            {getStatusText(deal.status)}
          </span>
                    <span className="ml-auto text-sm text-gray-400">
            {new Date(deal.date).toLocaleString()}
          </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <div>
                            <div className="text-gray-400">Сумма</div>
                            <div className="font-medium">
                                {deal.amount} {deal.crypto}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-400">Цена</div>
                            <div className="font-medium">
                                {deal.price} {deal.currency}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <div className="text-gray-400">Всего</div>
                            <div className="font-medium">
                                {deal.totalPrice} {deal.currency}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-400">Способ оплаты</div>
                            <div className="font-medium">
                                {deal.paymentMethod}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Counterparty Info */}
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
                <h3 className="font-medium mb-3">Контрагент</h3>
                <div className="flex items-center">
                    <div>
                        <div className="font-medium">{deal.counterparty.name}</div>
                        <div className="text-sm text-gray-400">
                            Сделок: {deal.counterparty.deals}
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Timer (if active) */}
            {deal.status === 'active' && timeLeft !== null && (
                <div className="bg-gray-800 rounded-xl p-4 mb-6">
                    <h3 className="font-medium mb-3">Время на оплату</h3>
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                            {timeLeft > 0 ? 'Осталось времени:' : 'Время истекло'}
                        </div>
                        <div className={`text-xl font-bold ${timeLeft > 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {timeLeft > 0 ? `${timeLeft} мин` : '0 мин'}
                        </div>
                    </div>
                </div>
            )}

            {/* Deal Conditions */}
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
                <h3 className="font-medium mb-3">Условия сделки</h3>
                <p className="text-gray-400 text-sm whitespace-pre-wrap">
                    {deal.conditions || 'Условия не указаны'}
                </p>
            </div>

            {/* Action Buttons */}
            {deal.status === 'active' && (
                <div className="space-y-4">
                    {deal.type === 'buy' ? (
                        <>
                            <button
                                onClick={handleConfirmPayment}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium"
                            >
                                Я оплатил
                            </button>
                            <button
                                onClick={handleCancelDeal}
                                className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium"
                            >
                                Отменить сделку
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleReleaseCrypto}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium"
                            >
                                Подтвердить получение оплаты
                            </button>
                            <button
                                onClick={handleCancelDeal}
                                className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium"
                            >
                                Отменить сделку
                            </button>
                        </>
                    )}

                    {/* Add appeal button */}
                    <button
                        onClick={handleCreateAppeal}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium"
                    >
                        Создать апелляцию
                    </button>
                </div>
            )}

            {/* Cancellation Reason (if cancelled) */}
            {deal.status === 'cancelled' && deal.cancellationReason && (
                <div className="bg-red-900/50 text-red-200 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Причина отмены</h3>
                    <p>{deal.cancellationReason}</p>
                </div>
            )}
        </div>
    );
};

export default DealDetailsPage;