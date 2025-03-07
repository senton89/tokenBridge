// Служба для работы с изображениями криптовалют и валют

// Функция для получения путей к изображениям криптовалют
export const getCryptoImagePath = (cryptoCode) => {
    if (!cryptoCode) return '/images/placeholder.png';
    return `/images/crypto/${cryptoCode.toLowerCase()}.png`;
};

// Функция для обработки ошибок загрузки изображений
export const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/images/placeholder.png';
};

// Функция для определения, существует ли изображение
export const imageExists = (url) => {
    const img = new Image();
    img.src = url;
    return img.complete;
};

// Функция для получения цвета для криптовалюты
export const getCryptoColor = (cryptoCode) => {
    const colors = {
        'BTC': '#F7931A',
        'ETH': '#627EEA',
        'USDT': '#26A17B',
        'TON': '#0088CC',
        'NOT': '#FF9900',
        'SOL': '#14F195',
        'TRX': '#FF0013',
        'DOGE': '#C2A633'
    };
    
    return colors[cryptoCode] || '#808080';
};
