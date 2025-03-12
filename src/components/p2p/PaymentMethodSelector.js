import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { p2pApi } from '../../services/api';

const PaymentMethodSelector = () => {
    const [selectedMethods, setSelectedMethods] = useState([]);
    const [availableMethods, setAvailableMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Initialize selected methods from location.state
        if (location.state?.selectedPaymentMethods) {
            setSelectedMethods(location.state.selectedPaymentMethods);
        }

        // Fetch available payment methods from API
        const fetchPaymentMethods = async () => {
            try {
                setLoading(true);
                const response = await p2pApi.getPaymentMethods();
                // Extract method names from the response
                const methodNames = response.data.map(method => method.name);
                setAvailableMethods(methodNames);
                setLoading(false);
            } catch (err) {
                setError('Failed to load payment methods');
                console.error('Error fetching payment methods:', err);
                setLoading(false);
            }
        };

        fetchPaymentMethods();
    }, [location.state]);

    const handleMethodToggle = (method) => {
        setSelectedMethods(prev => {
            if (prev.includes(method)) {
                return prev.filter(m => m !== method);
            } else {
                return [...prev, method];
            }
        });
    };

    const handleSave = () => {
        // Determine text to display in filter
        let displayPaymentMethod;

        if (selectedMethods.length === 0) {
            displayPaymentMethod = 'Все';
        } else if (selectedMethods.length === 1) {
            displayPaymentMethod = selectedMethods[0];
        } else {
            displayPaymentMethod = `${selectedMethods.length} методов`;
        }

        navigate(location.state?.returnPath || '/p2p/buy', {
            state: {
                ...location.state,
                selectedPaymentMethod: displayPaymentMethod,
                selectedPaymentMethods: selectedMethods
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
                <div className="text-white">Загрузка способов оплаты...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Способы оплаты</h2>
                <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    Сохранить
                </button>
            </div>

            <div className="space-y-2">
                {availableMethods.length > 0 ? (
                    availableMethods.map((method) => (
                        <div
                            key={method}
                            className="flex items-center justify-between bg-gray-800 p-4 rounded-lg"
                            onClick={() => handleMethodToggle(method)}>
                            <span>{method}</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={selectedMethods.includes(method)}
                                    readOnly
                                />
                                <div
                                    className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-400 py-8">
                        <p>Нет доступных способов оплаты</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentMethodSelector;