-- Создание таблиц

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_id INTEGER UNIQUE NOT NULL
);

CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL
);

CREATE TABLE coins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    logo VARCHAR(255) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL
);

CREATE TABLE user_balances (
    user_id INTEGER NOT NULL,
    coin_id INTEGER NOT NULL,
    balance DECIMAL(20, 8) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (coin_id) REFERENCES coins(id)
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    coin_id INTEGER NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'exchange')),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (coin_id) REFERENCES coins(id)
);

CREATE TABLE exchange_rates (
    id SERIAL PRIMARY KEY,
    coin_id INTEGER NOT NULL,
    currency_id INTEGER NOT NULL,
    rate DECIMAL(20, 8) NOT NULL,
    FOREIGN KEY (coin_id) REFERENCES coins(id),
    FOREIGN KEY (currency_id) REFERENCES currencies(id)
);

CREATE TABLE commissions (
    id SERIAL PRIMARY KEY,
    coin_id INTEGER NOT NULL,
    commission DECIMAL(20, 8) NOT NULL,
    FOREIGN KEY (coin_id) REFERENCES coins(id)
);

-- Создание индексов

CREATE INDEX idx_users_telegram_id ON users (telegram_id);
CREATE INDEX idx_user_balances_user_id ON user_balances (user_id);
CREATE INDEX idx_user_balances_coin_id ON user_balances (coin_id);
CREATE INDEX idx_transactions_user_id ON transactions (user_id);
CREATE INDEX idx_transactions_coin_id ON transactions (coin_id);
CREATE INDEX idx_commissions_coin_id ON commissions (coin_id);

-- Заполнение таблиц

INSERT INTO coins (id, name, logo, symbol, network)
VALUES
    (1, 'Toncoin', './toncoin.png', 'TON', 'The Open Network(TON)'),
    (2, 'Tether', './tether.png', 'USDT', 'The Open Network(TON)'),
    (3, 'Notcoin', './notcoin.png', 'NOT', 'The Open Network(TON)'),
    (4, 'Bitcoin', './bitcoin.png', 'BTC', 'Bitcoin'),
    (5, 'Ethereum', './etherium.png', 'ETH', 'Ethereum'),
    (6, 'Solana', './solana.png', 'SOL', 'Solana'),
    (7, 'TRON', './tron.png', 'TRX', 'TRON'),
    (8, 'Dogecoin', './dogecoin.png', 'DOGE', 'DOGE');

INSERT INTO currencies (id, symbol, name, description)
VALUES
    (1, '₽', 'RUB', 'Российский рубль'),
    (2, '$', 'USD', 'Доллар США'),
    (3, '€', 'EUR', 'Евро'),
    (4, 'Br', 'BYN', 'Белорусский рубль'),
    (5, '₴', 'UAH', 'Украинская гривна'),
    (6, '£', 'GBP', 'Британский фунт'),
    (7, '¥', 'CNY', 'Китайский юань'),
    (8, '₸', 'KZT', 'Казахстанский тенге'),
    (9, 'сум', 'UZS', 'Узбекский сум'),
    (10, '₾', 'GEL', 'Грузинский лари'),
    (11, '₺', 'TRY', 'Турецкая лира'),
    (12, '֏', 'AMD', 'Армянский драм'),
    (13, '฿', 'THB', 'Таиландский бат'),
    (14, '₹', 'INR', 'Индийская рупия'),
    (15, 'R$', 'BRL', 'Бразильский реал'),
    (16, 'Rp', 'IDR', 'Индонезийская рупия'),
    (17, '₼', 'AZN', 'Азербайджанский манат'),
    (18, 'د.إ', 'AED', 'Объединенные Арабские Эмираты дирхам'),
    (19, 'zł', 'PLN', 'Польский злотый'),
    (20, '₪', 'ILS', 'Израильский шекель'),
    (21, 'с', 'KGS', 'Киргизский сом'),
    (22, 'ЅМ', 'TJS', 'Таджикский сомони');

-- insert into users values(1,1);

INSERT INTO user_balances (user_id, coin_id, balance)
VALUES
    (1, 1, 1.00),
    (1, 2, 500.00),
    (1, 3, 80.00),
    (1, 4, 0.00015),
    (1, 5, 0.003),
    (1, 6, 0.01),
    (1, 7, 1000.00),
    (1, 8, 7.00);

INSERT INTO exchange_rates (coin_id, currency_id, rate)
VALUES
    (1, 1, 1.00),
    (1, 2, 0.50),
    (1, 3, 0.25),
    (2, 1, 1.00),3
    (2, 2, 0.50),
    (2, 3, 0.25),
    (3, 1, 1.00),
    (3, 2, 0.50),
    (3, 3, 0.25),
    (4, 1, 1.00),
    (4, 2, 0.50),
    (4, 3, 0.25),
    (5, 1, 1.00),
    (5, 2, 0.50),
    (5, 3, 0.25),
    (6, 1, 1.00),
    (6, 2, 0.50),
    (6, 3, 0.25),
    (7, 1, 1.00),
    (7, 2, 0.50),
    (7, 3, 0.25),
    (8, 1, 1.00),
    (8, 2, 0.50),
    (8, 3, 0.25);

	INSERT INTO commissions (coin_id, commission)
VALUES
    (1, 0.09),
    (2, 1.00),
    (3, 80.00),
    (4, 0.00015),
    (5, 0.003),
    (6, 0.01),
    (7, 10.00),
    (8, 7.00);