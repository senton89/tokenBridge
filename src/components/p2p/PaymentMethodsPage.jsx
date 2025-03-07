import React, {useEffect, useState} from 'react';
import { p2pApi } from '../../services/api';

const PaymentMethodsPage = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMethod, setNewMethod] = useState({ name: '', details: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            const response = await p2pApi.getPaymentMethods();
            setPaymentMethods(response.data);
            setLoading(false);
        } catch (err) {
            setError('Не удалось загрузить способы оплаты');
            console.error('Error fetching payment methods:', err);
            setLoading(false);
        }
    };
    const toggleMethodStatus = async (id) => {
        try {
            const method = paymentMethods.find(m => m.id === id);
            if (!method) return;

            await p2pApi.updatePaymentMethod(id, {
                ...method,
                active: !method.active
            });

            // Обновляем локальное состояние
            setPaymentMethods(methods =>
                methods.map(method =>
                    method.id === id ? { ...method, active: !method.active } : method
                )
            );
        } catch (err) {
            setError('Не удалось обновить статус способа оплаты');
            console.error('Error updating payment method status:', err);
        }
    };

    const deleteMethod = async (id) => {
        try {
            await p2pApi.deletePaymentMethod(id);
            // Обновляем локальное состояние
            setPaymentMethods(methods => methods.filter(method => method.id !== id));
        } catch (err) {
            setError('Не удалось удалить способ оплаты');
            console.error('Error deleting payment method:', err);
        }
    };

    const handleAddMethod = async () => {
        if (newMethod.name && newMethod.details) {
            try {
                const response = await p2pApi.addPaymentMethod({
                    name: newMethod.name,
                    details: newMethod.details,
                    active: true
                });

                // Добавляем новый метод в локальное состояние
                setPaymentMethods([
                    ...paymentMethods,
                    response.data
                ]);

                setNewMethod({ name: '', details: '' });
                setShowAddForm(false);
            } catch (err) {
                setError('Не удалось добавить способ оплаты');
                console.error('Error adding payment method:', err);
            }
        }
    };
    
    return (
        <div className="max-w-md mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Способы оплаты</h2>
                <button 
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    onClick={() => setShowAddForm(true)}
                >
                    <i className="fas fa-plus mr-2"></i>
                    Добавить
                </button>
            </div>
            
            {/* Payment methods list */}
            <div className="space-y-4">
                {paymentMethods.map(method => (
                    <div key={method.id} className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold">{method.name}</span>
                            <div className="flex items-center">
                                <button 
                                    className={`px-2 py-1 rounded text-xs mr-2 ${method.active ? 'bg-green-900 text-green-400' : 'bg-gray-700 text-gray-400'}`}
                                    onClick={() => toggleMethodStatus(method.id)}
                                >
                                    {method.active ? 'Активен' : 'Неактивен'}
                                </button>
                                <button 
                                    className="text-red-500"
                                    onClick={() => deleteMethod(method.id)}
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div className="text-gray-400">{method.details}</div>
                    </div>
                ))}
                
                {paymentMethods.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                        <p>У вас нет добавленных способов оплаты</p>
                        <button 
                            className="text-blue-500 mt-2"
                            onClick={() => setShowAddForm(true)}
                        >
                            Добавить способ оплаты
                        </button>
                    </div>
                )}
            </div>
            
            {/* Add payment method form */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Добавить способ оплаты</h3>
                        
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Название</label>
                            <input 
                                type="text" 
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                                placeholder="Например: Сбербанк"
                                value={newMethod.name}
                                onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
                            />
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-gray-400 mb-2">Реквизиты</label>
                            <input 
                                type="text" 
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                                placeholder="Номер карты или счета"
                                value={newMethod.details}
                                onChange={(e) => setNewMethod({...newMethod, details: e.target.value})}
                            />
                        </div>
                        
                        <div className="flex space-x-2">
                            <button 
                                className="bg-gray-700 text-white px-4 py-2 rounded flex-1"
                                onClick={() => setShowAddForm(false)}
                            >
                                Отмена
                            </button>
                            <button 
                                className="bg-blue-500 text-white px-4 py-2 rounded flex-1"
                                onClick={handleAddMethod}
                            >
                                Добавить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentMethodsPage;
