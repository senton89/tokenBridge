import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { listingsApi, walletApi } from '../../services/api';
import { toast } from 'react-toastify';

const DepositPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currency } = location.state || {};

    const [coins, setCoins] = useState([]);
    const [depositData, setDepositData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchCoins = async () => {
            try {
                setLoading(true);
                const response = await listingsApi.getCoins();
                setCoins(response.data);
            } catch (err) {
                console.error('Error fetching coins:', err);
                setError('Не удалось загрузить список монет');
                toast.error('Не удалось загрузить список монет');
            } finally {
                setLoading(false);
            }
        };

        fetchCoins();
    }, []);

    useEffect(() => {
        if (currency && coins.length > 0) {
            fetchDepositAddress();
        }
    }, [currency, coins]);

    const fetchDepositAddress = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await walletApi.getDepositAddress(currency);

            if (response.data && response.data.address) {
                setDepositData(response.data);
            } else {
                throw new Error('Адрес не получен');
            }
        } catch (err) {
            const errorMessage = 'Не удалось получить адрес для депозита. Пожалуйста, попробуйте позже.';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Error fetching deposit address:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyClick = () => {
        if (depositData?.address) {
            navigator.clipboard.writeText(depositData.address)
                .then(() => {
                    setCopied(true);
                    toast.success('Адрес скопирован в буфер обмена!');
                    setTimeout(() => setCopied(false), 3000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    toast.error('Не удалось скопировать адрес');
                });
        }
    };

    const handleShare = async () => {
        if (depositData?.address && navigator.share) {
            try {
                await navigator.share({
                    title: `Депозит ${currency}`,
                    text: `Мой адрес для депозита ${currency}: ${depositData.address}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            handleCopyClick();
        }
    };

    // Find current coin data
    const currentCoin = coins.find(coin => coin.symbol === currency);

    // Prepare QR code data and options
    const qrCodeData = depositData?.address || '';

    const qrCodeOptions = {
        size: Math.min(window.screen.height / 3.5, 250),
        level: 'H',
        color: {
            dark: '#ffffff',
            light: '#0a1726',
        },
        shapeRendering: 'crispEdges',
        imageSettings: currentCoin ? {
            src: currentCoin.logo,
            height: Math.min(window.screen.height / 14, 50),
            width: Math.min(window.screen.height / 14, 50),
            excavate: true,
        } : undefined,
        dotScale: 0.8,
        dotAspect: 1.2,
    };

    if (loading && !depositData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && !depositData) {
        return (
            <div className="flex flex-col justify-center items-center h-screen p-4">
                <div className="text-red-500 text-center mb-4">{error}</div>
                <button
                    onClick={fetchDepositAddress}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-xl"
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-md">
            <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
                {/* QR Code Section */}
                <div className="p-6 flex flex-col items-center">
                    <h2 className="text-xl font-bold text-white mb-6">Депозит {currency}</h2>

                    {depositData?.address && (
                        <div className="bg-gray-800 p-6 rounded-xl mb-4">
                            <QRCodeCanvas
                                value={qrCodeData}
                                size={qrCodeOptions.size}
                                level={qrCodeOptions.level}
                                fgColor={qrCodeOptions.color.light}
                                bgColor={qrCodeOptions.color.dark}
                                shapeRendering={qrCodeOptions.shapeRendering}
                                imageSettings={qrCodeOptions.imageSettings}
                                dotScale={qrCodeOptions.dotScale}
                                dotAspect={qrCodeOptions.dotAspect}
                                style={{borderRadius: 10}}
                            />
                        </div>
                    )}

                    {currentCoin && (
                        <div className="text-center text-sm text-gray-400 mb-4 px-2">
                            <p className="mb-1">
                                Отправляйте только
                                <img
                                    src={currentCoin.logo}
                                    alt={currentCoin.symbol}
                                    className="inline-block w-5 h-5 mx-1"
                                />
                                <span className="font-bold">{currency}</span>
                                через сеть
                                <span className="font-bold ml-1">{currentCoin.network}</span>,
                                иначе монеты будут утеряны.
                            </p>

                            {depositData?.minDeposit && (
                                <p className="text-yellow-400 mt-2 font-medium">
                                    Минимальная сумма депозита: {depositData.minDeposit} {currency}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Address Section */}
                <div className="bg-gray-800 p-6">
                    <p className="text-gray-400 text-sm mb-2">Transaction Address</p>
                    <div className="bg-gray-900 p-3 rounded-lg mb-4">
                        <p className="text-white font-mono text-sm break-all">
                            {depositData?.address || 'Адрес загружается...'}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            onClick={handleCopyClick}
                            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-4 rounded-xl flex items-center justify-center"
                        >
                            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} mr-2`}></i>
                            <span>{copied ? 'Скопировано' : 'Копировать'}</span>
                        </button>

                        <button
                            onClick={handleShare}
                            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-4 rounded-xl flex items-center justify-center"
                        >
                            <i className="fas fa-share mr-2"></i>
                            <span>Поделиться</span>
                        </button>
                    </div>

                    <button
                        onClick={fetchDepositAddress}
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl text-white py-3 px-4 flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                                <span>Загрузка...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-plus mr-2"></i>
                                <span>Получить новый адрес</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepositPage;