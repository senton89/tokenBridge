import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getCryptoImagePath, handleImageError, getCryptoColor } from '../../utils/imageHelper';

const AdDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    
    // Состояния
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    
    // Загрузка данных при монтировании
    useEffect(() => {
        setTimeout(() => {
            const adFromState = location.state?.ad;
            
            if (adFromState) {
                setAd(adFromState);
            } else {
                navigate('/p2p/my-ads');
            }
            setLoading(false);
        }, 300);
    }, [id, location.state, navigate]);
    
    const handleBackClick = () => {
        navigate('/p2p/my-ads');
    };
    
    const handleEditClick = () => {
        navigate('/p2p/create-ad', { state: { editMode: true, ad } });
    };
    
    const handleToggleStatus = () => {
        setAd(prevAd => ({
            ...prevAd,
            status: prevAd.status === 'active' ? 'inactive' : 'active'
        }));
    };
    
    // Индикатор загрузки
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Если объявление не найдено
    if (!ad) {
        return (
            <div className="p-6">
                <div className="bg-red-800 p-4 rounded-lg mb-4 text-white">
                    Объявление не найдено. 
                    <button 
                        className="bg-blue-600 text-white mt-2 py-2 px-4 rounded"
                        onClick={handleBackClick}
                    >
                        Вернуться к списку объявлений
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-6">
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
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
                        <div className="font-bold text-xl">{ad.asset}</div>
                        <div className="text-sm text-gray-400">
                            {ad.type === 'buy' ? 'Покупка' : 'Продажа'}
                        </div>
                    </div>
                    <span className={`ml-auto px-2 py-1 rounded text-xs ${ad.status === 'active' ? 'bg-green-900 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                        {ad.status === 'active' ? 'Активно' : 'Неактивно'}
                    </span>
                </div>
                
                <div className="text-3xl font-bold mb-4">{ad.price}</div>
                
                <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                    <div className="text-gray-400">Доступно:</div>
                    <div>{ad.available}</div>
                    <div className="text-gray-400">Лимиты:</div>
                    <div>{ad.limits}</div>
                    <div className="text-gray-400">Способы оплаты:</div>
                    <div>{ad.paymentMethods}</div>
                </div>
                
                <div className="mb-6">
                    <h4 className="font-bold mb-2">Описание</h4>
                    <p className="text-gray-300">
                        {ad.description}
                    </p>
                </div>
                
                <div className="mb-6">
                    <h4 className="font-bold mb-2">Условия сделки</h4>
                    <p className="text-gray-300">
                        {ad.terms}
                    </p>
                </div>
                
                <div className="flex space-x-3">
                    <button 
                        className="py-3 px-4 rounded-lg bg-gray-700 text-white"
                        onClick={handleBackClick}
                    >
                        Назад
                    </button>
                    
                    <button 
                        className={`py-3 rounded-lg flex-1 ${ad.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                        onClick={handleToggleStatus}
                    >
                        {ad.status === 'active' ? 'Деактивировать' : 'Активировать'}
                    </button>
                    
                    <button 
                        className="py-3 rounded-lg flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleEditClick}
                    >
                        Редактировать
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdDetailsPage;
