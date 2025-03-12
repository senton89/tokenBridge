import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { p2pApi } from '../../services/api';

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [activeDeals, setActiveDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfile();
        fetchActiveDeals();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await p2pApi.getUserProfile();
            setProfile(response.data);
        } catch (err) {
            setError('Не удалось загрузить профиль. ' + (err.response?.data?.message || err.message));
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveDeals = async () => {
        try {
            const response = await p2pApi.getUserDeals();

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected response format');
            }

            const deals = response.data.filter((deal) => deal.status === 'active');
            setActiveDeals(deals);
        } catch (err) {
            console.error('Error fetching active deals:', err);
            setError(prev => prev || 'Не удалось загрузить активные сделки');
        }
    };

    const handleDealClick = (dealId) => {
        navigate(`/p2p/deals/${dealId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-center text-red-500">
                    <i className="fas fa-exclamation-circle text-3xl mb-2" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4 pb-20">
            {/* Profile Header */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold">{profile?.name}</h2>
                    </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold">{profile?.completedDeals}</div>
                    <div className="text-sm text-gray-400">Сделок</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                    className="bg-gray-800 p-4 rounded-xl flex items-center justify-center hover:bg-gray-700 transition-colors"
                    onClick={() => navigate('/p2p/my-ads')}
                >
                    <i className="fas fa-list-alt mr-2" />
                    Мои объявления
                </button>
                <button
                    className="bg-gray-800 p-4 rounded-xl flex items-center justify-center hover:bg-gray-700 transition-colors"
                    onClick={() => navigate('/p2p/deals')}
                >
                    <i className="fas fa-handshake mr-2" />
                    Мои сделки
                </button>
                <button
                    className="bg-gray-800 p-4 rounded-xl flex items-center justify-center hover:bg-gray-700 transition-colors"
                    onClick={() => navigate('/p2p/payment-methods')}
                >
                    <i className="fas fa-credit-card mr-2" />
                    Способы оплаты
                </button>
                <button
                    className="bg-gray-800 p-4 rounded-xl flex items-center justify-center hover:bg-gray-700 transition-colors"
                    onClick={() => navigate('/p2p/create-ad')}
                >
                    <i className="fas fa-plus mr-2" />
                    Создать объявление
                </button>
            </div>

            {/* Active Deals Section */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Активные сделки</h3>
                    <button
                        className="text-blue-400 text-sm"
                        onClick={() => navigate('/p2p/deals')}
                    >
                        Все сделки
                    </button>
                </div>
                {activeDeals.length > 0 ? (
                    <div className="space-y-3">
                        {activeDeals.map((deal) => (
                            <div
                                key={deal.id}
                                className="bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                                onClick={() => handleDealClick(deal.id)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                    <span className={`text-xs px-2 py-0.5 rounded mr-2 ${
                        deal.type === 'buy' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                    }`}>
                      {deal.type === 'buy' ? 'Покупка' : 'Продажа'}
                    </span>
                                        <span className="font-medium">{deal.crypto}</span>
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {new Date(deal.date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-sm">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-400">Сумма:</span>
                                        <span>{deal.amount} {deal.crypto}</span>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-400">Цена:</span>
                                        <span>{deal.totalPrice} {deal.currency}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Контрагент:</span>
                                        <span>{deal.counterparty.name}</span> {/* Fixed line */}
                                    </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-600 text-sm text-gray-400">
                                    <i className="fas fa-credit-card mr-2"></i>
                                    {deal.paymentMethod}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-400 py-4">
                        <p>У вас нет активных сделок</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;