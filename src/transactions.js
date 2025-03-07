async function transferToCommonAccount(userId, coin, amount) {
    const wallets = await getWallets(userId);
    const coinWallet = wallets[coin];
    const commonAccount = await getCommonAccount(coin);

    // Проверяем, что у пользователя достаточно средств на кошельке
    if (await getBalance(coinWallet.address) < amount) {
        throw new Error('Недостаточно средств на кошельке');
    }

    // Отправляем средства с кошелька пользователя на общий счет
    const transaction = await sendTransaction(coinWallet, commonAccount.address, amount);

    // Обновляем баланс кошелька пользователя
    await updateBalance(coinWallet.address, -amount);

    // Обновляем баланс общего счета
    await updateBalance(commonAccount.address, amount);

    return transaction;
}

async function getWallets(userId) {
    // Получаем кошельки пользователя из базы данных
    const query = `
        SELECT * FROM user_balances
        WHERE user_id = $1;
    `;
    const values = [userId];
    const results = await pgPool.query(query, values);
    const wallets = {};

    results.rows.forEach((row) => {
        wallets[row.coin_id] = {
            address: row.address,
            privateKey: row.private_key,
        };
    });

    return wallets;
}

async function getCommonAccount(coin) {
    // Получаем общий счет для данной валюты из базы данных
    const query = `
        SELECT * FROM common_accounts
        WHERE coin_id = $1;
    `;
    const values = [coin];
    const result = await pgPool.query(query, values);
    const commonAccount = result.rows[0];

    return {
        address: commonAccount.address,
        privateKey: commonAccount.private_key,
    };
}

async function getBalance(address) {
    // Получаем баланс кошелька по его адресу
    const query = `
        SELECT balance FROM user_balances
        WHERE address = $1;
    `;
    const values = [address];
    const result = await pgPool.query(query, values);
    const balance = result.rows[0].balance;

    return balance;
}

async function updateBalance(address, amount) {
    // Обновляем баланс кошелька
    const query = `
        UPDATE user_balances
        SET balance = balance + $1
        WHERE address = $2;
    `;
    const values = [amount, address];
    await pgPool.query(query, values);
}

async function sendTransaction(wallet, toAddress, amount) {
    // Отправляем средства с кошелька на другой адрес
    // Реализация этой функции зависит от используемого криптовалютного кошелька
    // Например, для Bitcoin можно использовать библиотеку bitcoinjs-lib
    const transaction = await bitcoin.payments.p2pkh({
        pubkey: wallet.publicKey,
        address: toAddress,
        amount: amount,
    });

    return transaction;
}

async function getCoinsFromRedis() {
    // Получаем список валют из Redis
    const coins = await redis.get('coins');
    return JSON.parse(coins);
}

async function getCommonAccount(coin) {
    // Получаем общий счет для данной валюты из базы данных
    const query = `
        SELECT * FROM common_accounts
        WHERE coin_id = $1;
    `;
    const values = [coin];
    const result = await pgPool.query(query, values);
    const commonAccount = result.rows[0];

    return {
        address: commonAccount.address,
        privateKey: commonAccount.private_key,
    };
}

async function getBalance(address) {
    // Получаем баланс кошелька по его адресу
    const query = `
        SELECT balance FROM user_balances
        WHERE address = $1;
    `;
    const values = [address];
    const result = await pgPool.query(query, values);
    const balance = result.rows[0].balance;

    return balance;
}

async function updateBalance(address, amount) {
    // Обновляем баланс кошелька
    const query = `
        UPDATE user_balances
        SET balance = balance + $1
        WHERE address = $2;
    `;
    const values = [amount, address];
    await pgPool.query(query, values);
}

async function sendTransaction(wallet, toAddress, amount) {
    // Отправляем средства с кошелька на другой адрес
    // Реализация этой функции зависит от используемого криптовалютного кошелька
    // Например, для Bitcoin можно использовать библиотеку bitcoinjs-lib
    const transaction = await bitcoin.payments.p2pkh({
        pubkey: wallet.publicKey,
        address: toAddress,
        amount: amount,
    });

    return transaction;
}

async function transferFromCommonAccount(userId, coin, amount) {
    // Вывод средств с общего счета
    const commonAccount = await getCommonAccount(coin);
    const userWallet = await getUserWallet(userId, coin);

    // Проверяем, что на общем счете достаточно средств
    if (await getBalance(commonAccount.address) < amount) {
        throw new Error('Недостаточно средств на общем счете');
    }

    // Отправляем средства с общего счета на кошелек пользователя
    const transaction = await sendTransaction(commonAccount, userWallet.address, amount);

    // Обновляем баланс общего счета
    await updateBalance(commonAccount.address, -amount);

    // Обновляем баланс кошелька пользователя
    await updateBalance(userWallet.address, amount);

    return transaction;
}

async function getUserWallet(userId, coin) {
    // Получаем кошелек пользователя для данной валюты
    const query = `
        SELECT * FROM user_balances
        WHERE user_id = $1 AND coin_id = $2;
    `;
    const values = [userId, coin];
    const result = await pgPool.query(query, values);
    const userWallet = result.rows[0];

    return {
        address: userWallet.address,
        privateKey: userWallet.private_key,
    };
}