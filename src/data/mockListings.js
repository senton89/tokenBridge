// Доступные способы оплаты
export const availablePaymentMethods = [
    'Тинькофф',
    'Сбербанк',
    'Райффайзен',
    'Альфа-Банк',
    'ВТБ',
    'QIWI',
    'ЮMoney',
    'СБП',
    'Почта Банк',
    'Газпромбанк',
    'Открытие',
    'Росбанк',
    'МТС Банк',
    'Совкомбанк'
];

// Моковые данные для объявлений о покупке
export const mockBuyListings = [
    {
        id: 1,
        type: 'buy',
        price: 95.50,
        crypto: 'USDT',
        currency: 'RUB',
        availableAmount: 50000,
        minAmount: 1000,
        maxAmount: 50000,
        paymentMethods: ['Тинькофф', 'Сбербанк'],
        user: {
            name: 'CryptoBuyer123',
            avatar: '/images/default-avatar.png',
            deals: 156,
            rating: 99.8
        }
    },
    {
        id: 2,
        type: 'buy',
        price: 94.80,
        crypto: 'USDT',
        currency: 'RUB',
        availableAmount: 100000,
        minAmount: 5000,
        maxAmount: 100000,
        paymentMethods: ['Сбербанк', 'ВТБ', 'Альфа-Банк'],
        user: {
            name: 'TetherTrader',
            avatar: '/images/default-avatar.png',
            deals: 89,
            rating: 98.5
        }
    },
    {
        id: 3,
        type: 'buy',
        price: 96.20,
        crypto: 'USDT',
        currency: 'RUB',
        availableAmount: 500000,
        minAmount: 10000,
        maxAmount: 500000,
        paymentMethods: ['Тинькофф', 'QIWI', 'ЮMoney'],
        user: {
            name: 'CryptoWhale',
            avatar: '/images/default-avatar.png',
            deals: 342,
            rating: 100
        }
    },
    {
        id: 4,
        type: 'buy',
        price: 3650000,
        crypto: 'BTC',
        currency: 'RUB',
        availableAmount: 2,
        minAmount: 50000,
        maxAmount: 1000000,
        paymentMethods: ['Тинькофф', 'Сбербанк', 'ВТБ'],
        user: {
            name: 'BTCMaster',
            avatar: '/images/default-avatar.png',
            deals: 78,
            rating: 97.4
        }
    },
    {
        id: 5,
        type: 'buy',
        price: 180000,
        crypto: 'ETH',
        currency: 'RUB',
        availableAmount: 10,
        minAmount: 10000,
        maxAmount: 300000,
        paymentMethods: ['Сбербанк', 'Альфа-Банк'],
        user: {
            name: 'EthereumPro',
            avatar: '/images/default-avatar.png',
            deals: 124,
            rating: 99.2
        }
    },
    {
        id: 6,
        type: 'buy',
        price: 95.10,
        crypto: 'USDT',
        currency: 'USD',
        availableAmount: 5000,
        minAmount: 100,
        maxAmount: 5000,
        paymentMethods: ['QIWI', 'ЮMoney'],
        user: {
            name: 'CryptoTrader',
            avatar: '/images/default-avatar.png',
            deals: 56,
            rating: 98.1
        }
    },
    {
        id: 7,
        type: 'buy',
        price: 87.20,
        crypto: 'USDT',
        currency: 'EUR',
        availableAmount: 8500,
        minAmount: 100,
        maxAmount: 10000,
        paymentMethods: ['Тинькофф', 'Сбербанк'],
        user: {
            name: 'USDTBuyer',
            avatar: '/images/default-avatar.png',
            deals: 210,
            rating: 99.5
        }
    },
    {
        id: 8,
        type: 'buy',
        price: 163.5,
        crypto: 'TON',
        currency: 'RUB',
        availableAmount: 15000,
        minAmount: 2000,
        maxAmount: 100000,
        paymentMethods: ['Тинькофф', 'Сбербанк'],
        user: {
            name: 'TonBuyer',
            avatar: '/images/default-avatar.png',
            deals: 45,
            rating: 98.2
        }
    },
    {
        id: 9,
        type: 'buy',
        price: 7650,
        crypto: 'SOL',
        currency: 'RUB',
        availableAmount: 50,
        minAmount: 5000,
        maxAmount: 200000,
        paymentMethods: ['Тинькофф', 'QIWI'],
        user: {
            name: 'SolanaTrader',
            avatar: '/images/default-avatar.png',
            deals: 67,
            rating: 99.1
        }
    },
    {
        id: 10,
        type: 'buy',
        price: 6.75,
        crypto: 'DOGE',
        currency: 'RUB',
        availableAmount: 25000,
        minAmount: 1000,
        maxAmount: 50000,
        paymentMethods: ['Сбербанк', 'ВТБ'],
        user: {
            name: 'DogeLover',
            avatar: '/images/default-avatar.png',
            deals: 134,
            rating: 98.7
        }
    },
    {
        id: 11,
        type: 'buy',
        price: 8.20,
        crypto: 'TRX',
        currency: 'RUB',
        availableAmount: 75000,
        minAmount: 2000,
        maxAmount: 100000,
        paymentMethods: ['Тинькофф', 'Альфа-Банк'],
        user: {
            name: 'TronMaster',
            avatar: '/images/default-avatar.png',
            deals: 92,
            rating: 99.3
        }
    },
    {
        id: 12,
        type: 'buy',
        price: 0.15,
        crypto: 'NOT',
        currency: 'RUB',
        availableAmount: 100000,
        minAmount: 1000,
        maxAmount: 30000,
        paymentMethods: ['Тинькофф', 'QIWI'],
        user: {
            name: 'NotcoinBuyer',
            avatar: '/images/default-avatar.png',
            deals: 28,
            rating: 97.8
        }
    }
];

