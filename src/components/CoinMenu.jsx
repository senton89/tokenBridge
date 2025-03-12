import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { walletApi, marketApi, listingsApi } from '../services/api';

function CoinDetail() {
    const { symbol } = useParams();
    const navigate = useNavigate();

    const [coin, setCoin] = useState(null);
    const [balance, setBalance] = useState(0);
    const [price, setPrice] = useState(0);
    const [priceChange, setPriceChange] = useState(0);
    const [currency, setCurrency] = useState('USD');
    const [currencySymbol, setCurrencySymbol] = useState('$');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [showTransactions, setShowTransactions] = useState(false);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchCoinData = async () => {
            try {
                setLoading(true);

                // Fetch coin details
                const coinsResponse = await listingsApi.getCoins();
                const foundCoin = coinsResponse.data.find(c => c.symbol === symbol);
                if (!foundCoin) {
                    throw new Error('Coin not found');
                }
                setCoin(foundCoin);

                // Fetch user balance
                const balanceResponse = await walletApi.getBalance();
                setBalance(balanceResponse.data[symbol] || 0);

                // Fetch currency info
                const currenciesResponse = await listingsApi.getCurrencies();
                const foundCurrency = currenciesResponse.data.find(c => c.name === currency);
                if (foundCurrency) {
                    setCurrencySymbol(foundCurrency.symbol);
                }

                // Fetch price and price change
                const priceResponse = await marketApi.getPrices(currency);
                setPrice(priceResponse.data.data[symbol] || 0);

                const priceChangeResponse = await marketApi.getPriceChanges(symbol);
                setPriceChange(priceChangeResponse.data[symbol] || 0);

                // Fetch transactions
                const transactionsResponse = await walletApi.getTransactions();
                const coinTransactions = transactionsResponse.data
                    .filter(tx => tx.currency === symbol)
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setTransactions(coinTransactions);

                // Mock chart data for visualization
                setChartData({
                    positive: priceChange >= 0,
                    data: [65, 67, 63, 69, 72, 71, 70, 75, 74, 76, 79, 78, 81]
                });

            } catch (err) {
                console.error('Error fetching coin data:', err);
                setError('Failed to load coin data');
            } finally {
                setLoading(false);
            }
        };

        fetchCoinData();
    }, [symbol, currency]);

    const handleAction = (action) => {
        switch (action) {
            case 'deposit':
                navigate('/deposit', { state: { currency: symbol } });
                break;
            case 'withdraw':
                navigate('/withdraw', { state: { currency: symbol } });
                break;
            case 'exchange':
                navigate('/exchange', { state: { coinFrom: coin, isFrom: true } });
                break;
            case 'p2p':
                navigate('/p2p/buy', { state: { selectedCrypto: symbol } });
                break;
            default:
                break;
        }
    };

    const toggleTransactions = () => {
        setShowTransactions(!showTransactions);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !coin) {
        return (
            <div className="p-6 text-center">
                <div className="text-red-500 mb-6">{error || 'Coin not found'}</div>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => navigate('/')}
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Header with back button */}
            <div className="flex items-center mb-6">
                <button
                    className="mr-4 text-gray-400"
                    onClick={() => navigate('/')}
                >
                    <i className="fas fa-arrow-left text-xl"></i>
                </button>
                <div className="flex items-center">
                    {/*<img src={coin.logo} alt={coin.name} className="w-8 h-8 mr-2" />*/}
                    <h1 className="text-xl font-bold">{coin.name}</h1>
                </div>
            </div>

            {/* Price chart visualization */}
            <div className="bg-gray-800 rounded-xl p-5 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <div className="text-3xl font-bold">{currencySymbol} {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className={`text-sm ${priceChange > 0 ? 'text-green-500' : priceChange < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}% (24h)
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">1D</button>
                        <button className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">1W</button>
                        <button className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">1M</button>
                        <button className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">1Y</button>
                    </div>
                </div>

                {/* Simple chart visualization */}
                <div className="h-40 w-full flex items-end space-x-1">
                    {chartData && chartData.data.map((value, index) => (
                        <div
                            key={index}
                            className={`w-full ${chartData.positive ? 'bg-green-500' : 'bg-red-500'} rounded-sm`}
                            style={{ height: `${value}%` }}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Balance card */}
            <div className="bg-gray-800 rounded-xl p-5 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-gray-400">Your Balance</div>
                    <div className="text-sm text-blue-400">View History</div>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-2xl font-bold">{balance.toLocaleString('en-US', { maximumFractionDigits: 8 })} {coin.symbol}</div>
                        <div className="text-gray-400">{currencySymbol} {(balance * price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className="bg-blue-600 p-2 rounded-full">
                        <i className="fas fa-wallet text-white text-xl"></i>
                    </div>
                </div>
            </div>

            {/* Action buttons - Styled like the menu in Home component */}
            <div className="flex flex-row justify-around gap-6 mt-6 mb-6">
                <div className="text-center flex flex-col items-center">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-1 cursor-pointer"
                        onClick={() => handleAction('deposit')}
                    >
                        <i className="fas fa-arrow-down text-white text-md"></i>
                    </div>
                    <div className="text-blue-500 font-bold text-sm">Deposit</div>
                </div>

                <div className="text-center flex flex-col items-center">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-1 cursor-pointer"
                        onClick={() => handleAction('withdraw')}
                    >
                        <i className="fas fa-arrow-up text-white text-md"></i>
                    </div>
                    <div className="text-blue-500 font-bold text-sm">Withdraw</div>
                </div>

                <div className="text-center flex flex-col items-center">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-1 cursor-pointer"
                        onClick={() => handleAction('exchange')}
                    >
                        <i className="fas fa-exchange-alt text-white text-md"></i>
                    </div>
                    <div className="text-blue-500 font-bold text-sm">Exchange</div>
                </div>

                <div className="text-center flex flex-col items-center">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-1 cursor-pointer"
                        onClick={() => handleAction('p2p')}
                    >
                        <i className="fas fa-sync-alt text-white text-md"></i>
                    </div>
                    <div className="text-blue-500 font-bold text-sm">P2P</div>
                </div>
            </div>

            {/* Coin information */}
            <div className="bg-gray-800 rounded-xl p-5 mb-6">
                <div className="text-lg font-bold mb-4">About {coin.name}</div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Network</div>
                        <div className="font-medium">{coin.network}</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Symbol</div>
                        <div className="font-medium">{coin.symbol}</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Market Cap</div>
                        <div className="font-medium">{currencySymbol} {(price * 1000000).toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Volume (24h)</div>
                        <div className="font-medium">{currencySymbol} {(price * 500000).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Transactions section */}
            <div className="bg-gray-800 rounded-xl p-5">
                <button
                    className="w-full flex justify-between items-center"
                    onClick={toggleTransactions}
                >
                    <div className="text-lg font-bold">Transaction History</div>
                    <div className="transform transition-transform duration-200">
                        <i className={`fas fa-chevron-${showTransactions ? 'up' : 'down'} text-gray-400`}></i>
                    </div>
                </button>

                {showTransactions && (
                    <div className="mt-4 space-y-3">
                        {transactions.length === 0 ? (
                            <div className="text-center py-6 text-gray-400">
                                No transactions found for this coin
                            </div>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.id} className="border-b border-gray-700 pb-3 last:border-0">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className={`rounded-full w-10 h-10 flex items-center justify-center mr-3 ${
                                                tx.type === 'deposit' ? 'bg-green-500' :
                                                    tx.type === 'withdrawal' ? 'bg-red-500' : 'bg-blue-500'
                                            }`}>
                                                <i className={`fas fa-${
                                                    tx.type === 'deposit' ? 'arrow-down' :
                                                        tx.type === 'withdrawal' ? 'arrow-up' : 'exchange-alt'
                                                } text-white`}></i>
                                            </div>
                                            <div>
                                                <div className="font-medium capitalize">{tx.type}</div>
                                                <div className="text-gray-400 text-xs">
                                                    {new Date(tx.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold ${
                                                tx.type === 'deposit' ? 'text-green-500' :
                                                    tx.type === 'withdrawal' ? 'text-red-500' : ''
                                            }`}>
                                                {tx.type === 'deposit' ? '+' : tx.type === 'withdrawal' ? '-' : ''}
                                                {tx.amount} {tx.currency}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {tx.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {transactions.length > 0 && (
                            <div className="text-center pt-2">
                                <button className="text-blue-400 text-sm">
                                    View all transactions
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CoinDetail;