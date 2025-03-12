import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ExchangeSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { transaction, fromCoin, toCoin } = location.state || {};

    const handleOkClick = () => {
        navigate('/');
    };

    return (
        <div className="bg-gray-900 flex items-center justify-center min-h-screen">
            <div className="text-center m-8 p-8 md:p-16 bg-gray-800 rounded-2xl shadow-lg space-y-6 md:space-y-8 max-w-2xl w-full">
                <div className="flex justify-center mb-4">
                    <div className="bg-green-500 rounded-full p-6 md:p-12">
                        <i className="fas fa-check text-green-900 text-5xl md:text-9xl"></i>
                    </div>
                </div>

                <h1 className="text-white text-3xl md:text-6xl font-semibold">Обмен выполнен</h1>

                {transaction && (
                    <div className="text-gray-300 text-xl md:text-2xl space-y-2">
                        <p>
                            Вы обменяли <span className="font-bold text-white">{transaction.fromAmount} {fromCoin?.symbol}</span> на <span className="font-bold text-white">{transaction.toAmount.toFixed(8).replace(/\.?0+$/, '')} {toCoin?.symbol}</span>
                        </p>
                        <p className="text-gray-400 text-lg md:text-xl">
                            Курс обмена: 1 {fromCoin?.symbol} = {transaction.rate.toFixed(8).replace(/\.?0+$/, '')} {toCoin?.symbol}
                        </p>
                    </div>
                )}

                <p className="text-gray-400 my-4 md:my-8 text-xl md:text-3xl">
                    Транзакция успешно выполнена и отражена в вашем кошельке.
                </p>

                <button
                    onClick={handleOkClick}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-4 md:py-6 px-6 md:px-8 rounded-xl w-full text-xl md:text-3xl font-semibold transition-all hover:from-blue-600 hover:to-blue-800"
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default ExchangeSuccessPage;