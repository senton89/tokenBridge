import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentConfirmationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { dealId, dealDetails } = location.state || {};

    const handleOpenDeals = () => {
        navigate('/p2p/deals');
    };

    const handleCancelDeal = () => {
        if (window.confirm('Вы уверены, что хотите отменить сделку?')) {
            // In a real app, you would make an API call to cancel the deal
            navigate('/p2p/deals', {
                state: {
                    cancelledDeal: dealId,
                    cancelReason: 'Отменено пользователем'
                }
            });
        }
    };

    const handleAppeal = () => {
        // In a real app, this would open an appeal form or process
        alert('Функция отправки апелляции будет доступна в ближайшее время');
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center pb-16 p-4">
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
                >
                    Отправить апелляцию
                </button>

                <button
                    className="text-red-500 w-full py-3 px-4 rounded-lg mb-8 border border-red-500"
                    onClick={handleCancelDeal}
                >
                    Отменить сделку
                </button>
            </div>

            <div className="w-full max-w-md mb-4 absolute bottom-4">
                <button
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white w-full py-3 rounded-lg font-medium"
                    onClick={handleOpenDeals}
                >
                    ОТКРЫТЬ МЕНЮ СДЕЛОК
                </button>
            </div>
        </div>
    );
};

export default PaymentConfirmationPage;