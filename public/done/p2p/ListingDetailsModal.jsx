import React from 'react';

const ListingDetailsModal = ({ listing, isOpen, onClose }) => {
    if (!isOpen || !listing) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="max-w-lg mx-auto p-6">
                    <div className="flex mb-4 justify-center">
                        <div className="ml-2">
                            <p className="text-sm">
                                <div className="flex items-center space-x-2 pb-2">
                                    <img 
                                        alt="User avatar" 
                                        className="rounded-full w-6 h-6 mr-2" 
                                        src="https://storage.googleapis.com/a1aa/image/vImWmxyTLMqfIxOq_puMh-IQ6uWkJAHG_QX_GYZTcVg.jpg"
                                    />
                                    Вы покупаете у
                                    <span className="font-semibold ml-1">
                                        {listing.advertiser}
                                    </span>
                                </div>
                            </p>
                        </div>
                    </div>
                    
                    {/* Transaction Details */}
                    <div className="bg-gray-800 p-4 rounded-lg mb-4">
                        <div className="flex justify-between mb-4">
                            <span>
                                Цена за 1 {listing.crypto}
                            </span>
                            <span>
                                {listing.price} {listing.currency}
                            </span>
                        </div>
                        <div className="w-full border-b border-gray-600 opacity-50 mb-4"></div>
                        
                        <div className="flex justify-between mb-2">
                            <span>
                                Доступно
                            </span>
                            <span>
                                {listing.cryptoAmount} {listing.crypto}
                            </span>
                        </div>
                        <div className="w-full border-b border-gray-600 opacity-50 mb-4"></div>
                        
                        <div className="flex justify-between mb-2">
                            <span>
                                Лимиты
                            </span>
                            <span>
                                {listing.minAmount} ~ {listing.maxAmount || '∞'} {listing.currency}
                            </span>
                        </div>
                        <div className="w-full border-b border-gray-600 opacity-50 mb-4"></div>

                        <div className="flex justify-between mb-2">
                            <span>
                                Методы оплаты
                            </span>
                            <span>
                                {listing.paymentMethods && listing.paymentMethods.length > 0 
                                    ? listing.paymentMethods.join(', ') 
                                    : 'СберБанк'}
                            </span>
                        </div>
                        <div className="w-full border-b border-gray-600 opacity-50 mb-4"></div>

                        <div className="flex justify-between mb-2">
                            <span>
                                Время на оплату
                            </span>
                            <span>
                                15 мин
                            </span>
                        </div>
                    </div>
                    
                    {/* Seller Info */}
                    <div className="bg-gray-800 p-4 rounded-lg mb-16">
                        <p className="text-blue-400 mb-4">
                            Данные продавца
                        </p>
                        <div className="flex justify-between mb-2">
                            <span>
                                Имя продавца
                            </span>
                            <span>
                                {listing.advertiser}
                            </span>
                        </div>
                        <div className="w-full border-b border-gray-600 opacity-50 mb-4"></div>
                        
                        <div className="flex justify-between mb-2">
                            <span>
                                Статистика торгов
                            </span>
                            <span>
                                сделок: {listing.completedDeals || 0}
                            </span>
                        </div>
                        <div className="w-full border-b border-gray-600 opacity-50 mb-4"></div>
                        
                        <div className="flex justify-between">
                            <span>
                                Статус
                            </span>
                            <span className="flex items-center">
                                <span className="text-green-500 mr-1">
                                    •
                                </span>
                                В сети
                            </span>
                        </div>
                    </div>
                    
                    {/* Back Button */}
                    <button 
                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg fixed bottom-3 left-4 right-4 max-w-lg mx-auto"
                        onClick={onClose}
                    >
                        Назад
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListingDetailsModal;
