import React, {useEffect, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import {listingsApi} from "../services/api";

const CoinList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { type, coinTo, coinFrom, isFrom, returnPath, selectedCurrency, selectedPaymentMethod, amountFilter } = location.state || {};

    useEffect(() => {
        const fetchCoins = async () => {
            try {
                setLoading(true);
                const response = await listingsApi.getCoins();
                setCoins(response.data);
            } catch (err) {
                console.error('Error fetching coins:', err);
                setError('Не удалось загрузить список монет');
            } finally {
                setLoading(false);
            }
        };

        fetchCoins();
    }, []);

// Добавить обработку состояния загрузки
    if (loading) {
        return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>;
    }

    if (error) {
        return <div className="text-red-500 p-12 text-center">{error}</div>;
    }

    let title;
    let link;

    switch (type) {
        case 'deposit':
            title = 'ПОПОЛНЕНИЕ КРИПТОВАЛЮТЫ';
            link = '/deposit';
            break;
        case 'withdraw':
            title = 'ВЫВОД КРИПТОВАЛЮТЫ';
            link = '/withdraw';
            break;
        case 'exchange':
            title = 'ОБМЕН КРИПТОВАЛЮТЫ';
            link = '/exchange';
            break;
        case 'p2p':
            title = 'ВЫБОР КРИПТОВАЛЮТЫ';
            link = location.state.returnPath || '/p2p/buy';
            break;
        default:
            throw new Error(`Неизвестный тип: ${type}`);
    }

    const handleCoinClick = (coin) => {
        if (type === 'p2p') {
            navigate(link, {
                state: {
                    selectedCrypto: coin.symbol,
                    selectedCurrency,
                    selectedPaymentMethod,
                    amountFilter
                }
            });
        } else {
            navigate(link, {
                state: {
                    currency: coin.symbol,
                    isFrom,
                    coinTo,
                    coinFrom
                }
            });
        }
    };

    return (
        <div className="p-1 mt-6">
            <div className="text-md font-bold mb-6 text-gray-400">{title}</div>
            <div className="flex flex-col">
                {coins.filter((c) => !isFrom ?
                    (!coinFrom || c.symbol !== coinFrom.symbol) :
                    (!coinTo || c.symbol !== coinTo.symbol)
                ).map((coin, index) => (
                    <div key={coin.id}>
                        <button
                            onClick={() => handleCoinClick(coin)}
                            className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="rounded-full w-10 h-10 flex items-center justify-center mr-2">
                                    <img alt={`${coin.name} logo`} className="w-10 h-10" src={coin.logo}/>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-md">{coin.symbol}</div>
                                    </div>
                                    <div className="text-gray-400 text-xs">
                                        <div className="text-gray-400">{coin.name}</div>
                                    </div>
                                </div>
                            </div>
                        </button>
                        {index < coins.length - 1 && (
                            <div className="border-b border-gray-600 opacity-50 mb-2 mt-2 ml-12"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoinList;