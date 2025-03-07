import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {listingsApi, p2pApi} from '../../services/api';

const AnnouncementPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Получаем тип объявления из location.state (если есть)
    const initialAdType = location.state?.adType || 'buy';
    const editMode = location.state?.editMode || false;
    const adToEdit = location.state?.ad || null;

    const [coins, setCoins] = useState([]);
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
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
    const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
    const [terms, setTerms] = useState('');
    const [autoReply, setAutoReply] = useState('');

    useEffect(() => {
        const fetchCoins = async () => {
            try {
                const response = await listingsApi.getCoins();
                setCoins(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchCoins();
    }, []);

    // Устанавливаем начальный тип объявления на основе переданных параметров
    useEffect(() => {
        if (editMode && adToEdit) {
            setIsBuy(adToEdit.type === 'buy');
            setSelectedCurrency(adToEdit.asset || adToEdit.crypto || 'USDT');
            setIsFixedPrice(true);
            setPriceType('Фиксированная');
            setPrice(adToEdit.price?.toString() || '');
            setAmount(adToEdit.available?.toString() || adToEdit.availableAmount?.toString() || '');
            setMinAmount(adToEdit.minAmount?.toString() || '');
            setMaxAmount(adToEdit.maxAmount?.toString() || '');
            setRoundAmount(adToEdit.roundAmount || false);
            setPaymentTime(adToEdit.paymentTime || 15);
            setSelectedPaymentMethods(adToEdit.paymentMethods || []);
            setTerms(adToEdit.terms || '');
            setAutoReply(adToEdit.autoReply || '');
        }
    }, [editMode, adToEdit]);

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

    const handlePaymentMethodsClick = () => {
        setShowPaymentMethodsModal(true);
    };

    const handlePaymentMethodToggle = (method) => {
        setSelectedPaymentMethods(prev => {
            if (prev.includes(method)) {
                return prev.filter(m => m !== method);
            } else {
                return [...prev, method];
            }
        });
    };

    const handleTermsChange = (e) => {
        setTerms(e.target.value);
    };

    const handleAutoReplyChange = (e) => {
        setAutoReply(e.target.value);
    };

    // Функция для создания нового объявления
    const createNewListing = async () => {
        try {
            // Создаем новое объявление на основе введенных данных
            const newListing = {
                type: isBuy ? 'buy' : 'sell',
                crypto: selectedCurrency,
                currency: 'RUB', // Пока используем только RUB
                price: isFixedPrice ? parseFloat(price) : null,
                pricePercent: !isFixedPrice ? parseFloat(percent) : null,
                available: amount ? parseFloat(amount) : 0,
                minAmount: minAmount ? parseFloat(minAmount) : null,
                maxAmount: maxAmount ? parseFloat(maxAmount) : null,
                paymentMethods: selectedPaymentMethods,
                roundAmount: roundAmount,
                paymentTime: paymentTime,
                terms: terms,
                autoReply: autoReply
            };

            if (editMode && adToEdit) {
                // Обновляем существующее объявление
                await p2pApi.updateAd(adToEdit.id, newListing);
            } else {
                // Добавляем новое объявление
                await p2pApi.createAd(newListing);
            }

            // Перенаправляем на страницу с объявлениями
            navigate('/p2p/my-ads', { state: { newListing: true } });
        } catch (error) {
            console.error('Error creating/updating ad:', error);
            // Здесь можно добавить обработку ошибок, например, показать уведомление
        }
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

    // Рендеринг содержимого в зависимости от текущего шага
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <div className="bg-gray-800 pt-1 p-6 rounded-lg mb-4">
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
                            <div className="mt-4 bg-gray-800 px-6 p-4 rounded-lg">
                                <label className="block text-blue-500 mb-2">Фиксированная цена</label>
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
                            <div className="mt-4 bg-gray-800 px-6 p-4 rounded-lg">
                                <label className="block text-blue-500 mb-2">Процент от рыночной цены</label>
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

                        <div className="p-2 rounded mt-2">
                            <div>
                                <p className="text-gray-400 inline">Рыночная цена:</p> 97,50 ₽ за 1 {selectedCurrency}
                            </div>
                            <p>Ваша цена: {isFixedPrice ? (price || '0') : '97,50'} ₽ за 1 {selectedCurrency}</p>
                        </div>
                    </>
                );
            case 2:
                return (
                    <>
                        <div className="mt-4 bg-gray-800 rounded-lg px-6 p-4">
                            <label className="block text-blue-500 mb-2">Сумма</label>
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

                        <div className="mt-4 bg-gray-800 rounded-lg px-6 p-4">
                            <label className="block text-blue-500 mb-2">Мин. и макс. сумма сделки</label>
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
                    </>
                );
            case 3:
                return (
                    <>
                        <div className="bg-gray-800 px-6 p-4 rounded-lg mb-4">
                            <div className="flex justify-between items-center">
                                <span>Время на оплату</span>
                                <div className="flex items-center">
                                    <button
                                        className="bg-gray-700 w-8 h-8 rounded-full text-center"
                                        onClick={() => setPaymentTime(Math.max(5, paymentTime - 5))}
                                    >
                                        -
                                    </button>
                                    <span className="text-blue-500 mx-3">{paymentTime} мин</span>
                                    <button
                                        className="bg-gray-700 w-8 h-8 rounded-full text-center"
                                        onClick={() => setPaymentTime(Math.min(60, paymentTime + 5))}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 px-6 p-4 rounded-lg mb-4 flex justify-between items-center">
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

                        <p className="text-gray-500 text-sm mb-4">Сумма округлится в меньшую сторону. Пример: при сумме 1045,85 RUB вы получите 1045 RUB.</p>

                        <div className="bg-gray-800 px-6 p-4 rounded-lg mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <span>Способы оплаты</span>
                                <button
                                    className="text-blue-500"
                                    onClick={handlePaymentMethodsClick}
                                >
                                    Выбрать
                                </button>
                            </div>

                            {selectedPaymentMethods.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {selectedPaymentMethods.map(method => (
                                        <div key={method} className="bg-gray-700 rounded-lg px-3 py-1 text-sm">
                                            {method}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">Не выбрано</p>
                            )}
                        </div>
                    </>
                );
            case 4:
                return (
                    <>
                        <div className="bg-gray-800 px-6 p-4 rounded-lg mb-4">
                            <label className="block mb-2">Условия сделки</label>
                            <textarea
                                className="w-full bg-gray-700 rounded-lg p-3 min-h-[100px] text-sm"
                                placeholder="Укажите условия сделки, например: 'Оплата только с личного счета. Перевод в течение 15 минут.'"
                                value={terms}
                                onChange={handleTermsChange}
                            ></textarea>
                        </div>

                        <div className="bg-gray-800 px-6 p-4 rounded-lg mb-4">
                            <label className="block mb-2">Автоматический ответ</label>
                            <textarea
                                className="w-full bg-gray-700 rounded-lg p-3 min-h-[100px] text-sm"
                                placeholder="Укажите текст, который будет автоматически отправлен контрагенту при начале сделки."
                                value={autoReply}
                                onChange={handleAutoReplyChange}
                            ></textarea>
                        </div>
                    </>
                );
            case 5:
                return (
                    <>
                        <div className="bg-gray-800 px-6 p-4 rounded-lg mb-4">
                            <h3 className="text-lg font-bold mb-4">Проверьте детали объявления</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Тип:</span>
                                    <span>{isBuy ? 'Покупка' : 'Продажа'}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-400">Криптовалюта:</span>
                                    <span>{selectedCurrency}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-400">Цена:</span>
                                    <span>{isFixedPrice ? (price || '0') : '97,50'} RUB</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-400">Доступно:</span>
                                    <span>{amount || '0'} {selectedCurrency}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-400">Лимиты:</span>
                                    <span>
                    {minAmount || '0'}
                                        {maxAmount ? ` - ${maxAmount}` : ''} RUB
                  </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-400">Способы оплаты:</span>
                                    <span>{selectedPaymentMethods.length > 0 ? selectedPaymentMethods.join(', ') : 'Не выбрано'}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-400">Время на оплату:</span>
                                    <span>{paymentTime} мин</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-400">Округление суммы:</span>
                                    <span>{roundAmount ? 'Да' : 'Нет'}</span>
                                </div>
                            </div>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    // Модальное окно выбора способов оплаты
    const PaymentMethodsModal = () => {
        if (!showPaymentMethodsModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Способы оплаты</h3>
                        <button
                            className="text-gray-400 hover:text-white"
                            onClick={() => setShowPaymentMethodsModal(false)}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {availablePaymentMethods.map((method) => (
                            <div
                                key={method}
                                className="flex items-center justify-between bg-gray-700 p-4 rounded-lg"
                            >
                                <span>{method}</span>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={selectedPaymentMethods.includes(method)}
                                        onChange={() => handlePaymentMethodToggle(method)}
                                    />
                                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                            onClick={() => setShowPaymentMethodsModal(false)}
                        >
                            Готово
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <div className="flex items-center justify-between p-2 rounded mb-4">
                <div className="flex items-center">
                    <button
                        onClick={handlePrevStep}
                        className="mr-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="text-white font-bold">{editMode ? 'Редактировать объявление' : 'Создать объявление'}</span>
                </div>
                <span className="text-white">{step} / 5</span>
            </div>

            {renderStepContent()}

            {/* Кнопки действий */}
            <div className="mt-6 flex space-x-4">
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
                    {step === 5 ? (editMode ? 'Сохранить' : 'Создать') : 'Далее'}
                </button>
            </div>

            {/* Модальное окно выбора способов оплаты */}
            <PaymentMethodsModal />
        </div>
    );
};

export default AnnouncementPage;