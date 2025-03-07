import React, { useState } from 'react';

const PaymentMethodsPage = () => {
    const [paymentMethods, setPaymentMethods] = useState([
        { id: 1, name: 'Сбербанк', details: '1234 5678 9012 3456', active: true },
        { id: 2, name: 'Тинькофф', details: '9876 5432 1098 7654', active: true },
        { id: 3, name: 'QIWI', details: '+7 999 123 45 67', active: false }
    ]);
    
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMethod, setNewMethod] = useState({ name: '', details: '' });
    
    const toggleMethodStatus = (id) => {
        setPaymentMethods(methods => 
            methods.map(method => 
                method.id === id ? { ...method, active: !method.active } : method
            )
        );
    };
    
    const deleteMethod = (id) => {
        setPaymentMethods(methods => methods.filter(method => method.id !== id));
    };
    
    const handleAddMethod = () => {
        if (newMethod.name && newMethod.details) {
            setPaymentMethods([
                ...paymentMethods, 
                { 
                    id: Date.now(), // Используем timestamp как временный id
                    name: newMethod.name,
                    details: newMethod.details,
                    active: true
                }
            ]);
            setNewMethod({ name: '', details: '' });
            setShowAddForm(false);
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
