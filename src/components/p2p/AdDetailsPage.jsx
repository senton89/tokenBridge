import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { p2pApi } from '../../services/api';

const AdDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAd();
    }, [id]);

    const fetchAd = async () => {
        try {
            setLoading(true);
            const response = await p2pApi.getAdDetails(id);
            setAd(response.data);
        } catch (err) {
            setError('Не удалось загрузить объявление');
            console.error('Error fetching ad:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        navigate('/p2p/create-ad', { state: { editMode: true, ad } });
    };

    const handleToggleStatus = async () => {
        try {
            await p2pApi.updateAdStatus(id, ad.status === 'active' ? 'inactive' : 'active');
            // Refresh ad data
            await fetchAd();
        } catch (err) {
            setError('Не удалось обновить статус объявления');
            console.error('Error updating ad status:', err);
        }
    };


    const handleDelete = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) {
            return;
        }
        try {
            await p2pApi.deleteAd(id);
            navigate('/p2p/my-ads');
        } catch (err) {
            setError('Не удалось удалить объявление');
            console.error('Error deleting ad:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!ad) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-center text-red-500">
                    <i className="fas fa-exclamation-circle text-3xl mb-2" />
                    <p>Объявление не найдено</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2">
                            {ad.type === 'buy' ? 'Покупка' : 'Продажа'} {ad.crypto}
                        </h2>
                        <p className="text-gray-400">Детали объявления</p>
                    </div>
                    <button
                        onClick={() => navigate('/p2p/my-ads')}
                        className="text-gray-400 hover:text-white"
                    >
                        <i className="fas fa-times text-xl" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {/* Status and Actions */}
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                            ad.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                        <span className={ad.status === 'active' ? 'text-green-500' : 'text-gray-500'}>
              {ad.status === 'active' ? 'Активно' : 'Неактивно'}
            </span>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <i className="fas fa-edit" />
                        </button>
                        <button
                            onClick={handleToggleStatus}
                            className={`px-4 py-2 rounded-lg ${
                                ad.status === 'active'
                                    ? 'bg-yellow-600 hover:bg-yellow-700'
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {ad.status === 'active' ? (
                                <i className="fas fa-pause" />
                            ) : (
                                <i className="fas fa-play" />
                            )}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            <i className="fas fa-trash" />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <div>
                            <div className="text-gray-400">Цена</div>
                            <div className="font-medium">
                                {ad.price} {ad.currency}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-400">Мин. сумма</div>
                            <div className="font-medium">
                                {ad.minAmount || '0'} {ad.currency}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <div className="text-gray-400">Доступно</div>
                            <div className="font-medium">
                                {ad.available} {ad.crypto}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-400">Макс. сумма</div>
                            <div className="font-medium">
                                {ad.maxAmount} {ad.currency}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
                <h3 className="font-medium mb-3">Способы оплаты</h3>
                <div className="grid grid-cols-2 gap-3">
                    {ad.paymentMethods.map((method, index) => (
                        <div
                            key={index}
                            className="bg-gray-700 rounded-lg px-4 py-2 text-sm"
                        >
                            {method}
                        </div>
                    ))}
                </div>
            </div>

            {/* Terms and Auto-reply */}
            <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-4">
                    <h3 className="font-medium mb-3">Условия сделки</h3>
                    <p className="text-gray-400 text-sm whitespace-pre-wrap">
                        {ad.terms || 'Условия не указаны'}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <div className="text-xl font-bold">{ad.views}</div>
                    <div className="text-sm text-gray-400">Просмотров</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <div className="text-xl font-bold">{ad.completedDeals}</div>
                    <div className="text-sm text-gray-400">Сделок</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <div className="text-xl font-bold">{ad.successRate}%</div>
                    <div className="text-sm text-gray-400">Успешных</div>
                </div>
            </div>
        </div>
    );
};

export default AdDetailsPage;