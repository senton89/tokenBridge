import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const P2PDealsPage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('active');
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [showDealDetails, setShowDealDetails] = useState(false);
    
    // Обработка выбранной сделки из главного меню
    useEffect(() => {
        if (location.state?.selectedDeal) {
            setSelectedDeal(location.state.selectedDeal);
            setShowDealDetails(true);
            
            // Установим активную вкладку в зависимости от статуса сделки
            if (location.state.selectedDeal.status === 'completed') {
                setActiveTab('completed');
            } else {
                setActiveTab('active');
            }
        }
    }, [location.state]);
    
    // Пример данных для сделок
    const activeDeals = [
        {
            id: 1,
            type: 'buy',
            asset: 'USDT',
            amount: '100 USDT',
            price: '99,36 RUB',
            total: '9 936 RUB',
            counterparty: 'Brave Dolphin',
            date: '01.03.2025 14:30',
            status: 'waiting_payment'
        }
    ];
    
    const completedDeals = [
        {
            id: 2,
            type: 'sell',
            asset: 'USDT',
            amount: '50 USDT',
            price: '98,50 RUB',
            total: '4 925 RUB',
            counterparty: 'Smart Fox',
            date: '28.02.2025 12:15',
            status: 'completed'
        },
        {
            id: 3,
            type: 'buy',
            asset: 'BTC',
            amount: '0.002 BTC',
            price: '5 230 000 RUB',
            total: '10 460 RUB',
            counterparty: 'Quiet Panda',
            date: '25.02.2025 18:45',
            status: 'completed'
        }
    ];

    const getStatusText = (status) => {
        switch(status) {
            case 'waiting_payment':
                return 'Ожидание оплаты';
            case 'completed':
                return 'Завершена';
            case 'in progress':
                return 'В процессе';
            default:
                return status;
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'waiting_payment':
            case 'in progress':
                return 'text-yellow-500';
            case 'completed':
                return 'text-green-500';
            default:
                return 'text-gray-400';
        }
    };

    const getTypeText = (type) => {
        return type === 'buy' ? 'Покупка' : 'Продажа';
    };

    const getTypeColor = (type) => {
        return type === 'buy' ? 'text-green-500' : 'text-red-500';
    };
    
    const handleDealClick = (deal) => {
        setSelectedDeal(deal);
        setShowDealDetails(true);
    };
    
    const handleCloseDealDetails = () => {
        setShowDealDetails(false);
    };

    // Компонент модального окна с деталями сделки
    const DealDetailsModal = ({ deal, isOpen, onClose }) => {
        if (!isOpen || !deal) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Детали сделки</h3>
                            <button 
                                className="text-gray-400 hover:text-white"
                                onClick={onClose}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="flex justify-between items-center mb-4">
                            <span className={getTypeColor(deal.type)}>{getTypeText(deal.type)}</span>
                            <span className={getStatusColor(deal.status)}>{getStatusText(deal.status)}</span>
                        </div>
                        
                        <div className="text-2xl font-bold mb-4">{deal.amount}</div>
                        
                        <div className="bg-gray-800 p-4 rounded-lg mb-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="text-gray-400">Сумма:</div>
                                <div>{deal.total}</div>
                                <div className="text-gray-400">Цена:</div>
                                <div>{deal.price}</div>
                                <div className="text-gray-400">Количество:</div>
                                <div>{deal.amount}</div>
                                <div className="text-gray-400">Контрагент:</div>
                                <div>{deal.counterparty}</div>
                                <div className="text-gray-400">Дата создания:</div>
                                <div>{deal.date}</div>
                            </div>
                        </div>
                        
                        {deal.status !== 'completed' && (
                            <div className="bg-gray-800 p-4 rounded-lg mb-4">
                                <h4 className="font-bold mb-2">Инструкции</h4>
                                <p className="text-sm text-gray-300">
                                    Для завершения сделки отправьте оплату по указанным реквизитам и нажмите кнопку "Я оплатил".
                                </p>
                            </div>
                        )}
                        
                        {deal.status === 'waiting_payment' && (
                            <button className="bg-blue-600 text-white w-full py-3 rounded-lg">
                                Я оплатил
                            </button>
                        )}
                        
                        {deal.status === 'completed' && (
                            <div className="bg-green-900/30 text-green-400 p-3 rounded-lg text-center">
                                Сделка успешно завершена
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-lg font-bold mb-4">Мои сделки</h2>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-600 mb-4">
                <button 
                    className={`py-2 px-4 ${activeTab === 'active' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('active')}
                >
                    Активные
                </button>
                <button 
                    className={`py-2 px-4 ${activeTab === 'completed' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Завершенные
                </button>
            </div>
            
            {/* Deals list */}
            <div className="space-y-4">
                {activeTab === 'active' ? (
                    activeDeals.length > 0 ? (
                        activeDeals.map(deal => (
                            <div 
                                key={deal.id} 
                                className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                                onClick={() => handleDealClick(deal)}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={getTypeColor(deal.type)}>{getTypeText(deal.type)}</span>
                                    <span className={getStatusColor(deal.status)}>{getStatusText(deal.status)}</span>
                                </div>
                                <div className="text-lg font-bold mb-2">{deal.amount}</div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-400">Цена:</div>
                                    <div>{deal.price}</div>
                                    <div className="text-gray-400">Сумма:</div>
                                    <div>{deal.total}</div>
                                    <div className="text-gray-400">Контрагент:</div>
                                    <div>{deal.counterparty}</div>
                                    <div className="text-gray-400">Дата:</div>
                                    <div>{deal.date}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-400 py-8">
                            <p>У вас нет активных сделок</p>
                        </div>
                    )
                ) : (
                    completedDeals.length > 0 ? (
                        completedDeals.map(deal => (
                            <div 
                                key={deal.id} 
                                className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                                onClick={() => handleDealClick(deal)}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={getTypeColor(deal.type)}>{getTypeText(deal.type)}</span>
                                    <span className={getStatusColor(deal.status)}>{getStatusText(deal.status)}</span>
                                </div>
                                <div className="text-lg font-bold mb-2">{deal.amount}</div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-400">Цена:</div>
                                    <div>{deal.price}</div>
                                    <div className="text-gray-400">Сумма:</div>
                                    <div>{deal.total}</div>
                                    <div className="text-gray-400">Контрагент:</div>
                                    <div>{deal.counterparty}</div>
                                    <div className="text-gray-400">Дата:</div>
                                    <div>{deal.date}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-400 py-8">
                            <p>У вас нет завершенных сделок</p>
                        </div>
                    )
                )}
            </div>
            
            {/* Модальное окно с деталями сделки */}
            <DealDetailsModal 
                deal={selectedDeal}
                isOpen={showDealDetails}
                onClose={handleCloseDealDetails}
            />
        </div>
    );
};

export default P2PDealsPage;