// Моковые данные для объявлений о продаже
export const mockSellListings = [
    {
        id: 1,
        type: 'sell',
        price: 93.80,
        crypto: 'USDT',
        currency: 'RUB',
        availableAmount: 45000,
        minAmount: 1000,
        maxAmount: 50000,
        paymentMethods: ['Тинькофф', 'Сбербанк'],
        user: {
            name: 'CryptoSeller456',
            avatar: '/images/default-avatar.png',
            deals: 178,
            rating: 99.6
        }
    },
    {
        id: 2,
        type: 'sell',
        price: 93.20,
        crypto: 'USDT',
        currency: 'RUB',
        availableAmount: 85000,
        minAmount: 5000,
        maxAmount: 100000,
        paymentMethods: ['Сбербанк', 'ВТБ', 'Альфа-Банк'],
        user: {
            name: 'TetherMaster',
            avatar: '/images/default-avatar.png',
            deals: 102,
            rating: 98.9
        }
    },
    {
        id: 3,
        type: 'sell',
        price: 94.50,
        crypto: 'USDT',
        currency: 'RUB',
        availableAmount: 450000,
        minAmount: 10000,
        maxAmount: 500000,
        paymentMethods: ['Тинькофф', 'QIWI', 'ЮMoney'],
        user: {
            name: 'CryptoExchange',
            avatar: '/images/default-avatar.png',
            deals: 289,
            rating: 99.8
        }
    },
    {
        id: 4,
        type: 'sell',
        price: 3600000,
        crypto: 'BTC',
        currency: 'RUB',
        availableAmount: 3,
        minAmount: 50000,
        maxAmount: 1000000,
        paymentMethods: ['Тинькофф', 'Сбербанк', 'ВТБ'],
        user: {
            name: 'BitcoinSeller',
            avatar: '/images/default-avatar.png',
            deals: 65,
            rating: 97.8
        }
    },
    {
        id: 5,
        type: 'sell',
        price: 175000,
        crypto: 'ETH',
        currency: 'RUB',
        availableAmount: 12,
        minAmount: 10000,
        maxAmount: 300000,
        paymentMethods: ['Сбербанк', 'Альфа-Банк'],
        user: {
            name: 'EthTrader',
            avatar: '/images/default-avatar.png',
            deals: 112,
            rating: 99.0
        }
    },
    {
        id: 6,
        type: 'sell',
        price: 0.98,
        crypto: 'USDT',
        currency: 'USD',
        availableAmount: 4500,
        minAmount: 100,
        maxAmount: 5000,
        paymentMethods: ['QIWI', 'ЮMoney'],
        user: {
            name: 'StableSeller',
            avatar: '/images/default-avatar.png',
            deals: 48,
            rating: 98.4
        }
    },
    {
        id: 7,
        type: 'sell',
        price: 0.90,
        crypto: 'USDT',
        currency: 'EUR',
        availableAmount: 9500,
        minAmount: 100,
        maxAmount: 10000,
        paymentMethods: ['Тинькофф', 'Сбербанк'],
        user: {
            name: 'USDTTrader',
            avatar: '/images/default-avatar.png',
            deals: 185,
            rating: 99.3
        }
    },
    {
        id: 8,
        type: 'sell',
        price: 160.8,
        crypto: 'TON',
        currency: 'RUB',
        availableAmount: 12000,
        minAmount: 2000,
        maxAmount: 100000,
        paymentMethods: ['Тинькофф', 'Сбербанк'],
        user: {
            name: 'TonSeller',
            avatar: '/images/default-avatar.png',
            deals: 38,
            rating: 97.9
        }
    },
    {
        id: 9,
        type: 'sell',
        price: 7500,
        crypto: 'SOL',
        currency: 'RUB',
        availableAmount: 45,
        minAmount: 5000,
        maxAmount: 200000,
        paymentMethods: ['Тинькофф', 'QIWI'],
        user: {
            name: 'SolMaster',
            avatar: '/images/default-avatar.png',
            deals: 56,
            rating: 98.6
        }
    },
    {
        id: 10,
        type: 'sell',
        price: 6.50,
        crypto: 'DOGE',
        currency: 'RUB',
        availableAmount: 35000,
        minAmount: 1000,
        maxAmount: 50000,
        paymentMethods: ['Сбербанк', 'ВТБ'],
        user: {
            name: 'DogeTrader',
            avatar: '/images/default-avatar.png',
            deals: 122,
            rating: 98.4
        }
    },
    {
        id: 11,
        type: 'sell',
        price: 8.05,
        crypto: 'TRX',
        currency: 'RUB',
        availableAmount: 85000,
        minAmount: 2000,
        maxAmount: 100000,
        paymentMethods: ['Тинькофф', 'Альфа-Банк'],
        user: {
            name: 'TronSeller',
            avatar: '/images/default-avatar.png',
            deals: 85,
            rating: 99.1
        }
    },
    {
        id: 12,
        type: 'sell',
        price: 0.13,
        crypto: 'NOT',
        currency: 'RUB',
        availableAmount: 120000,
        minAmount: 1000,
        maxAmount: 30000,
        paymentMethods: ['Тинькофф', 'QIWI'],
        user: {
            name: 'NotcoinMaster',
            avatar: '/images/default-avatar.png',
            deals: 21,
            rating: 97.5
        }
    }
];

