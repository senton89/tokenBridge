import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { p2pApi } from '../../services/api'; // Import the API service

const P2PMenu = () => {
    const navigate = useNavigate();
    const [userAds, setUserAds] = useState([]);
    const [userDeals, setUserDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch user's ads and deals when component mounts
        const fetchUserData = async () => {
            try {
                setLoading(true);
                // Get user's ads
                const adsResponse = await p2pApi.getUserAds();
                setUserAds(adsResponse.data || []);

                // Get user's deals
                const dealsResponse = await p2pApi.getUserDeals();
                setUserDeals(dealsResponse.data || []);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to load your data. Please try again later.');
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleBuyClick = () => {
        navigate('/p2p/buy');
    };

    const handleSellClick = () => {
        navigate('/p2p/sell');
    };

    const handleMyAdsClick = () => {
        navigate('/p2p/my-ads');
    };

    const handleCreateAdClick = () => {
        navigate('/p2p/create-ad');
    };

    const handleProfileClick = () => {
        navigate('/p2p/profile');
    };

    const handleDealsClick = () => {
        navigate('/p2p/deals');
    };

    const handlePaymentMethodsClick = () => {
        navigate('/p2p/payment-methods');
    };

    const handleAdClick = (ad) => {
        navigate(`/p2p/ad/${ad.id}`, { state: { listing: ad } });
    };

    const handleDealClick = (deal) => {
        navigate(`/p2p/deals/${deal.id}`);
    };

    return (
        <div className="max-w-md mx-auto p-4">
            {/* Main Content */}
            <div className="text-center mb-6">
                <img src="../images/p2p.png" alt="p2p market logo" className="w-48 mx-auto mb-6 mt-12" />
                <h2 className="text-lg font-bold">P2P Маркет</h2>
                <p className="text-gray-400">Обменивайте активы напрямую у других пользователей</p>
            </div>

            {/* Buttons */}
            <div className="flex justify-center space-x-4 mb-6 text-md">
                <button
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2.5 rounded-xl w-full"
                    onClick={handleBuyClick}
                >
                    <i className="fas fa-arrow-down mr-2" />
                    Купить
                </button>
                <button
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2.5 rounded-xl w-full"
                    onClick={handleSellClick}
                >
                    <i className="fas fa-arrow-up mr-2" />
                    Продать
                </button>
            </div>

            {/* Options */}
            <div className="space-y-4">
                <div className="flex flex-col bg-gray-800 p-4 rounded-2xl">
                    <h3 className="font-bold mb-2">Мои объявления</h3>
                    {loading ? (
                        <div className="text-center py-4">
                            <p className="text-gray-400">Загрузка...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-4">
                            <p className="text-red-400">{error}</p>
                        </div>
                    ) : userAds.length > 0 ? (
                        <div className="space-y-2">
                            {userAds.map(ad => (
                                <div
                                    key={ad.id}
                                    className="flex justify-between items-center bg-gray-700 p-3 rounded-xl cursor-pointer hover:bg-gray-600 transition-colors"
                                    onClick={() => handleAdClick(ad)}
                                >
                                    <div>
                                        <div className="flex items-center">
                      <span className={`text-xs px-2 py-0.5 rounded mr-2 ${ad.type === 'buy' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
                        {ad.type === 'buy' ? 'Покупка' : 'Продажа'}
                      </span>
                                            <span className="font-medium">{ad.crypto}</span>
                                        </div>
                                        <div className="text-sm text-gray-400 mt-1">
                                            {ad.price} {ad.currency} • {ad.available} {ad.crypto}
                                        </div>
                                    </div>
                                    <div className="text-blue-400">
                                        <i className="fas fa-chevron-right" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-400 mb-3">У вас пока нет объявлений</p>
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                                onClick={handleCreateAdClick}
                            >
                                Создать объявление
                            </button>
                        </div>
                    )}
                    <button
                        className="text-blue-400 mt-3 text-sm self-center"
                        onClick={handleMyAdsClick}
                    >
                        Все объявления
                    </button>
                </div>

                <div className="flex flex-col bg-gray-800 p-4 rounded-2xl">
                    <h3 className="font-bold mb-2">Мои сделки</h3>
                    {loading ? (
                        <div className="text-center py-4">
                            <p className="text-gray-400">Загрузка...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-4">
                            <p className="text-red-400">{error}</p>
                        </div>
                    ) : userDeals.length > 0 ? (
                        <div className="space-y-2">
                            {userDeals.slice(0, 5).map(deal => (
                                <div
                                    key={deal.id}
                                    className="flex justify-between items-center bg-gray-700 p-3 rounded-xl cursor-pointer hover:bg-gray-600 transition-colors"
                                    onClick={() => handleDealClick(deal)}
                                >
                                    <div>
                                        <div className="flex items-center">
                      <span className={`text-xs px-2 py-0.5 rounded mr-2 ${
                          deal.status === 'completed' ? 'bg-green-800 text-green-200' :
                              deal.status === 'active' ? 'bg-yellow-800 text-yellow-200' :
                                  'bg-red-800 text-red-200'
                      }`}>
                        {deal.status === 'completed' ? 'Завершена' :
                            deal.status === 'active' ? 'В процессе' : 'Отменена'}
                      </span>
                                            <span className="font-medium">{deal.crypto}</span>
                                        </div>
                                        <div className="text-sm text-gray-400 mt-1">
                                            {deal.amount} {deal.crypto} • {deal.price} {deal.currency}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(deal.date).toLocaleDateString()} • {deal.counterparty.name}
                                        </div>
                                    </div>
                                    <div className="text-blue-400">
                                        <i className="fas fa-chevron-right" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-400">У вас пока нет сделок</p>
                        </div>
                    )}
                    <button
                        className="text-blue-400 mt-3 text-sm self-center"
                        onClick={handleDealsClick}
                    >
                        Все сделки
                    </button>
                </div>

                <div className="flex justify-between space-x-4">
                    <button
                        className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-2xl flex-1"
                        onClick={handlePaymentMethodsClick}
                    >
                        <i className="fas fa-credit-card text-2xl mb-2" />
                        <span className="text-sm">Способы оплаты</span>
                    </button>
                    <button
                        className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-2xl flex-1"
                        onClick={handleProfileClick}
                    >
                        <i className="fas fa-user text-2xl mb-2" />
                        <span className="text-sm">Профиль P2P</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default P2PMenu;