import React, {useEffect, useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {listingsApi} from "../services/api";

function CurrencySelector() {
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedCurrency, setSelectedCurrency] = React.useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                setLoading(true);
                const response = await listingsApi.getCurrencies();
                setCurrencies(response.data);
            } catch (err) {
                console.error('Error fetching currencies:', err);
                setError('Не удалось загрузить список валют');
            } finally {
                setLoading(false);
            }
        };

        fetchCurrencies();
    }, []);

// Добавить обработку состояния загрузки
    if (loading) {
        return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>;
    }

    if (error) {
        return <div className="text-red-500 p-12 text-center">{error}</div>;
    }

    useEffect(() => {
        setSelectedCurrency(location.state.currentCurrency);
    }, [location.state.currentCurrency]);

    const handleCurrencySelect = (currency) => {
        setSelectedCurrency(currency);
        navigate(location.state.returnPath, { state: { selectedCurrency: currency, ...location.state } });
    };

    return (
        <div className="mx-auto p-4">
            <h1 className="text-gray-400 text-lg mb-4">
                БАЗОВАЯ ВАЛЮТА
            </h1>
            <div className="space-y-4">
                {currencies.map((currency,index) => (
                    <div key={currency.name}>
                        <div className="flex items-center justify-between cursor-pointer"
                         onClick={() => handleCurrencySelect(currency.name)}>
                        <div className="flex items-center space-x-4">
                            <div className="bg-gray-700 w-12 h-12 rounded-full text-xl flex items-center justify-center">
                                <b>{currency.symbol}</b>
                            </div>
                            <div>
                                <div className="text-lg">
                                    {currency.name}
                                </div>
                                <div className="text-gray-400 text-sm">
                                    {currency.description}
                                </div>
                            </div>
                        </div>
                       {selectedCurrency === currency.name && (
                            <div className="rounded-full w-12 h-12 flex items-center justify-center">
                                <i className="fas fa-check-circle text-2xl text-blue-400" />
                            </div>
                        )}
                    </div>
                    {index < currencies.length - 1 && (
                        <div className="border-b border-gray-600 opacity-50 mb-2 mt-2 ml-16"></div>
                    )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CurrencySelector;