import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {listingsApi, p2pApi} from '../../services/api';

const availablePaymentMethods = [
    'Сбербанк',
    'Тинькофф',
    'QIWI',
    'Yandex.Money',
    'Альфа-Банк',
    'ВТБ',
    'Райффайзен',
    'Почта Банк',
    'Наличные'
];

const AnnouncementPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get ad type from location.state (if exists)
    const initialAdType = location.state?.adType || 'buy';
    const editMode = location.state?.editMode || false;
    const adToEdit = location.state?.ad || null;

    const [coins, setCoins] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [isFixedPrice, setIsFixedPrice] = useState(true);
    const [priceType, setPriceType] = useState('Фиксированная');
    const [isBuy, setIsBuy] = useState(initialAdType === 'buy');
    const [selectedCurrency, setSelectedCurrency] = useState('USDT');
    const [selectedFiatCurrency, setSelectedFiatCurrency] = useState('RUB');
    const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
    const [showFiatCurrencyMenu, setShowFiatCurrencyMenu] = useState(false);
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [marketPrice, setMarketPrice] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [coinsResponse, currenciesResponse] = await Promise.all([
                    listingsApi.getCoins(),
                    listingsApi.getCurrencies()
                ]);
                setCoins(coinsResponse.data);
                setCurrencies(currenciesResponse.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Устанавливаем начальный тип объявления на основе переданных параметров
    useEffect(() => {
        if (editMode && adToEdit) {
            setIsBuy(adToEdit.type === 'buy');
            setSelectedCurrency(adToEdit.asset || adToEdit.crypto || 'USDT');
            setSelectedFiatCurrency(adToEdit.currency || 'RUB');
            setIsFixedPrice(adToEdit.pricePercent === null || adToEdit.pricePercent === undefined);
            setPriceType(adToEdit.pricePercent === null || adToEdit.pricePercent === undefined ? 'Фиксированная' : 'Плавающая');
            setPrice(adToEdit.price?.toString() || '');
            setPercent(adToEdit.pricePercent?.toString() || '');
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

    useEffect(() => {
        const fetchMarketPrice = async () => {
            try {
                if (selectedCurrency && selectedFiatCurrency) {
                    const response = await p2pApi.getMarketPrice(selectedCurrency, selectedFiatCurrency);
                    setMarketPrice(response.data.price);
                }
            } catch (error) {
                console.error('Error fetching market price:', error);
            }
        };

        fetchMarketPrice();
    }, [selectedCurrency, selectedFiatCurrency]);


    const handlePriceTypeChange = (type) => {
        setPriceType(type);
        setIsFixedPrice(type === 'Фиксированная');
    };

    const handleBuySellChange = (isBuy) => {
        setIsBuy(isBuy);
    };

    const handleCurrencyChange = (currency) => {
        setSelectedCurrency(currency);
        setShowCurrencyMenu(false);
    };

    const handleFiatCurrencyChange = (currency) => {
        setSelectedFiatCurrency(currency);
        setShowFiatCurrencyMenu(false);
    };

    const handlePriceChange = (e) => {
        // Allow only numbers and decimal point
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setPrice(value);
    };

    const handlePercentChange = (e) => {
        // Allow only numbers
        const value = e.target.value.replace(/[^0-9]/g, '');
        setPercent(value);
    };

    const handleAmountChange = (e) => {
        // Allow only numbers and decimal point
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setAmount(value);
    };

    const handleMinAmountChange = (e) => {
        // Allow only numbers and decimal point
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setMinAmount(value);
    };

    const handleMaxAmountChange = (e) => {
        // Allow only numbers and decimal point
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setMaxAmount(value);
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

    const handleSetMaxAmount = async () => {
        try {
            // Get user balance
            const response = await p2pApi.getUserBalance();
            const balance = response.data[selectedCurrency] || 0;
            setAmount(balance.toString());
        } catch (error) {
            console.error('Error fetching user balance:', error);
        }
    };

    // Function to create a new listing
    const createNewListing = async () => {
        try {
            setLoading(true);
            setError(null);

            // Create new listing based on input data
            const newListing = {
                type: isBuy ? 'buy' : 'sell',
                crypto: selectedCurrency,
                currency: selectedFiatCurrency,
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
                // Update existing ad
                await p2pApi.updateAd(adToEdit.id, newListing);
            } else {
                // Create new ad
                await p2pApi.createAd(newListing);
            }

            // Redirect to ads page
            navigate('/p2p/my-ads', { state: { newListing: true } });
        } catch (error) {
            console.error('Error creating/updating ad:', error);
            setError('Не удалось создать/обновить объявление. Пожалуйста, проверьте введенные данные и попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

// Function to go to next step
    const handleNextStep = () => {
        // Validate current step
        if (!validateCurrentStep()) {
            return;
        }

        if (step < 5) {
            setStep(step + 1);
        } else {
            // If this is the last step, create the listing
            createNewListing();
        }
    };

    // Function to validate current step
    const validateCurrentStep = () => {
        setError(null);

        switch (step) {
            case 1:
                if (isFixedPrice && (!price || parseFloat(price) <= 0)) {
                    setError('Пожалуйста, укажите корректную цену');
                    return false;
                }
                if (!isFixedPrice && (!percent || parseFloat(percent) <= 0)) {
                    setError('Пожалуйста, укажите корректный процент от рыночной цены');
                    return false;
                }
                return true;
            case 2:
                if (!amount || parseFloat(amount) <= 0) {
                    setError('Пожалуйста, укажите доступную сумму');
                    return false;
                }
                if (!minAmount || parseFloat(minAmount) <= 0) {
                    setError('Пожалуйста, укажите минимальную сумму сделки');
                    return false;
                }
                if (maxAmount && parseFloat(maxAmount) < parseFloat(minAmount)) {
                    setError('Максимальная сумма должна быть больше минимальной');
                    return false;
                }
                return true;
            case 3:
                if (selectedPaymentMethods.length === 0) {
                    setError('Пожалуйста, выберите хотя бы один способ оплаты');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };


    // Функция для возврата к предыдущему шагу
    const handlePrevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            // If this is the first step, go back to ads page
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