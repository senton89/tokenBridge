import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ListingItem from './ListingItem';
import { mockBuyListings, mockSellListings } from '../../data/mockListings';
import { getCryptoImagePath, handleImageError, getCryptoColor } from '../../utils/imageHelper';

const MyListings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('buy');
    
    // Инициализируем состояние с моковыми данными, добавляя статус к каждому объявлению
    const [myBuyListings, setMyBuyListings] = useState([]);
    const [mySellListings, setMySellListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    
    useEffect(() => {
        // Имитация загрузки данных с сервера
        setTimeout(() => {
            // Получаем объявления из mockListings
            // Если в mockListings уже есть объявления со статусом, используем их
            // В противном случае добавляем статус
            const buyListings = mockBuyListings.slice(0, 5).map(listing => {
                if (listing.status) {
                    return listing;
                }
                return {
                    ...listing,
                    status: Math.random() > 0.3 ? 'active' : 'inactive' // Случайный статус для демонстрации
                };
            });
            
            const sellListings = mockSellListings.slice(0, 5).map(listing => {
                if (listing.status) {
                    return listing;
                }
                return {
                    ...listing,
                    status: Math.random() > 0.3 ? 'active' : 'inactive' // Случайный статус для демонстрации
                };
            });
            
            setMyBuyListings(buyListings);
            setMySellListings(sellListings);
            setLoading(false);
            
            // Проверяем, было ли создано новое объявление
            if (location.state?.newListing) {
                setNotification('Объявление успешно создано!');
                // Очищаем уведомление через 5 секунд
                setTimeout(() => {
                    setNotification(null);
                }, 5000);
            }
        }, 500);
    }, [location.state]);
    
    // Функция для активации/деактивации объявления
    const toggleListingStatus = (id) => {
        if (activeTab === 'buy') {
            setMyBuyListings(myBuyListings.map(listing => {
                if (listing.id === id) {
                    return {
                        ...listing,
                        status: listing.status === 'active' ? 'inactive' : 'active'
                    };
                }
                return listing;
            }));
        } else {
            setMySellListings(mySellListings.map(listing => {
                if (listing.id === id) {
                    return {
                        ...listing,
                        status: listing.status === 'active' ? 'inactive' : 'active'
                    };
                }
                return listing;
            }));
        }
    };
    
    // Функция для удаления объявления
    const deleteListing = (id) => {
        if (window.confirm('Вы уверены, что хотите удалить это объявление?')) {
            if (activeTab === 'buy') {
                setMyBuyListings(myBuyListings.filter(listing => listing.id !== id));
                // Также удаляем из mockBuyListings для сохранения состояния между переходами
                const index = mockBuyListings.findIndex(listing => listing.id === id);
                if (index !== -1) {
                    mockBuyListings.splice(index, 1);
                }
            } else {
                setMySellListings(mySellListings.filter(listing => listing.id !== id));
                // Также удаляем из mockSellListings для сохранения состояния между переходами
                const index = mockSellListings.findIndex(listing => listing.id === id);
                if (index !== -1) {
                    mockSellListings.splice(index, 1);
                }
            }
            setNotification('Объявление успешно удалено!');
            // Очищаем уведомление через 5 секунд
            setTimeout(() => {
                setNotification(null);
            }, 5000);
        }
    };
    
    const handleCreateAd = (type = null) => {
        navigate('/announcement', { state: { adType: type || activeTab } });
    };
    
    // Если идет загрузка, показываем индикатор
    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    
    return (
        <div className="p-4">
            {notification && (
                <div className="bg-green-500 text-white p-3 rounded mb-4 flex justify-between items-center">
                    <span>{notification}</span>
                    <button onClick={() => setNotification(null)} className="text-white">
                        &times;
                    </button>
                </div>
            )}
            
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Мои объявления</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleCreateAd('buy')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                        + Купить
                    </button>
                    <button
                        onClick={() => handleCreateAd('sell')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                        + Продать
                    </button>
                </div>
            </div>
            
            <div className="flex border-b mb-4">
                <button
                    className={`py-2 px-4 ${activeTab === 'buy' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
                    onClick={() => setActiveTab('buy')}
                >
                    Покупка ({myBuyListings.length})
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'sell' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
                    onClick={() => setActiveTab('sell')}
                >
                    Продажа ({mySellListings.length})
                </button>
            </div>
            
            {activeTab === 'buy' && (
                <div>
                    {myBuyListings.length > 0 ? (
                        myBuyListings.map(listing => (
                            <ListingItem
                                key={listing.id}
                                listing={listing}
                                showStatus={true}
                                onToggleStatus={() => toggleListingStatus(listing.id)}
                                onDelete={() => deleteListing(listing.id)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">У вас пока нет объявлений на покупку</p>
                            <button
                                onClick={() => handleCreateAd('buy')}
                                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Создать объявление на покупку
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'sell' && (
                <div>
                    {mySellListings.length > 0 ? (
                        mySellListings.map(listing => (
                            <ListingItem
                                key={listing.id}
                                listing={listing}
                                showStatus={true}
                                onToggleStatus={() => toggleListingStatus(listing.id)}
                                onDelete={() => deleteListing(listing.id)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">У вас пока нет объявлений на продажу</p>
                            <button
                                onClick={() => handleCreateAd('sell')}
                                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Создать объявление на продажу
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyListings;
