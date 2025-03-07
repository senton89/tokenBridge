# Database Schema Analysis for TokenBridge Application

Based on the provided code, I'll design a comprehensive database schema for the TokenBridge application. The code shows a cryptocurrency exchange platform with wallet management, P2P trading, and exchange functionality.

## Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Coins Table
```sql
CREATE TABLE coins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    logo VARCHAR(255),
    network VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Currencies Table
```sql
CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. User Balances Table
```sql
CREATE TABLE user_balances (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    coin_id INTEGER REFERENCES coins(id),
    balance DECIMAL(24, 8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, coin_id)
);
```

### 5. Transactions Table
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    coin_id INTEGER REFERENCES coins(id),
    amount DECIMAL(24, 8) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'exchange', 'p2p'
    status VARCHAR(20) DEFAULT 'completed',
    tx_hash VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Wallets Table
```sql
CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    coin_id INTEGER REFERENCES coins(id),
    address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, coin_id)
);
```

### 7. Exchange Rates Table
```sql
CREATE TABLE exchange_rates (
    id SERIAL PRIMARY KEY,
    from_coin_id INTEGER REFERENCES coins(id),
    to_coin_id INTEGER REFERENCES coins(id),
    rate DECIMAL(24, 8) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_coin_id, to_coin_id)
);
```

### 8. Commissions Table
```sql
CREATE TABLE commissions (
    id SERIAL PRIMARY KEY,
    coin_id INTEGER REFERENCES coins(id),
    operation_type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'exchange', 'p2p'
    fixed_amount DECIMAL(24, 8) DEFAULT 0,
    percentage DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 9. P2P Ads Table
```sql
CREATE TABLE p2p_ads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(10) NOT NULL, -- 'buy', 'sell'
    coin_id INTEGER REFERENCES coins(id),
    currency_id INTEGER REFERENCES currencies(id),
    price DECIMAL(24, 8) NOT NULL,
    available_amount DECIMAL(24, 8) NOT NULL,
    min_amount DECIMAL(24, 8) NOT NULL,
    max_amount DECIMAL(24, 8) NOT NULL,
    terms TEXT,
    instructions TEXT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 10. Payment Methods Table
```sql
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 11. User Payment Methods Table
```sql
CREATE TABLE user_payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    payment_method_id INTEGER REFERENCES payment_methods(id),
    details TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, payment_method_id)
);
```

### 12. Ad Payment Methods Table
```sql
CREATE TABLE ad_payment_methods (
    id SERIAL PRIMARY KEY,
    ad_id INTEGER REFERENCES p2p_ads(id),
    payment_method_id INTEGER REFERENCES payment_methods(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ad_id, payment_method_id)
);
```

### 13. P2P Deals Table
```sql
CREATE TABLE p2p_deals (
    id SERIAL PRIMARY KEY,
    ad_id INTEGER REFERENCES p2p_ads(id),
    buyer_id INTEGER REFERENCES users(id),
    seller_id INTEGER REFERENCES users(id),
    amount DECIMAL(24, 8) NOT NULL,
    total_price DECIMAL(24, 8) NOT NULL,
    payment_method_id INTEGER REFERENCES payment_methods(id),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled', 'disputed'
    time_limit INTEGER NOT NULL, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 14. P2P Deal Messages Table
```sql
CREATE TABLE p2p_deal_messages (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER REFERENCES p2p_deals(id),
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 15. P2P Appeals Table
```sql
CREATE TABLE p2p_appeals (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER REFERENCES p2p_deals(id),
    user_id INTEGER REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'resolved', 'rejected'
    resolution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Initial Data

Here's some initial data to populate the database:

```sql
-- Insert coins
INSERT INTO coins (name, symbol, logo, network) VALUES
('Toncoin', 'TON', './toncoin.png', 'TON'),
('Tether', 'USDT', './tether.png', 'TON'),
('Notcoin', 'NOT', './notcoin.png', 'TON'),
('Bitcoin', 'BTC', './bitcoin.png', 'BTC'),
('Ethereum', 'ETH', './etherium.png', 'ETH'),
('Solana', 'SOL', './solana.png', 'SOL'),
('TRON', 'TRX', './tron.png', 'TRX'),
('Dogecoin', 'DOGE', './dogecoin.png', 'DOGE');

-- Insert currencies
INSERT INTO currencies (name, symbol, description, icon) VALUES
('Российский рубль', 'RUB', 'Российский рубль', '₽'),
('Доллар США', 'USD', 'Доллар США', '$'),
('Евро', 'EUR', 'Евро', '€'),
('Белорусский рубль', 'BYN', 'Белорусский рубль', 'Br'),
('Украинская гривна', 'UAH', 'Украинская гривна', '₴'),
('Британский фунт', 'GBP', 'Британский фунт', '£'),
('Китайский юань', 'CNY', 'Китайский юань', '¥'),
('Казахстанский тенге', 'KZT', 'Казахстанский тенге', '₸');

-- Insert payment methods
INSERT INTO payment_methods (name, icon) VALUES
('Сбербанк', './sberbank.png'),
('Тинькофф', './tinkoff.png'),
('QIWI', './qiwi.png'),
('Yandex.Money', './yandex.png'),
('Visa/Mastercard', './visa.png'),
('Paypal', './paypal.png'),
('WebMoney', './webmoney.png'),
('Alipay', './alipay.png');
```

## Redis Caching Strategy

Based on the code, the application uses Redis for caching:

1. **Coins and Currencies**: Cached with no expiration
2. **User Data**: Cached with 1-hour expiration
3. **Exchange Rates**: Cached with 1-hour expiration
4. **User Balances**: Cached with 1-hour expiration, invalidated on update

## Database Indexes

To optimize query performance:

```sql
-- Indexes for users table
CREATE INDEX idx_users_telegram_id ON users(telegram_id);

-- Indexes for transactions table
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_coin_id ON transactions(coin_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);

-- Indexes for user_balances table
CREATE INDEX idx_user_balances_user_id ON user_balances(user_id);
CREATE INDEX idx_user_balances_coin_id ON user_balances(coin_id);

-- Indexes for p2p_ads table
CREATE INDEX idx_p2p_ads_user_id ON p2p_ads(user_id);
CREATE INDEX idx_p2p_ads_status ON p2p_ads(status);
CREATE INDEX idx_p2p_ads_type ON p2p_ads(type);
CREATE INDEX idx_p2p_ads_coin_id ON p2p_ads(coin_id);
CREATE INDEX idx_p2p_ads_currency_id ON p2p_ads(currency_id);

-- Indexes for p2p_deals table
CREATE INDEX idx_p2p_deals_buyer_id ON p2p_deals(buyer_id);
CREATE INDEX idx_p2p_deals_seller_id ON p2p_deals(seller_id);
CREATE INDEX idx_p2p_deals_status ON p2p_deals(status);
```

This database schema provides a solid foundation for the TokenBridge application, supporting all the functionality shown in the code while maintaining data integrity and optimizing for performance.