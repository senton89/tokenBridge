import React, {useState, useEffect, useCallback, useMemo} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ListingItem from './ListingItem';
import FilterBar from './FilterBar';
import { p2pApi } from '../../services/api';

const BuyMenu = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Состояние для фильтров
    const [filters, setFilters] = useState({
        crypto: "USDT",
        currency: "RUB",
        paymentMethod: "Все",
        amount: ""
    });

    // При монтировании компонента инициализируем фильтры из state при навигации
    useEffect(() => {
        if (location.state) {
            setFilters(prevFilters => {
                const newFilters = { ...prevFilters };
                if (location.state.selectedCrypto) {
                    newFilters.crypto = location.state.selectedCrypto;
                }
                if (location.state.selectedCurrency) {
                    newFilters.currency = location.state.selectedCurrency;
                }
                if (location.state.selectedPaymentMethod) {
                    newFilters.paymentMethod = location.state.selectedPaymentMethod;
                }
                if (location.state.selectedPaymentMethods) {
                    newFilters.paymentMethods = location.state.selectedPaymentMethods;
                }
                if (location.state.amountFilter) {
                    newFilters.amount = location.state.amountFilter;
                }
                return newFilters;
            });
        }
    }, [location.state]);

    // Функция для фильтрации объявлений
    const fetchListings = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await p2pApi.getBuyListings({
                crypto: filters.crypto,
                currency: filters.currency,
                paymentMethod: filters.paymentMethod !== "Все" ? filters.paymentMethod : null,
                amount: filters.amount ? parseFloat(filters.amount) : null
            });

            setListings(response.data);
            setLoading(false);
        } catch (err) {
            setError("Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.");
            console.error('Error fetching listings:', err);
            setLoading(false);
        }
    }, [filters]);

    // Используем useMemo для мемоизации функции fetchListings
    const memoizedFetchListings = useMemo(() => fetchListings, [fetchListings]);

    useEffect(() => {
        memoizedFetchListings();
    }, [memoizedFetchListings]);

    // Обработчики изменения фильтров
    const handleCurrencyChange = useCallback(() => {
        navigate('/currencies', {
            state: {
                currentCurrency: filters.currency,
                returnPath: '/p2p/buy',
                ...filters
            }
        });
    }, [filters, navigate]);

    // Исправлено: добавлена проверка на currencyChange
    useEffect(() => {
        if (location.state && location.state.currencyChange) {
            handleCurrencyChange();
        }
    }, [handleCurrencyChange, location.state]);

    const handleCryptoChange = useCallback(() => {
        navigate('/coinlist', {
            state: {
                type: 'p2p',
                returnPath: '/p2p/buy',
                ...filters
            }
        });
    }, [filters, navigate]);

    const handlePaymentMethodChange = useCallback((method) => {
        setFilters(prev => ({
            ...prev,
            paymentMethod: method
        }));
    }, []);

    const handleAmountChange = useCallback((value) => {
        setFilters(prev => ({ ...prev, amount: value }));
    }, []);

    const handleListingClick = (listing) => {
        navigate(`/p2p/buy/${listing.id}`, {
            state: {
                listing,
                returnState: {
                    selectedCrypto: filters.crypto,
                    selectedCurrency: filters.currency,
                    selectedPaymentMethod: filters.paymentMethod,
                    amountFilter: filters.amount
                }
            }
        });
    };

    if (loading && listings.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <FilterBar
                initialSelectedCrypto={filters.crypto}
                initialSelectedCurrency={filters.currency}
                initialSelectedPaymentMethod={filters.paymentMethod}
                initialAmount={filters.amount}
                onCryptoChange={handleCryptoChange}
                onCurrencyChange={handleCurrencyChange}
                onPaymentMethodChange={handlePaymentMethodChange}
                onAmountChange={handleAmountChange}
            />

            {error && (
                <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mx-4 mb-4">
                    {error}
                </div>
            )}

            {loading && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                </div>
            )}

            <div className="space-y-4 px-4">
                {listings.map((listing) => (
                    <ListingItem
                        key={listing.id}
                        buttonType="buy"
                        listing={listing}
                        onClick={() => handleListingClick(listing)}
                    />
                ))}

                {listings.length === 0 && !loading && (
                    <div className="text-center text-gray-400 py-8">
                        <i className="fas fa-search text-3xl mb-2" />
                        <p>Объявления не найдены</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyMenu;