import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SellPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [total, setTotal] = useState('0');
    const [error, setError] = useState('');
    
    // Получаем данные о выбранном объявлении и параметрах фильтрации из состояния навигации
    const { listing, selectedCrypto, selectedCurrency, selectedPaymentMethod, amountFilter } = location.state || {};
    
    // Получаем числовое значение цены
    const priceValue = listing ? listing.price : 0;
    
    // Обработка изменения суммы
    const handleAmountChange = (e) => {
        const value = e.target.value;
        
        // Проверка на допустимые символы (только цифры и точка)
        if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
            setAmount(value);
            
            if (value && !isNaN(parseFloat(value))) {
                const amountValue = parseFloat(value);
                const calculatedTotal = (amountValue * priceValue).toFixed(2);
                setTotal(calculatedTotal);
                
                // Проверка на лимиты
                if (listing) {
                    if (amountValue > listing.cryptoAmount) {
                        setError(`Максимально доступно: ${listing.cryptoAmountFormatted} ${listing.crypto}`);
                    } else if (calculatedTotal < listing.range.min) {
                        setError(`Минимальная сумма продажи: ${listing.range.min} ${listing.currency}`);
                    } else if (calculatedTotal > listing.range.max) {
                        setError(`Максимальная сумма продажи: ${listing.range.max} ${listing.currency}`);
                    } else {
                        setError('');
                    }
                }
            } else {
                setTotal('0');
                setError('');
            }
        }
    };
    
    // Функция для продажи всего доступного количества
    const handleSellAll = () => {
        const availableAmount = listing ? listing.cryptoAmount : 0;
        setAmount(availableAmount.toString());
        const calculatedTotal = (availableAmount * priceValue).toFixed(2);
        setTotal(calculatedTotal);
        setError('');
    };
    
    // Функция для возврата к списку объявлений
    const handleBack = () => {
        navigate('/sell', { 
            state: { 
                selectedCrypto, 
                selectedCurrency, 
                selectedPaymentMethod,
                amountFilter
            } 
        });
    };
    
    // Проверка, можно ли выполнить продажу
    const canSell = amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && !error;
    
    // Если нет данных об объявлении, показываем сообщение об ошибке
    if (!listing) {
        return (
            <div className="p-4">
                <div className="text-xl font-bold mb-4">Ошибка</div>
                <div className="text-center text-gray-500 my-8">
                    Данные объявления не найдены
                </div>
                <button
                    className="bg-green-500 text-white w-full py-3 rounded-lg mt-4"
                    onClick={handleBack}
                >
                    Вернуться к списку объявлений
                </button>
            </div>
        );
    }
    
    return (
        <div className="p-4">
            <div className="text-xl font-bold mb-4">Продать {listing.crypto}</div>
            
            {/* Информация о покупателе */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                    <img
                        src={listing.userImage}
                        alt="User"
                        className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                        <div className="font-medium">{listing.userName}</div>
                        <div className="text-xs text-gray-400">
                            Сделок: {listing.deals}
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                        Способы оплаты: {listing.paymentMethods}
                    </div>
                </div>
            </div>
            
            {/* Информация о цене и доступном количестве */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-gray-400">Цена:</div>
                    <div className="text-xl font-bold">{`${listing.priceFormatted} ${listing.currency}`}</div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="text-gray-400">Доступно:</div>
                    <div>{`${listing.cryptoAmountFormatted} ${listing.crypto}`}</div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="text-gray-400">Лимит:</div>
                    <div>{listing.rangeFormatted}</div>
                </div>
            </div>
            
            {/* Форма для ввода суммы продажи */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Сколько вы хотите продать?</label>
                    <div className="flex">
                        <input
                            type="text"
                            className={`bg-gray-700 text-white p-3 rounded-l-lg w-full ${error ? 'border border-red-500' : ''}`}
                            placeholder={`Введите количество ${listing.crypto}`}
                            value={amount}
                            onChange={handleAmountChange}
                        />
                        <button
                            className="bg-green-500 text-white px-4 rounded-r-lg"
                            onClick={handleSellAll}
                        >
                            Всё
                        </button>
                    </div>
                    {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Итого к получению:</label>
                    <div className="bg-gray-700 text-white p-3 rounded-lg">
                        {`${total} ${listing.currency}`}
                    </div>
                </div>
            </div>
            
            {/* Кнопки действий */}
            <div className="flex space-x-4">
                <button
                    className="bg-gray-700 text-white w-1/2 py-3 rounded-lg"
                    onClick={handleBack}
                >
                    Отмена
                </button>
                <button
                    className={`w-1/2 py-3 rounded-lg ${canSell ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                    onClick={() => {
                        if (canSell) {
                            alert('Функция продажи будет реализована в следующих версиях');
                        }
                    }}
                    disabled={!canSell}
                >
                    Продать
                </button>
            </div>
        </div>
    );
};

export default SellPage;
