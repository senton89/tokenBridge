import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { p2pApi } from '../../services/api';
import { getCryptoImagePath, handleImageError, getCryptoColor } from '../../utils/imageHelper';

const MyAdsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('buy');
    const [selectedAd, setSelectedAd] = useState(null);
    const [showAdDetails, setShowAdDetails] = useState(false);
    const [myBuyAds, setMyBuyAds] = useState([]);
    const [mySellAds, setMySellAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserAds();
    }, []);

    const fetchUserAds = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch buy listings with proper error handling
            const buyResponse = await p2pApi.getBuyListings({ userOnly: true });
            if (buyResponse && buyResponse.data) {
                setMyBuyAds(buyResponse.data);
            }

            // Fetch sell listings with proper error handling
            const sellResponse = await p2pApi.getSellListings({ userOnly: true });
            if (sellResponse && sellResponse.data) {
                setMySellAds(sellResponse.data);
            }
        } catch (err) {
            setError('Не удалось загрузить объявления: ' + (err.response?.data?.message || err.message));
            console.error('Error fetching user ads:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAd = () => {
        navigate('/p2p/create-ad');
    };

    const handleAdClick = (ad) => {
        setSelectedAd(ad);
        setShowAdDetails(true);
    };

    // Function to toggle ad status (active/inactive)
    const toggleAdStatus = async (id, type) => {
        try {
            const adList = type === 'buy' ? myBuyAds : mySellAds;
            const ad = adList.find(ad => ad.id === id);
            if (!ad) return;

            const newStatus = ad.status === 'active' ? 'inactive' : 'active';
            const response = await p2pApi.updateAdStatus(id, newStatus);

            if (response && response.data) {
                // Update local state with the response data
                if (type === 'buy') {
                    setMyBuyAds(myBuyAds.map(ad => {
                        if (ad.id === id) {
                            return { ...ad, status: newStatus };
                        }
                        return ad;
                    }));
                } else {
                    setMySellAds(mySellAds.map(ad => {
                        if (ad.id === id) {
                            return { ...ad, status: newStatus };
                        }
                        return ad;
                    }));
                }
            }
        } catch (err) {
            setError('Не удалось обновить статус объявления: ' + (err.response?.data?.message || err.message));
            console.error('Error updating ad status:', err);
        }
    };

    // Modal component for ad details
    const AdDetailsModal = ({ ad, isOpen, onClose, onEdit, onToggleStatus }) => {
        if (!isOpen || !ad) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Детали объявления</h3>
                            <button
                                className="text-gray-400 hover:text-white"
                                onClick={onClose}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Ad details */}
                        <div className="mb-4">
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 mr-2 rounded-full bg-gray-700 flex items-center justify-center">
                                    <img
                                        src={getCryptoImagePath(ad.crypto)}
                                        alt={ad.crypto}
                                        className="w-6 h-6"
                                        onError={handleImageError}
                                    />
                                </div>
                                <div>
                                    <div className="font-bold">{ad.crypto}</div>
                                    <div className="text-sm text-gray-400">{ad.type === 'buy' ? 'Покупка' : 'Продажа'}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                                <div className="text-gray-400">Цена:</div>
                                <div className="font-medium">{ad.price.toFixed(2)} {ad.currency}</div>

                                <div className="text-gray-400">Доступно:</div>
                                <div>{ad.available.toFixed(8)} {ad.crypto}</div>

                                <div className="text-gray-400">Мин. сумма:</div>
                                <div>{ad.minAmount ? ad.minAmount.toFixed(2) : '0'} {ad.currency}</div>

                                <div className="text-gray-400">Макс. сумма:</div>
                                <div>{ad.maxAmount ? ad.maxAmount.toFixed(2) : 'Без ограничений'} {ad.currency}</div>

                                <div className="text-gray-400">Способы оплаты:</div>
                                <div>{ad.paymentMethods.join(', ')}</div>

                                <div className="text-gray-400">Статус:</div>
                                <div className={ad.status === 'active' ? 'text-green-500' : 'text-gray-400'}>
                                    {ad.status === 'active' ? 'Активно' : 'Неактивно'}
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-3">
                            <button
                                className={`${ad.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-2 rounded text-sm flex-1 transition-colors duration-200`}
                                onClick={() => {
                                    onToggleStatus(ad.id, ad.type);
                                    onClose();
                                }}
                            >
                                {ad.status === 'active' ? 'Деактивировать' : 'Активировать'}
                            </button>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex-1 transition-colors duration-200"
                                onClick={() => onEdit(ad)}
                            >
                                Редактировать
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Component for displaying an ad card
    const AdCard = ({ ad, type, onClick }) => (
        <div
            className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
            onClick={() => onClick(ad)}
        >
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                    <div className="w-6 h-6 mr-2 rounded-full bg-gray-700 flex items-center justify-center">
                        <img
                            src={getCryptoImagePath(ad.crypto)}
                            alt={ad.crypto}
                            className="w-4 h-4"
                            onError={handleImageError}
                        />
                    </div>
                    <span className="font-bold">{ad.crypto}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${ad.status === 'active' ? 'bg-green-900 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
          {ad.status === 'active' ? 'Активно' : 'Неактивно'}
        </span>
            </div>

            <div className="text-lg font-bold mb-2">{ad.price.toFixed(2)} {ad.currency}</div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">Доступно:</div>
                <div>{ad.available.toFixed(8)} {ad.crypto}</div>

                <div className="text-gray-400">Лимиты:</div>
                <div>
                    {ad.minAmount ? ad.minAmount.toFixed(2) : '0'} - {ad.maxAmount ? ad.maxAmount.toFixed(2) : '∞'} {ad.currency}
                </div>

                <div className="text-gray-400">Способы оплаты:</div>
                <div className="truncate">{ad.paymentMethods.join(', ')}</div>
            </div>
        </div>
    );

    return (
        <div className="max-w-md mx-auto p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Мои объявления</h2>
                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    onClick={handleCreateAd}
                >
                    <i className="fas fa-plus mr-2"></i>
                    Создать
                </button>
            </div>

            {/* Error display */}
            {error && (
                <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-600 mb-4">
                <button
                    className={`py-2 px-4 ${activeTab === 'buy' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('buy')}
                >
                    Покупка
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'sell' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('sell')}
                >
                    Продажа
                </button>
            </div>

            {/* Loading state */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : (
                /* Ads list */
                <div className="space-y-4">
                    {activeTab === 'buy' ? (
                        myBuyAds.length > 0 ? (
                            myBuyAds.map(ad => (
                                <AdCard key={ad.id} ad={ad} type="buy" onClick={handleAdClick} />
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-8">
                                <p>У вас нет объявлений о покупке</p>
                                <button
                                    className="text-blue-500 mt-2"
                                    onClick={handleCreateAd}
                                >
                                    Создать объявление
                                </button>
                            </div>
                        )
                    ) : (
                        mySellAds.length > 0 ? (
                            mySellAds.map(ad => (
                                <AdCard key={ad.id} ad={ad} type="sell" onClick={handleAdClick} />
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-8">
                                <p>У вас нет объявлений о продаже</p>
                                <button
                                    className="text-blue-500 mt-2"
                                    onClick={handleCreateAd}
                                >
                                    Создать объявление
                                </button>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Modal for ad details */}
            <AdDetailsModal
                ad={selectedAd}
                isOpen={showAdDetails}
                onClose={() => setShowAdDetails(false)}
                onEdit={(ad) => navigate('/p2p/create-ad', { state: { editMode: true, ad } })}
                onToggleStatus={toggleAdStatus}
            />
        </div>
    );
};

export default MyAdsPage;