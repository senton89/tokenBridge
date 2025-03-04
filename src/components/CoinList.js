import React from 'react';
import { Link } from 'react-router-dom';

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
const Deposit = () => {
    return (
        <div className="p-4 mt-40">
            <div className="text-3xl font-bold mb-8 text-gray-400">ПОПОЛНЕНИЕ КРИПТОВАЛЮТЫ</div>
            <div className="flex flex-col">
                {coins.map((coin,index) => (
                    <div>
                    <div key={coin.id} className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <div className="rounded-full w-24 h-24 flex items-center justify-center mr-4">
                                <img alt={`${coin.name} logo`} className="w-24 h-24" src={coin.logo} />
                            </div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <div className="text-4xl">{coin.symbol}</div>
                                </div>
                                <div className="text-gray-400 text-3xl">
                                    <div className="text-gray-400">{coin.name}</div>
                                </div>
                            </div>
                        </div>
                        {/*<i className="fas fa-chevron-right text-gray-400 mr-8 text-xl"></i>*/}
                    </div>
                    {index < coins.length - 1 && (
                        <div className="border-b border-gray-600 opacity-50 mb-4 mt-4 ml-28"></div>
                    )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Deposit;