import React, {useState, useEffect, useCallback, useMemo} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ListingItem from './ListingItem';
import FilterBar from './FilterBar';
import { mockBuyListings } from '../../data/mockListings';

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
    const filterListings = useCallback(() => {
        setLoading(true);
        setError(null);

        const timerId = setTimeout(() => {
            try {
                let filtered = [...mockBuyListings];

                // Фильтрация по криптовалюте
                if (filters.crypto) {
                    filtered = filtered.filter(listing => listing.crypto === filters.crypto);
                }

                // Фильтрация по валюте
                if (filters.currency) {
                    filtered = filtered.filter(listing => listing.currency === filters.currency);
                }

                // Фильтрация по способу оплаты
                // if (filters.paymentMethod && filters.paymentMethod !== "Все") {
                //     filtered = filtered.filter(listing =>
                //         listing.paymentMethods.includes(filters.paymentMethod)
                //     );
                // } else if (filters.selectedPaymentMethods && filters.selectedPaymentMethods.length > 0) {
                //     // Filter by any of the selected payment methods
                //     filtered = filtered.filter(listing =>
                //         listing.paymentMethods.some(method =>
                //             filters.selectedPaymentMethods.includes(method)
                //         )
                //     );
                // }

                // Фильтрация по способу оплаты
                if (filters.paymentMethods && filters.paymentMethods.length > 0) {
                    // Фильтруем по любому из выбранных методов оплаты
                    filtered = filtered.filter(listing =>
                        listing.paymentMethods.some(method =>
                            filters.paymentMethods.includes(method)
                        )
                    );
                }
                // Фильтрация по сумме
                if (filters.amount && !isNaN(parseFloat(filters.amount))) {
                    const amount = parseFloat(filters.amount);
                    filtered = filtered.filter(listing =>
                        (!listing.minAmount || listing.minAmount <= amount) &&
                        (!listing.maxAmount || listing.maxAmount >= amount)
                    );
                }

                setListings(filtered);
                setLoading(false);
            } catch (err) {
                setError("Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.");
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timerId);
    }, [filters]);

    const memoizedFilterListings = useMemo(() => filterListings, [filterListings]);

    useEffect(() => {
        const cleanup = memoizedFilterListings();
        return cleanup;
    }, [memoizedFilterListings]);

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
        console.log("Clicked listing with ID:", listing.id);
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