// Моковые данные для сделок пользователя
export const mockUserDeals = [
    {
        id: 1,
        type: 'buy',
        status: 'active',
        date: new Date('2025-03-04T18:30:00'),
        amount: 1000,
        price: 97.50,
        totalPrice: 97500,
        crypto: 'TON',
        currency: 'RUB',
        counterparty: {
            name: 'CryptoTrader',
            avatar: '/images/default-avatar.png',
            deals: 156,
            rating: 99.8
        },
        paymentMethod: 'Тинькофф',
        timeLimit: 15, // минут на оплату
        conditions: 'Оплата только с карты, оформленной на ваше имя'
    },
    {
        id: 2,
        type: 'sell',
        status: 'completed',
        date: new Date('2025-03-03T14:20:00'),
        amount: 500,
        price: 98.50,
        totalPrice: 49250,
        crypto: 'TON',
        currency: 'RUB',
        counterparty: {
            name: 'TonMaster',
            avatar: '/images/default-avatar.png',
            deals: 89,
            rating: 99.1
        },
        paymentMethod: 'СБП',
        timeLimit: 15,
        conditions: 'Перевод только через СБП'
    },
    {
        id: 3,
        type: 'buy',
        status: 'cancelled',
        date: new Date('2025-03-02T09:15:00'),
        amount: 2000,
        price: 97.50,
        totalPrice: 195000,
        crypto: 'TON',
        currency: 'RUB',
        counterparty: {
            name: 'CryptoKing',
            avatar: '/images/default-avatar.png',
            deals: 234,
            rating: 98.5
        },
        paymentMethod: 'Сбербанк',
        timeLimit: 15,
        conditions: 'Перевод только на карту Сбербанка',
        cancellationReason: 'Превышен лимит времени на оплату'
    },
    {
        id: 4,
        type: 'buy',
        status: 'active',
        date: new Date('2025-03-05T00:05:00'),
        amount: 100,
        price: 98.00,
        totalPrice: 9800,
        crypto: 'TON',
        currency: 'RUB',
        counterparty: {
            name: 'TonTrader',
            avatar: '/images/default-avatar.png',
            deals: 67,
            rating: 100
        },
        paymentMethod: 'Тинькофф',
        timeLimit: 15,
        conditions: 'Оплата только с карты Тинькофф'
    },
    {
        id: 5,
        type: 'sell',
        status: 'completed',
        date: new Date('2025-03-01T11:45:00'),
        amount: 300,
        price: 98.00,
        totalPrice: 29400,
        crypto: 'TON',
        currency: 'RUB',
        counterparty: {
            name: 'CryptoExpert',
            avatar: '/images/default-avatar.png',
            deals: 445,
            rating: 99.9
        },
        paymentMethod: 'СБП',
        timeLimit: 15,
        conditions: 'Перевод через СБП по номеру телефона'
    }
];

