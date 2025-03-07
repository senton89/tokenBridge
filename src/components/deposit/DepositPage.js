import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {listingsApi, walletApi} from '../../services/api';

const DepositPage = () => {
    const location = useLocation();
    const { currency } = location.state || {};
    const [coins, setCoins] = useState([]);
    const [depositAddress, setDepositAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
    }, []); // Добавлен пустой массив зависимостей


    useEffect(() => {
        if (currency) {
            fetchDepositAddress();
        }
    }, [currency]);

    const fetchDepositAddress = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await walletApi.getDepositAddress(currency);

            if (response.data && response.data.address) {
                setDepositAddress(response.data.address);
            } else {
                throw new Error('Адрес не получен');
            }
        } catch (err) {
            setError('Не удалось получить адрес для депозита. Пожалуйста, попробуйте позже.');
            console.error('Error fetching deposit address:', err);
        } finally {
            setLoading(false);
        }
    };

    const qrCodeData = `https://example.com/deposit/${currency}`;
    const qrCodeOptions = {
        size: window.screen.height / 3.5,
        level: 'H',
        color: {
            dark: '#ffffff',
            light: '#0a1726',
        },
        shapeRendering: 'crispEdges',
        imageSettings: {
            src: `${coins.find((coin) => coin.symbol === currency).logo}`,
            x: null,
            y: null,
            height: window.screen.height / 14,
            width: window.screen.height / 14,
            excavate: true,
        },
        dotScale: 0.8,
        dotAspect: 1.2,
    };

    // const handleCopyClick = () => {
    //     navigator.clipboard.writeText(qrCodeData);
    //     alert('QR code copied to clipboard!');
    // };

    return (
        <div>
            <div className="pb-2 p-12">
                <div className="bg-gray-800 rounded-lg p-4 mb-2 flex justify-center items-center flex-col">
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
                <p className="text-center text-sm text-gray-400 mb-1 mt-4">
                    Отправляйте только
                    <i content={`${coins.find((coin) => coin.symbol === currency).logo}`} className="w-12 h-12"/>
                    <span className="font-bold"> {currency} </span>
                    через сеть
                    <span> {coins.find((coin) => coin.symbol === currency).network}</span>
                    , иначе монеты будут утеряны.
                </p>
                </div>
            </div>
            <div className="text-center mb-6 text-lg">
                <p className="text-gray-400">
                    Transaction Address
                </p>
                <p className="text-white font-mono mt-2">
                    {depositAddress}
                </p>
            </div>
            <div className="flex justify-center space-x-2 mb-4 mt-6">
                <button
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm py-1 px-6 rounded-xl flex items-center space-x-1">
                    <i className="fas fa-share"></i>
                    <span>Поделиться</span>
                </button>
                <button
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm py-1 px-6 rounded-xl flex items-center space-x-1">
                    <i className="fas fa-copy"></i>
                    <span>Копировать</span>
                </button>
            </div>
            <div className="flex justify-center text-center">
                <button
                    className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl text-white text-sm py-1 px-8 flex items-center space-x-1">
                    <i className="fas fa-plus"></i>
                    <span>Получить новый адрес</span>
                </button>
            </div>
        </div>
    );
};

export default DepositPage;