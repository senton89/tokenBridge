import React from 'react';
import { useNavigate } from 'react-router-dom';

const ListingItem = ({
    price,
    priceLabel,
    buttonLabel,
    userImage,
    userName,
    deals,
    available,
    limits,
    paymentMethods,
    cryptoAmount,
    range,
    id
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (buttonLabel === "Купить") {
            navigate(`/p2p/buy/${id}`);
        } else {
            navigate(`/p2p/sell/${id}`);
        }
    };

    return (
        <div className="bg-[#1a2736] rounded-lg p-4 shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center mb-2">
                        <img
                            src={userImage || '/images/placeholder.png'}
                            alt={userName}
                            className="w-8 h-8 rounded-full mr-2"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/placeholder.png';
                            }}
                        />
                        <span className="font-medium text-white">{userName}</span>
                        <span className="ml-2 text-gray-400">{deals} сделок</span>
                    </div>
                    <div className="text-lg font-bold text-white">
                        {price} {priceLabel}
                    </div>
                </div>
                <button
                    onClick={handleClick}
                    className={`px-6 py-2 rounded-lg font-medium ${
                        buttonLabel === "Купить" 
                            ? "bg-green-500 hover:bg-green-600" 
                            : "bg-red-500 hover:bg-red-600"
                    } text-white transition-colors`}
                >
                    {buttonLabel}
                </button>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                    <span>Доступно:</span>
                    <span className="text-white">{available} USDT</span>
                </div>
                <div className="flex justify-between text-gray-400">
                    <span>Лимиты:</span>
                    <span className="text-white">{limits}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                    <span>Способы оплаты:</span>
                    <div className="flex gap-2">
                        {paymentMethods.map((method, index) => (
                            <span key={index} className="bg-[#2a3746] px-2 py-1 rounded text-white">
                                {method}
                            </span>
                        ))}
                    </div>
                </div>
                {cryptoAmount && (
                    <div className="flex justify-between text-gray-400">
                        <span>Количество:</span>
                        <span className="text-white">{cryptoAmount} USDT</span>
                    </div>
                )}
                {range && (
                    <div className="flex justify-between text-gray-400">
                        <span>Диапазон:</span>
                        <span className="text-white">{range}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListingItem;
