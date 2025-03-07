import React, { useState } from 'react';

const AnnouncementPage = () => {
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
    const [isBuy, setIsBuy] = useState(true);
    const [selectedCurrency, setSelectedCurrency] = useState('USDT');
    const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

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

    return (
        <div className="max-w-md mx-auto p-4">
            <div className="flex items-center justify-between p-2 rounded">
                <span className="text-white font-bold">Создайте объявление</span>
                <span className="text-white">1 / 5</span>
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
                    <span>Продать криптовалюту</span>
                    <div className="relative">
                        <button
                            className="text-blue-500"
                            onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                        >
                            {selectedCurrency}
                        </button>
                        {showCurrencyMenu && (
                            <div className="absolute bg-gray-800 p-2 rounded">
                                {coins.map((coin) => (
                                    <button
                                        key={coin.id}
                                        className="block text-white py-2"
                                        onClick={() => handleCurrencyChange(coin.symbol)}
                                    >
                                        {coin.name}
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
                    <span className="text-blue-500">{priceType}</span>
                </div>
            </div>

            {isFixedPrice ? (
                <div className="mt-4 bg-gray-800 px-6 p-2 rounded">
                <label className="block text-blue-500">Фиксированная цена</label>
                    <input
                        type="text"
                        placeholder="0"
                        maxlength="3"
                        className="bg-gray-800 text-gray-400 pl-0 p-2 mt-1 w-full border-b border-gray-700"
                    />
                    <label className="absolute right-0 mr-16 mt-2 text-gray-400">RUB</label>
                </div>
            ) : (
                <div className="mt-4 bg-gray-800 px-6 p-2 rounded">
                    <label className="block text-blue-500">Процент от рыночной цены</label>
                    <input
                        type="text"
                        placeholder="80 ~ 120"
                        maxlength="3"
                        className="bg-gray-800 text-gray-400 pl-0 p-2 mt-1 w-full border-b border-gray-700"
                    />
                    <label className="absolute right-0 mr-16 mt-2 text-gray-400">%</label>
                </div>
            )}

            <div>
                <div className="p-2 rounded">
                    <div>
                        <p className="text-gray-400 inline">Рыночная цена:</p> 97,50 ₽ за 1 {selectedCurrency}
                    </div>
                    <p>Ваша цена: 0 ₽ за 1 {selectedCurrency}</p>
                </div>

                <div className="mt-4 bg-gray-800 rounded-lg px-6 p-2">
                    <label className="block text-blue-500">Сумма</label>
                    <input
                        type="text"
                        placeholder="10 ~ 20000"
                        className="w-full bg-gray-800 text-white pl-0 p-2 mt-1 rounded border-b border-gray-700"
                    />
                    <label className="absolute right-0 mr-16 mt-2 text-gray-400">USDT</label>
                </div>

                <div className="mt-2 flex justify-between items-center ml-4">
          <span className="inline">
            <span className="text-gray-400 inline">Ваш баланс:</span> 0 {selectedCurrency} <span className="text-blue-500">Макс.</span>
          </span>
                </div>

                <div className="mt-4 bg-gray-800 rounded-lg px-6 p-2">
                    <label className="block text-blue-500">Мин. и макс. сумма сделки</label>
                    <label className="absolute right-0 mr-16 mt-2 text-gray-400">RUB</label>
                    <input
                        type="text"
                        placeholder="Мин. 500"
                        className="w-full bg-gray-800 text-white p-2 mt-1 border-b border-gray-700"
                    />
                    <label className="absolute right-0 mr-16 mt-2 text-gray-400">RUB</label>
                    <input
                        type="text"
                        placeholder="Макс."
                        className="w-full bg-gray-800 text-white p-2 border-b border-gray-700"
                    />
                </div>
                <p className="text-gray-500 ml-4 text-sm mt-2 mb-4">Макс. можно не указывать.</p>
            </div>

            <div className="bg-gray-800 px-6 p-4 rounded-lg mb-4">
                <span>Время на оплату</span>
                <span className="text-blue-500 absolute right-0 mr-16">15 мин</span>
            </div>

            <div className="bg-gray-800 px-6 p-4 rounded-lg mb-2 flex justify-between">
                <span className="flex-1">Округлять сумму сделки</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
            </div>
            <p className="text-gray-500 text-sm">Сумма округлится в меньшую сторону. Пример: при сумме 1045,85 RUB вы получите 1045 RUB.</p>

            {/* Button */}
            <div className="mt-4">
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded">Далее</button>
            </div>
        </div>
    );
};

export default AnnouncementPage;