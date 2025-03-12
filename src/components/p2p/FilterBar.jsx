import React, {useState, useEffect, useCallback, useRef} from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { listingsApi } from '../../services/api';

const FilterBar = ({
                       initialSelectedCrypto,
                       initialSelectedCurrency,
                       initialSelectedPaymentMethod,
                       initialAmount,
                       onCryptoChange,
                       onCurrencyChange,
                       onPaymentMethodChange,
                       onAmountChange
                   }) => {
    const [selectedCrypto, setSelectedCrypto] = useState(initialSelectedCrypto);
    const [selectedCurrency, setSelectedCurrency] = useState(initialSelectedCurrency);
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
    const [selectedAmount, setSelectedAmount] = useState(initialAmount);
    const [availableCoins, setAvailableCoins] = useState([]);
    const [availableCurrencies, setAvailableCurrencies] = useState([]);
    const amountTimeoutRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const coinsResponse = await listingsApi.getCoins();
                setAvailableCoins(coinsResponse.data);

                const currenciesResponse = await listingsApi.getCurrencies();
                setAvailableCurrencies(currenciesResponse.data);
            } catch (error) {
                console.error('Error fetching filter data:', error);
            }
        };

        fetchData();
    }, []);

    // Инициализируем массив выбранных методов из location.state
    useEffect(() => {
        if (location.state?.selectedPaymentMethods) {
            setSelectedPaymentMethods(location.state.selectedPaymentMethods);
            // Notify parent component about the change
            if (onPaymentMethodChange) {
                onPaymentMethodChange(location.state.selectedPaymentMethods);
            }
        }
    }, [location.state, onPaymentMethodChange]);

    const handlePaymentMethodChange = () => {
        navigate('/p2p/payment-method-select', {
            state: {
                returnPath: location.pathname,
                selectedCrypto,
                selectedCurrency,
                selectedPaymentMethods,
                amountFilter: selectedAmount
            }
        });
    };

    const handleCurrencyChange = () => {
        navigate('/currencies', {
            state: {
                returnPath: location.pathname,
                availableCurrencies,
                selectedCurrency,
                onSelect: (currency) => {
                    setSelectedCurrency(currency);
                    if (onCurrencyChange) {
                        onCurrencyChange(currency);
                    }
                }
            }
        });
    };

    const handleCryptoChange = () => {
        navigate('/coinlist', {
            state: {
                returnPath: location.pathname,
                availableCoins,
                selectedCrypto,
                onSelect: (crypto) => {
                    setSelectedCrypto(crypto);
                    if (onCryptoChange) {
                        onCryptoChange(crypto);
                    }
                }
            }
        });
    };

    // Оптимизированная функция изменения суммы с debounce
    const handleAmountChange = useCallback((e) => {
        const value = e.target.value;
        setSelectedAmount(value);

        if (amountTimeoutRef.current) {
            clearTimeout(amountTimeoutRef.current);
        }

        amountTimeoutRef.current = setTimeout(() => {
            if (onAmountChange) {
                onAmountChange(value);
            }
        }, 300);
    }, [onAmountChange]);


    // Очистка таймаута при размонтировании компонента
    useEffect(() => {
        return () => {
            if (amountTimeoutRef.current) {
                clearTimeout(amountTimeoutRef.current);
            }
        };
    }, []);

    // Формируем текст для отображения в фильтре
    const getPaymentMethodDisplayText = () => {
        if (!selectedPaymentMethods || selectedPaymentMethods.length === 0) {
            return "Все";
        } else if (selectedPaymentMethods.length === 1) {
            return selectedPaymentMethods[0];
        } else {
            return `${selectedPaymentMethods.length} методов`;
        }
    };

    return (
        <div className="flex justify-between px-4 py-2 text-xs text-gray-400">
            <div className="flex space-x-2 w-full">
                <button
                    className="bg-gray-800 text-white pl-3 py-1 rounded flex flex-row text-left w-1/4"
                    onClick={handlePaymentMethodChange}
                >
                    <div className="flex flex-col text-gray-400 pr-6">
                        Оплата
                        <span className="font-bold text-white text-sm max-w-12 truncate">
              {getPaymentMethodDisplayText()}
            </span>
                    </div>
                    <div className="flex flex-col pr-2">
                        <i className="fas fa-chevron-up ml-2 mt-2"></i>
                        <i className="fas fa-chevron-down ml-2"></i>
                    </div>
                </button>

                <button
                    className="bg-gray-800 text-white pl-3 py-1 rounded flex flex-row text-left w-1/4"
                    onClick={handleCurrencyChange}
                >
                    <div className="flex flex-col text-gray-400 pr-6">
                        Валюта
                        <span className="font-bold text-white text-sm max-w-12 truncate">
              {selectedCurrency}
            </span>
                    </div>
                    <div className="flex flex-col pr-2">
                        <i className="fas fa-chevron-down ml-2 mt-4"></i>
                    </div>
                </button>

                <button
                    className="bg-gray-800 text-white pl-3 py-1 rounded flex flex-row text-left w-1/4"
                    onClick={handleCryptoChange}
                >
                    <div className="flex flex-col text-gray-400 pr-6">
                        Крипта
                        <span className="font-bold text-white text-sm max-w-12 truncate">
              {selectedCrypto}
            </span>
                    </div>
                    <div className="flex flex-col pr-2">
                        <i className="fas fa-chevron-down ml-2 mt-4"></i>
                    </div>
                </button>

                <button className="bg-gray-800 text-gray-400 px-3 py-1 rounded w-1/4 flex flex-col">
                    Сумма
                    <div>
                        <input
                            className="bg-gray-800 text-white rounded text-sm w-20 font-bold"
                            type="text"
                            placeholder={`10.00 ${selectedCurrency}`}
                            value={selectedAmount}
                            onChange={handleAmountChange}
                        />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default React.memo(FilterBar);