// Список доступных криптовалют
export const availableCryptos = [
    { code: "TON", symbol: "TON", name: "Toncoin", logo: "/images/crypto/ton.png" },
    { code: "USDT", symbol: "USDT", name: "Tether", logo: "/images/crypto/usdt.png" },
    { code: "NOT", symbol: "NOT", name: "Notcoin", logo: "/images/crypto/not.png" },
    { code: "BTC", symbol: "BTC", name: "Bitcoin", logo: "/images/crypto/btc.png" },
    { code: "ETH", symbol: "ETH", name: "Ethereum", logo: "/images/crypto/eth.png" },
    { code: "SOL", symbol: "SOL", name: "Solana", logo: "/images/crypto/sol.png" },
    { code: "TRX", symbol: "TRX", name: "TRON", logo: "/images/crypto/trx.png" },
    { code: "DOGE", symbol: "DOGE", name: "Dogecoin", logo: "/images/crypto/doge.png" }
];

// Список доступных валют
export const availableCurrencies = [
    { code: "RUB", name: "Российский рубль", icon: "₽" },
    { code: "USD", name: "Доллар США", icon: "$" },
    { code: "EUR", name: "Евро", icon: "€" },
    { code: "BYN", name: "Белорусский рубль", icon: "Br" },
    { code: "UAH", name: "Украинская гривна", icon: "₴" },
    { code: "GBP", name: "Британский фунт", icon: "£" },
    { code: "CNY", name: "Китайский юань", icon: "¥" },
    { code: "KZT", name: "Казахстанский тенге", icon: "₸" },
    { code: "UZS", name: "Узбекский сум", icon: "сўм" },
    { code: "GEL", name: "Грузинский лари", icon: "₾" },
    { code: "TRY", name: "Турецкая лира", icon: "₺" },
    { code: "AMD", name: "Армянский драм", icon: "֏" },
    { code: "THB", name: "Таиландский бат", icon: "฿" },
    { code: "INR", name: "Индийская рупия", icon: "₹" },
    { code: "BRL", name: "Бразильский реал", icon: "R$" },
    { code: "IDR", name: "Индонезийская рупия", icon: "Rp" },
    { code: "AZN", name: "Азербайджанский манат", icon: "₼" },
    { code: "AED", name: "Дирхам ОАЭ", icon: "د.إ" },
    { code: "PLN", name: "Польский злотый", icon: "zł" },
    { code: "ILS", name: "Израильский шекель", icon: "₪" },
    { code: "KGS", name: "Киргизский сом", icon: "с" },
    { code: "TJS", name: "Таджикский сомони", icon: "смн" }
];
