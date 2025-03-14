import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCryptoImagePath, handleImageError, getCryptoColor } from '../../utils/imageHelper';

const MyAdsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('buy');
    const [selectedAd, setSelectedAd] = useState(null);
    const [showAdDetails, setShowAdDetails] = useState(false);
    
    // Пример данных для объявлений пользователя
    const [myBuyAds, setMyBuyAds] = useState([
        {
            id: 1,
            asset: 'USDT',
            price: '99,36 RUB',
            available: '500 USDT',
            limits: '1 000 - 50 000 RUB',
            paymentMethods: 'Сбербанк, Тинькофф',
            status: 'active',
            type: 'buy',
            currency: 'RUB',
            description: 'Быстрая покупка USDT. Оплата в течение 15 минут после подтверждения.',
            terms: 'Пожалуйста, указывайте номер заказа при оплате. Перевод только с личного счета.'
        },
        {
            id: 2,
            asset: 'BTC',
            price: '5 230 000 RUB',
            available: '0.05 BTC',
            limits: '10 000 - 260 000 RUB',
            paymentMethods: 'Сбербанк',
            status: 'inactive',
            type: 'buy',
            currency: 'RUB',
            description: 'Покупаю BTC по хорошему курсу.',
            terms: 'Только верифицированные пользователи с рейтингом выше 80%.'
        }
    ]);
    
    const [mySellAds, setMySellAds] = useState([
        {
            id: 3,
            asset: 'USDT',
            price: '98,50 RUB',
            available: '200 USDT',
            limits: '1 000 - 20 000 RUB',
            paymentMethods: 'Тинькофф',
            status: 'active',
            type: 'sell',
            currency: 'RUB',
            description: 'Продаю USDT. Быстрое подтверждение.',
            terms: 'Оплата в течение 15 минут после начала сделки. Только верифицированные пользователи.'
        }
    ]);

    const handleCreateAd = () => {
        navigate('/p2p/create-ad');
    };

    const handleAdClick = (ad) => {
        navigate(`/p2p/ad/${ad.id}`, { state: { ad } });
    };

    // Функция для активации/деактивации объявления
    const toggleAdStatus = (id, type) => {
        if (type === 'buy') {
            setMyBuyAds(myBuyAds.map(ad => {
                if (ad.id === id) {
                    return {
                        ...ad,
                        status: ad.status === 'active' ? 'inactive' : 'active'
                    };
                }
                return ad;
            }));
        } else {
            setMySellAds(mySellAds.map(ad => {
                if (ad.id === id) {
                    return {
                        ...ad,
                        status: ad.status === 'active' ? 'inactive' : 'active'
                    };
                }
                return ad;
            }));
        }
    };
    
    const handleViewAdDetails = (ad) => {
        setSelectedAd(ad);
        setShowAdDetails(true);
    };
    
    const handleCloseAdDetails = () => {
        setShowAdDetails(false);
    };
    
    const handleEditAd = (ad) => {
        // Перенаправляем на страницу создания/редактирования объявления с передачей данных
        navigate('/p2p/create-ad', { state: { editMode: true, ad } });
    };

    // Компонент модального окна с деталями объявления
    const AdDetailsModal = ({ ad, isOpen, onClose, onEdit }) => {
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
                        
                        <div className="flex items-center mb-4">
                            <div 
                                className="w-8 h-8 rounded-full mr-3 flex items-center justify-center"
                                style={{ backgroundColor: getCryptoColor(ad.asset) }}
                            >
                                <img 
                                    src={getCryptoImagePath(ad.asset)} 
                                    alt={ad.asset} 
                                    className="w-5 h-5" 
                                    onError={handleImageError}
                                />
                            </div>
                            <div>
                                <div className="font-bold">{ad.asset}</div>
                                <div className="text-sm text-gray-400">
                                    {ad.type === 'buy' ? 'Покупка' : 'Продажа'}
                                </div>
                            </div>
                            <span className={`ml-auto px-2 py-1 rounded text-xs ${ad.status === 'active' ? 'bg-green-900 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                {ad.status === 'active' ? 'Активно' : 'Неактивно'}
                            </span>
                        </div>
                        
                        <div className="bg-gray-800 p-4 rounded-lg mb-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="text-gray-400">ID объявления:</div>
                                <div>#{ad.id}</div>
                                <div className="text-gray-400">Цена:</div>
                                <div>{ad.price}</div>
                                <div className="text-gray-400">Доступно:</div>
                                <div>{ad.available}</div>
                                <div className="text-gray-400">Лимиты:</div>
                                <div>{ad.limits}</div>
                                <div className="text-gray-400">Способы оплаты:</div>
                                <div>{ad.paymentMethods}</div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-800 p-4 rounded-lg mb-4">
                            <h4 className="font-bold mb-2">Описание</h4>
                            <p className="text-sm text-gray-300">
                                {ad.description}
                            </p>
                        </div>
                        
                        <div className="bg-gray-800 p-4 rounded-lg mb-4">
                            <h4 className="font-bold mb-2">Условия сделки</h4>
                            <p className="text-sm text-gray-300">
                                {ad.terms}
                            </p>
                        </div>
                        
                        <div className="flex space-x-3">
                            <button 
                                className={`${ad.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-2 rounded text-sm flex-1 transition-colors duration-200`}
                                onClick={() => {
                                    toggleAdStatus(ad.id, ad.type);
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

    // Компонент для отображения объявления
    const AdCard = ({ ad, type }) => (
        <div 
            className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
            onClick={() => handleAdClick(ad)}
        >
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                    <div 
                        className="w-6 h-6 rounded-full mr-2 flex items-center justify-center"
                        style={{ backgroundColor: getCryptoColor(ad.asset) }}
                    >
                        <img 
                            src={getCryptoImagePath(ad.asset)} 
                            alt={ad.asset} 
                            className="w-4 h-4" 
                            onError={handleImageError}
                        />
                    </div>
                    <span className="font-bold">{ad.asset}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${ad.status === 'active' ? 'bg-green-900 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                    {ad.status === 'active' ? 'Активно' : 'Неактивно'}
                </span>
            </div>
            <div className="text-lg font-bold mb-2">{ad.price}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">Доступно:</div>
                <div>{ad.available}</div>
                <div className="text-gray-400">Лимиты:</div>
                <div>{ad.limits}</div>
                <div className="text-gray-400">Способы оплаты:</div>
                <div>{ad.paymentMethods}</div>
            </div>
        </div>
    );

    return (
        <div className="max-w-md mx-auto p-4">
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
            
            {/* Ads list */}
            <div className="space-y-4">
                {activeTab === 'buy' ? (
                    myBuyAds.length > 0 ? (
                        myBuyAds.map(ad => (
                            <AdCard key={ad.id} ad={ad} type="buy" />
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
                            <AdCard key={ad.id} ad={ad} type="sell" />
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
            
            {/* Модальное окно с деталями объявления */}
            <AdDetailsModal 
                ad={selectedAd}
                isOpen={showAdDetails}
                onClose={handleCloseAdDetails}
                onEdit={handleEditAd}
            />
        </div>
    );
};

export default MyAdsPage;
