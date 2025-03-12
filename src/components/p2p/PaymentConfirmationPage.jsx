import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { p2pApi } from '../../services/api'; // Import the API service

const PaymentConfirmationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { dealId, dealDetails } = location.state || {};
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleOpenDeals = () => {
        navigate('/p2p/deals');
    };

    const handleCancelDeal = async () => {
        if (window.confirm('Вы уверены, что хотите отменить сделку?')) {
            try {
                setIsSubmitting(true);
                setError(null);

                // Call the API to cancel the deal
                const reason = 'Отменено пользователем';
                await p2pApi.cancelDeal(dealId, reason);

                // Navigate back to deals page with success message
                navigate('/p2p/deals', {
                    state: {
                        message: 'Сделка успешно отменена',
                        messageType: 'success'
                    }
                });
            } catch (err) {
                console.error('Error cancelling deal:', err);
                setError('Не удалось отменить сделку. Пожалуйста, попробуйте позже.');
                setIsSubmitting(false);
            }
        }
    };

    const handleAppeal = async () => {
        try {
            // In a real app, you might want to show a form to collect appeal details
            const reason = prompt('Пожалуйста, укажите причину апелляции:');

            if (reason) {
                setIsSubmitting(true);
                setError(null);

                // Call the API to create an appeal
                await p2pApi.createAppeal(dealId, reason);

                alert('Апелляция успешно отправлена. Администратор рассмотрит ваше обращение.');
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error('Error creating appeal:', err);
            setError('Не удалось отправить апелляцию. Пожалуйста, попробуйте позже.');
            setIsSubmitting(false);
        }
    };

    if (!dealId) {
        // Handle case when page is accessed directly without proper state
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Ошибка: информация о сделке отсутствует</p>
                    <button
                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 px-6 rounded-lg"
                        onClick={() => navigate('/p2p/deals')}
                    >
                        Перейти к сделкам
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center pb-16 p-4">
            {error && (
                <div className="bg-red-900 text-white p-3 rounded-lg mb-4 w-full max-w-md">
                    {error}
                </div>
            )}

            <div className="flex flex-col items-center w-full max-w-md">
                <div className="text-9xl mb-6 text-center">
                    <i className="fas fa-handshake" style={{
                        background: 'linear-gradient(to right, #3779e6, #1e4fd9)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}></i>
                </div>

                <h2 className="text-xl font-semibold mb-2 text-center">
                    Вы подтвердили оплату
                </h2>

                <p className="text-center text-gray-400 mb-6">
                    Продавец должен подтвердить получение платежа в течение 10 мин
                </p>

                <button
                    className="text-blue-500 mb-4"
                    onClick={handleAppeal}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Отправка...' : 'Отправить апелляцию'}
                </button>

                <button
                    className="text-red-500 w-full py-3 px-4 rounded-lg mb-8 border border-red-500"
                    onClick={handleCancelDeal}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Отмена...' : 'Отменить сделку'}
                </button>
            </div>

            <div className="w-full max-w-md mb-4 absolute bottom-4">
                <button
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white w-full py-3 rounded-lg font-medium"
                    onClick={handleOpenDeals}
                    disabled={isSubmitting}
                >
                    ОТКРЫТЬ МЕНЮ СДЕЛОК
                </button>
            </div>
        </div>
    );
};

export default PaymentConfirmationPage;