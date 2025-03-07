import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { availablePaymentMethods } from '../../data/mockListings';

const PaymentMethodSelector = () => {
    const [selectedMethods, setSelectedMethods] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Инициализируем выбранные методы из location.state
        if (location.state?.selectedPaymentMethods) {
            setSelectedMethods(location.state.selectedPaymentMethods);
        }
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
        // Определяем текст для отображения в фильтре
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
                {availablePaymentMethods.map((method) => (
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
                            />
                            <div
                                className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethodSelector;