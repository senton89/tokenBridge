import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { p2pApi } from '../../services/api';

const P2PDealsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('active');

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        try {
            setLoading(true);
            const response = await p2pApi.getUserDeals();
            setDeals(response.data);
            setLoading(false);
        } catch (err) {
            setError('Не удалось загрузить сделки');
            console.error('Error fetching deals:', err);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'text-yellow-500';
            case 'completed':
                return 'text-green-500';
            case 'cancelled':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return 'fa-clock';
            case 'completed':
                return 'fa-check-circle';
            case 'cancelled':
                return 'fa-times-circle';
            default:
                return 'fa-question-circle';
        }
    };

    const filteredDeals = deals.filter(deal => {
        if (activeTab === 'active') return deal.status === 'active';
        if (activeTab === 'completed') return deal.status === 'completed';
        if (activeTab === 'cancelled') return deal.status === 'cancelled';
        return true;
    });

    const handleBack = () => {
        navigate('/p2p');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4">
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Мои сделки</h2>
                <p className="text-gray-400">Управляйте своими P2P сделками</p>
            </div>

            {error && (
                <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <div className="flex space-x-2 mb-4 overflow-x-auto py-2">
                <button
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                        activeTab === 'active'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={() => setActiveTab('active')}
                >
                    Активные
                </button>
                <button
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                        activeTab === 'completed'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={() => setActiveTab('completed')}
                >
                    Завершенные
                </button>
                <button
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                        activeTab === 'cancelled'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={() => setActiveTab('cancelled')}
                >
                    Отмененные
                </button>
            </div>

            <div className="space-y-4">
                {filteredDeals.map((deal) => (
                    <div key={deal.id} className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                                <i className={`fas ${getStatusIcon(deal.status)} ${getStatusColor(deal.status)} text-lg mr-2`} />
                                <span className={`${getStatusColor(deal.status)}`}>
                                    {deal.status === 'active' && 'В процессе'}
                                    {deal.status === 'completed' && 'Завершена'}
                                    {deal.status === 'cancelled' && 'Отменена'}
                                </span>
                            </div>
                            <div className="text-sm text-gray-400">
                                {new Date(deal.date).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-lg font-medium mb-1">
                                    {deal.type === 'buy' ? 'Покупка' : 'Продажа'} {deal.crypto}
                                </div>
                                <div className="text-gray-400">
                                    {deal.amount} {deal.crypto} за {deal.totalPrice} {deal.currency}
                                </div>
                            </div>
                            <button
                                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => navigate(`/p2p/deals/${deal.id}`, {state: {selectedDeal: deal}})}
                            >
                                Детали
                            </button>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-700">
                            <div className="flex items-center text-sm text-gray-400">
                            <i className="fas fa-user mr-2"/>
                                <span>Контрагент: {deal.counterparty.name}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-400 mt-1">
                                <i className="fas fa-credit-card mr-2" />
                                <span>Способ оплаты: {deal.paymentMethod}</span>
                            </div>
                            {deal.status === 'cancelled' && deal.cancellationReason && (
                                <div className="flex items-center text-sm text-red-400 mt-1">
                                    <i className="fas fa-exclamation-circle mr-2" />
                                    <span>Причина отмены: {deal.cancellationReason}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {filteredDeals.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                        <i className="fas fa-search text-3xl mb-2" />
                        <p>Сделки не найдены</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default P2PDealsPage;
