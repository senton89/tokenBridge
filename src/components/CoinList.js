import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';

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

const CoinList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { type, coinTo, coinFrom, isFrom, returnPath, selectedCurrency, selectedPaymentMethod, amountFilter } = location.state || {};

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