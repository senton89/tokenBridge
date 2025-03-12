import React from 'react';
import { getCryptoImagePath, handleImageError } from '../../utils/imageHelper';

const ListingItem = ({ listing, buttonType, onClick }) => {
    const {
        id,
        price,
        crypto,
        currency,
        available,
        availableAmount,
        minAmount,
        maxAmount,
        paymentMethods,
        user
    } = listing;

    // Use available or availableAmount depending on which one exists
    const displayAmount = available || availableAmount || 0;

    const formatRange = () => {
        if (!minAmount && !maxAmount) return 'Без ограничений';
        if (!minAmount) return `До ${maxAmount} ${currency}`;
        if (!maxAmount) return `От ${minAmount} ${currency}`;
        return `${minAmount} - ${maxAmount} ${currency}`;
    };

    return (
        <div
            className="bg-gray-800 rounded-xl p-4 mb-3 hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => onClick?.(id)}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                    <img
                        src={getCryptoImagePath(crypto)}
                        alt={crypto}
                        className="w-10 h-10 mr-3"
                        onError={handleImageError}
                    />
                    <div>
                        <div className="text-xl font-bold">{price} {currency}</div>
                        <div className="text-sm text-gray-400">
                            {displayAmount} {crypto} доступно
                        </div>
                    </div>
                </div>
                <button
                    className={`px-4 py-2 rounded-lg font-medium ${
                        buttonType === 'buy'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                    } text-white transition-colors`}
                >
                    {buttonType === 'buy' ? 'Купить' : 'Продать'}
                </button>
            </div>
            <div className="flex items-center mb-3">
                <div>
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-sm text-gray-400">
                        Сделок: {user?.deals || 0}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mt-2">
                <div className="flex items-center">
                    <i className="fas fa-wallet mr-2 text-gray-500" />
                    <span>Лимиты: {formatRange()}</span>
                </div>
                <div className="flex items-center">
                    <i className="fas fa-credit-card mr-2 text-gray-500" />
                    <span>
            {paymentMethods?.slice(0, 2).join(', ')}
                        {paymentMethods?.length > 2 ? ` +${paymentMethods.length - 2}` : ''}
          </span>
                </div>
            </div>
        </div>
    );
};

export default ListingItem;