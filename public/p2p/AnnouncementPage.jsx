import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockBuyListings, mockSellListings } from '../../data/mockListings';

const AnnouncementPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Получаем тип объявления из location.state (если есть)
    const initialAdType = location.state?.adType || 'buy';
    
    const coins = [
        { id: 1, name: 'Toncoin', logo: './toncoin.png', symbol: 'TON' },
        { id: 2, name: 'Tether', logo: './tether.png', symbol: 'USDT' },
        { id: 3, name: 'Notcoin', logo: './notcoin.png', symbol: 'NOT' },
        { id: 4, name: 'Bitcoin', logo: './bitcoin.png', symbol: 'BTC' },
        { id: 5, name: 'Ethereum', logo: './etherium.png', symbol: 'ETH' },
        { id: 6, name: 'Solana', logo: './solana.png', symbol: 'SOL' },
        { id: 7, name: 'TRON', logo: './tron.png', symbol: 'TRX' },
        { id: 8, name: 'Dogecoin', logo: './dogecoin.png', symbol: 'DOGE' },
    ];

    const [isFixedPrice, setIsFixedPrice] = useState(false);
    const [priceType, setPriceType] = useState('Плавающая');
    const [isBuy, setIsBuy] = useState(initialAdType === 'buy');
    const [selectedCurrency, setSelectedCurrency] = useState('USDT');
    const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
    const [price, setPrice] = useState('');
    const [percent, setPercent] = useState('');
    const [amount, setAmount] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [step, setStep] = useState(1);
    const [roundAmount, setRoundAmount] = useState(false);
    const [paymentTime, setPaymentTime] = useState(15);

    // Устанавливаем начальный тип объявления на основе переданных параметров
    useEffect(() => {
        if (location.state?.adType) {
            setIsBuy(location.state.adType === 'buy');
        }
    }, [location.state]);

    const handlePriceTypeChange = (type) => {
        setPriceType(type);
        if (type === 'Фиксированная') {
            setIsFixedPrice(true);
        } else {
            setIsFixedPrice(false);
        }
    };

    const handleBuySellChange = (isBuy) => {
        setIsBuy(isBuy);
    };

    const handleCurrencyChange = (currency) => {
        setSelectedCurrency(currency);
        setShowCurrencyMenu(false);
    };
    
    const handlePriceChange = (e) => {
        setPrice(e.target.value);
    };
    
    const handlePercentChange = (e) => {
        setPercent(e.target.value);
    };
    
    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };
    
    const handleMinAmountChange = (e) => {
        setMinAmount(e.target.value);
    };
    
    const handleMaxAmountChange = (e) => {
        setMaxAmount(e.target.value);
    };
    
    const handleRoundAmountChange = () => {
        setRoundAmount(!roundAmount);
    };
    
    // Функция для создания нового объявления
    const createNewListing = () => {
        // Создаем новое объявление на основе введенных данных
        const newListing = {
            id: Date.now(), // Используем timestamp как временный ID
            advertiser: 'Ваше имя', // В реальном приложении это будет имя пользователя
            completedDeals: 0,
            completionRate: 100,
            price: isFixedPrice ? parseFloat(price) : 97.50, // Используем введенную цену или рыночную
            crypto: selectedCurrency,
            currency: 'RUB', // Пока используем только RUB
            minAmount: minAmount ? parseFloat(minAmount) : 500,
            maxAmount: maxAmount ? parseFloat(maxAmount) : null,
            paymentMethods: ['Тинькофф', 'Сбербанк'], // В реальном приложении это будет выбираться пользователем
            status: 'active', // По умолчанию объявление активно
            roundAmount: roundAmount,
            paymentTime: paymentTime
        };
        
        // Сохраняем объявление (в реальном приложении это будет отправка на сервер)
        // Здесь мы просто имитируем сохранение
        if (isBuy) {
            // Добавляем в начало массива mockBuyListings
            mockBuyListings.unshift(newListing);
        } else {
            // Добавляем в начало массива mockSellListings
            mockSellListings.unshift(newListing);
        }
        
        // Перенаправляем на страницу с объявлениями
        navigate('/p2p/my-ads', { state: { newListing: true } });
    };
    
    // Функция для перехода к следующему шагу
    const handleNextStep = () => {
        if (step < 5) {
            setStep(step + 1);
        } else {
            // Если это последний шаг, создаем объявление
            createNewListing();
        }
    };
    
    // Функция для возврата к предыдущему шагу
    const handlePrevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            // Если это первый шаг, возвращаемся на страницу с объявлениями
            navigate('/p2p/my-ads');
        }
    };
    
    // Функция для отмены создания объявления
    const handleCancel = () => {
        if (window.confirm('Вы уверены, что хотите отменить создание объявления? Все введенные данные будут потеряны.')) {
            navigate('/p2p/my-ads');
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <div className="flex items-center justify-between p-2 rounded">
                <div className="flex items-center">
                    <button 
                        onClick={handlePrevStep}
                        className="mr-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="text-white font-bold">Создайте объявление</span>
                </div>
                <span className="text-white">{step} / 5</span>
            </div>

            <div className="bg-gray-800 pt-1 p-6 rounded">
                <div className="flex justify-between rounded">
                    <span className="w-1/3 py-2">Я хочу</span>
                    <button
                        className={`w-1/4 text-center py-2 ${
                            isBuy ? 'text-blue-500 border-b-2 border-blue-600' : ''
                        }`}
                        onClick={() => handleBuySellChange(true)}
                    >
                        Купить
                    </button>
                    <button
                        className={`w-1/5 text-center py-2 ${
                            !isBuy ? 'text-blue-500 border-b-2 border-blue-600' : ''
                        }`}
                        onClick={() => handleBuySellChange(false)}
                    >
                        Продать
                    </button>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span>{isBuy ? 'Купить криптовалюту' : 'Продать криптовалюту'}</span>
                    <div className="relative">
                        <button
                            className="text-blue-500"
                            onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                        >
                            {selectedCurrency}
                        </button>
                        {showCurrencyMenu && (
                            <div className="absolute right-0 bg-gray-800 p-2 rounded z-10 shadow-lg">
                                {coins.map((coin) => (
                                    <button
                                        key={coin.id}
                                        className="block text-white py-2 px-4 hover:bg-gray-700 w-full text-left"
                                        onClick={() => handleCurrencyChange(coin.symbol)}
                                    >
                                        {coin.name} ({coin.symbol})
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span>Национальная валюта</span>
                    <span className="text-blue-500">RUB</span>
                </div>
                <div className="flex justify-between items-center pb-1 pt-2 border-gray-700">
                    <span>Тип цены</span>
                    <div className="relative">
                        <button
                            className="text-blue-500"
                            onClick={() => handlePriceTypeChange(priceType === 'Плавающая' ? 'Фиксированная' : 'Плавающая')}
                        >
                            {priceType}
                        </button>
                    </div>
                </div>
            </div>

            {isFixedPrice ? (
                <div className="mt-4 bg-gray-800 px-6 p-2 rounded">
                    <label className="block text-blue-500">Фиксированная цена</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="0"
                            maxLength="10"
                            className="bg-gray-800 text-white pl-0 p-2 mt-1 w-full border-b border-gray-700"
                            value={price}
                            onChange={handlePriceChange}
                        />
                        <span className="absolute right-0 top-0 mt-3 text-gray-400">RUB</span>
                    </div>
                </div>
            ) : (
                <div className="mt-4 bg-gray-800 px-6 p-2 rounded">
                    <label className="block text-blue-500">Процент от рыночной цены</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="80 ~ 120"
                            maxLength="3"
                            className="bg-gray-800 text-white pl-0 p-2 mt-1 w-full border-b border-gray-700"
                            value={percent}
                            onChange={handlePercentChange}
                        />
                        <span className="absolute right-0 top-0 mt-3 text-gray-400">%</span>
                    </div>
                </div>
            )}

            <div>
                <div className="p-2 rounded">
                    <div>
                        <p className="text-gray-400 inline">Рыночная цена:</p> 97,50 ₽ за 1 {selectedCurrency}
                    </div>
                    <p>Ваша цена: {isFixedPrice ? (price || '0') : '97,50'} ₽ за 1 {selectedCurrency}</p>
                </div>

                <div className="mt-4 bg-gray-800 rounded-lg px-6 p-2">
                    <label className="block text-blue-500">Сумма</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="10 ~ 20000"
                            className="w-full bg-gray-800 text-white pl-0 p-2 mt-1 rounded border-b border-gray-700"
                            value={amount}
                            onChange={handleAmountChange}
                        />
                        <span className="absolute right-0 top-0 mt-3 text-gray-400">{selectedCurrency}</span>
                    </div>
                </div>

                <div className="mt-2 flex justify-between items-center ml-4">
                    <span className="inline">
                        <span className="text-gray-400 inline">Ваш баланс:</span> 0 {selectedCurrency} <button className="text-blue-500">Макс.</button>
                    </span>
                </div>

                <div className="mt-4 bg-gray-800 rounded-lg px-6 p-2">
                    <label className="block text-blue-500">Мин. и макс. сумма сделки</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Мин. 500"
                            className="w-full bg-gray-800 text-white p-2 mt-1 border-b border-gray-700"
                            value={minAmount}
                            onChange={handleMinAmountChange}
                        />
                        <span className="absolute right-0 top-0 mt-3 text-gray-400">RUB</span>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Макс."
                            className="w-full bg-gray-800 text-white p-2 border-b border-gray-700"
                            value={maxAmount}
                            onChange={handleMaxAmountChange}
                        />
                        <span className="absolute right-0 top-0 mt-3 text-gray-400">RUB</span>
                    </div>
                </div>
                <p className="text-gray-500 ml-4 text-sm mt-2 mb-4">Макс. можно не указывать.</p>
            </div>

            <div className="bg-gray-800 px-6 p-4 rounded-lg mb-4">
                <span>Время на оплату</span>
                <span className="text-blue-500 absolute right-0 mr-16">{paymentTime} мин</span>
            </div>

            <div className="bg-gray-800 px-6 p-4 rounded-lg mb-2 flex justify-between">
                <span className="flex-1">Округлять сумму сделки</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={roundAmount}
                        onChange={handleRoundAmountChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
            </div>
            <p className="text-gray-500 text-sm">Сумма округлится в меньшую сторону. Пример: при сумме 1045,85 RUB вы получите 1045 RUB.</p>

            {/* Кнопки действий */}
            <div className="mt-4 flex space-x-4">
                <button 
                    className="w-1/3 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded transition-colors duration-200"
                    onClick={handleCancel}
                >
                    Отмена
                </button>
                <button 
                    className="w-2/3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-3 rounded transition-colors duration-200"
                    onClick={handleNextStep}
                >
                    {step === 5 ? 'Создать' : 'Далее'}
                </button>
            </div>
        </div>
    );
};

export default AnnouncementPage;