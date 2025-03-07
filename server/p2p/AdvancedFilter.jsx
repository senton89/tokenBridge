import React from 'react';

const AdvancedFilter = ({ onFilterChange }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange(name, value);
    };

    return (
        <div className="p-4 bg-gray-800 rounded-lg">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Цена за 1 USDT</label>
                <input
                    type="range"
                    name="price"
                    min="0"
                    max="100"
                    onChange={handleChange}
                    className="w-full"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Метод оплаты</label>
                <select
                    name="paymentMethod"
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                >
                    <option value="all">Все</option>
                    <option value="SberBank">СберБанк</option>
                    <option value="Tinkoff">Тинькофф</option>
                    <option value="QIWI">QIWI</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Рейтинг продавца</label>
                <input
                    type="number"
                    name="rating"
                    min="0"
                    max="5"
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
            </div>
        </div>
    );
};

export default AdvancedFilter;
