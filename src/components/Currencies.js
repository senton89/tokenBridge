import React, {useEffect} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const currencies = [
    { symbol: '₽', name: 'RUB', description: 'Российский рубль' },
    { symbol: '$', name: 'USD', description: 'Доллар США' },
    { symbol: '€', name: 'EUR', description: 'Евро' },
    { symbol: 'Br', name: 'BYN', description: 'Белорусский рубль' },
    { symbol: '₴', name: 'UAH', description: 'Украинская гривна' },
    { symbol: '£', name: 'GBP', description: 'Британский фунт' },
    { symbol: '¥', name: 'CNY', description: 'Китайский юань' },
    { symbol: '₸', name: 'KZT', description: 'Казахстанский тенге' },
    { symbol: 'сум', name: 'UZS', description: 'Узбекский сум' },
    { symbol: '₾', name: 'GEL', description: 'Грузинский лари' },
    { symbol: '₺', name: 'TRY', description: 'Турецкая лира' },
    { symbol: '֏', name: 'AMD', description: 'Армянский драм' },
    { symbol: '฿', name: 'THB', description: 'Таиландский бат' },
    { symbol: '₹', name: 'INR', description: 'Индийская рупия' },
    { symbol: 'R$', name: 'BRL', description: 'Бразильский реал' },
    { symbol: 'Rp', name: 'IDR', description: 'Индонезийская рупия' },
    { symbol: '₼', name: 'AZN', description: 'Азербайджанский манат' },
    { symbol: 'د.إ', name: 'AED', description: 'Объединенные Арабские Эмираты дирхам' },
    { symbol: 'zł', name: 'PLN', description: 'Польский злотый' },
    { symbol: '₪', name: 'ILS', description: 'Израильский шекель' },
    { symbol: 'с', name: 'KGS', description: 'Киргизский сом' },
    { symbol: 'ЅМ', name: 'TJS', description: 'Таджикский сомони' },
];

function CurrencySelector() {
    const [selectedCurrency, setSelectedCurrency] = React.useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setSelectedCurrency(location.state.currentCurrency);
    }, [location.state.currentCurrency]);

    const handleCurrencySelect = (currency) => {
        setSelectedCurrency(currency);
        navigate(location.state.returnPath, { state: { selectedCurrency: currency, ...location.state } });
    };

    return (
        <div className="mx-auto p-4">
            <h1 className="text-gray-400 text-lg mb-4">
                БАЗОВАЯ ВАЛЮТА
            </h1>
            <div className="space-y-4">
                {currencies.map((currency,index) => (
                    <div key={currency.name}>
                        <div className="flex items-center justify-between cursor-pointer"
                         onClick={() => handleCurrencySelect(currency.name)}>
                        <div className="flex items-center space-x-4">
                            <div className="bg-gray-700 w-12 h-12 rounded-full text-xl flex items-center justify-center">
                                <b>{currency.symbol}</b>
                            </div>
                            <div>
                                <div className="text-lg">
                                    {currency.name}
                                </div>
                                <div className="text-gray-400 text-sm">
                                    {currency.description}
                                </div>
                            </div>
                        </div>
                       {selectedCurrency === currency.name && (
                            <div className="rounded-full w-12 h-12 flex items-center justify-center">
                                <i className="fas fa-check-circle text-2xl text-blue-400" />
                            </div>
                        )}
                    </div>
                    {index < currencies.length - 1 && (
                        <div className="border-b border-gray-600 opacity-50 mb-2 mt-2 ml-16"></div>
                    )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CurrencySelector;