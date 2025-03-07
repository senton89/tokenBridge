import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockBuyListings } from '../../data/mockListings';
import FilterBar from './FilterBar';
import Listings from './Listings';

const BuyMenu = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Состояние для фильтров
    const [selectedCrypto, setSelectedCrypto] = useState("USDT");
    const [selectedCurrency, setSelectedCurrency] = useState("RUB");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Все");
    const [amountFilter, setAmountFilter] = useState("");
    
    // Состояние для отображения списка
    const [filteredListings, setFilteredListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // При монтировании компонента инициализируем фильтры из query params, если они есть
    useEffect(() => {
        // Инициализация фильтров из state при навигации
        if (location.state) {
            if (location.state.selectedCrypto) {
                setSelectedCrypto(location.state.selectedCrypto);
            }
            if (location.state.selectedCurrency) {
                setSelectedCurrency(location.state.selectedCurrency);
            }
            if (location.state.selectedPaymentMethod) {
                setSelectedPaymentMethod(location.state.selectedPaymentMethod);
            }
            if (location.state.amountFilter) {
                setAmountFilter(location.state.amountFilter);
            }
        }
    }, [location.state]);

    // Обновление листингов при изменении фильтров
    useEffect(() => {
        filterListings();
    }, [selectedCrypto, selectedCurrency, selectedPaymentMethod, amountFilter]);

    // Функция для фильтрации объявлений
    const filterListings = () => {
        setLoading(true);
        setError(null);
        
        try {
            // Имитация запроса к API
            setTimeout(() => {
                let filtered = [...mockBuyListings];
                
                // Фильтрация по криптовалюте
                if (selectedCrypto) {
                    filtered = filtered.filter(listing => listing.crypto === selectedCrypto);
                }
                
                // Фильтрация по валюте
                if (selectedCurrency) {
                    filtered = filtered.filter(listing => listing.currency === selectedCurrency);
                }
                
                // Фильтрация по способу оплаты
                if (selectedPaymentMethod && selectedPaymentMethod !== "Все") {
                    filtered = filtered.filter(listing => 
                        listing.paymentMethods && listing.paymentMethods.includes(selectedPaymentMethod)
                    );
                }
                
                // Фильтрация по сумме
                if (amountFilter && !isNaN(parseFloat(amountFilter))) {
                    const amount = parseFloat(amountFilter);
                    filtered = filtered.filter(listing => 
                        (!listing.minAmount || listing.minAmount <= amount) && 
                        (!listing.maxAmount || listing.maxAmount >= amount)
                    );
                }
                
                setFilteredListings(filtered);
                setLoading(false);
            }, 500); // Имитация задержки загрузки
        } catch (err) {
            setError("Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.");
            setLoading(false);
        }
    };

    // Обработчик для перехода к выбору криптовалюты
    const handleCryptoChange = () => {
        navigate('/coinlist', { 
            state: { 
                type: 'p2p', 
                returnPath: '/p2p/buy',
                selectedCurrency,
                selectedPaymentMethod,
                amountFilter
            } 
        });
    };

    // Обработчик для перехода к выбору валюты
    const handleCurrencyChange = () => {
        navigate('/currencies', { 
            state: { 
                currentCurrency: selectedCurrency,
                returnPath: '/p2p/buy',
                selectedCrypto,
                selectedPaymentMethod,
                amountFilter
            } 
        });
    };

    // Обработчик для изменения способа оплаты
    const handlePaymentMethodChange = (method) => {
        setSelectedPaymentMethod(method);
    };

    // Обработчик для изменения суммы
    const handleAmountChange = (value) => {
        setAmountFilter(value);
    };

    // Обработчик клика по объявлению
    const handleItemClick = (listingId) => {
        console.log("Clicked listing with ID:", listingId);
        
        // Находим объявление по ID
        const selectedListing = filteredListings.find(listing => listing.id === listingId);
        
        if (!selectedListing) {
            console.error("Объявление не найдено:", listingId);
            return;
        }
        
        // Переходим на страницу деталей объявления
        navigate(`/p2p/buy/${listingId}`, {
            state: {
                listing: selectedListing,
                returnState: {
                    selectedCrypto,
                    selectedCurrency,
                    selectedPaymentMethod,
                    amountFilter
                }
            }
        });
    };

    return (
        <div className="flex flex-col h-full bg-gray-900">
            <FilterBar
                selectedCrypto={selectedCrypto}
                selectedCurrency={selectedCurrency}
                selectedPaymentMethod={selectedPaymentMethod}
                amountFilter={amountFilter}
                onCryptoChange={handleCryptoChange}
                onCurrencyChange={handleCurrencyChange}
                onPaymentMethodChange={handlePaymentMethodChange}
                onAmountChange={handleAmountChange}
            />
            
            <Listings
                listings={filteredListings}
                buttonType="buy"
                onItemClick={handleItemClick}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default BuyMenu;