// WalletBase.js
import { pgPool } from '../../database/db.js';
class WalletBase {
    constructor() {
        // Массив (или база данных) для аудита транзакций
        this.processedTransactions = new Set();
        // Подключение к базе данных
        this.db = pgPool;
    }

    // Метод для вывода на внешний кошелек
    async withdrawToExternalWallet(recipientAddress, amount) {
        // Обновление баланса пользователя в базе данных
        await this.db.query('UPDATE user_balances SET balance = balance - $1 WHERE user_id = $2 AND coin_id = $3', [amount, this.userId, this.coinId]);
        // Вставка новой транзакции в базу данных
        await this.db.query('INSERT INTO transactions (user_id, coin_id, amount, type, timestamp) VALUES ($1, $2, $3, $4, $5)', [this.userId, this.coinId, amount, 'withdrawal', new Date()]);
        // Выполнение транзакции
        await this.withdraw(recipientAddress, amount);
    }

    // Метод для пополнения на кошелек системы
    async depositToSystemWallet(amount) {
        // Обновление баланса пользователя в базе данных
        await this.db.query('UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2 AND coin_id = $3', [amount, this.userId, this.coinId]);
        // Вставка новой транзакции в базу данных
        await this.db.query('INSERT INTO transactions (user_id, coin_id, amount, type, timestamp) VALUES ($1, $2, $3, $4, $5)', [this.userId, this.coinId, amount, 'deposit', new Date()]);
    }

    // Метод получения адреса кошелька (реализуется в наследнике)
    async getAddress() {
        throw new Error("Not implemented");
    }

    // Метод для получения баланса кошелька (реализуется в наследнике)
    async getBalance() {
        throw new Error("Not implemented");
    }

    // Метод для отправки транзакции (реализуется в наследнике)
    async withdraw(recipientAddress, amount) {
        throw new Error("Not implemented");
    }

    // Метод для получения списка транзакций (реализуется в наследнике)
    async getTransactions() {
        // Получение списка транзакций из базы данных
        const transactions = await this.db.query('SELECT * FROM transactions');
        return transactions;
    }

    // Унифицированный метод для проверки входящих депозитов
    async checkNewDeposits() {
        const transactions = await this.getTransactions();
        if (!transactions || !transactions.length) {
            console.log("Нет новых транзакций");
            return;
        }

        for (const tx of transactions) {
            if (this.processedTransactions.has(tx.id)) continue;

            // Если транзакция входящая (deposit) и имеет положительную сумму
            if (tx.type === 'deposit' && tx.amount > 0) {
                // Извлечение возможного идентификатора пользователя из payload,
                // если он передается провайдером
                const userId = tx.payload ? this.parseUserIdFromPayload(tx.payload) : null;

                await this.recordDeposit({
                    txHash: tx.id,
                    amount: tx.amount,
                    fromAddress: tx.from,
                    userId: userId,
                    timestamp: new Date(tx.timestamp * 1000) // предполагая, что tx.timestamp в секундах
                });

                // Помечаем транзакцию как обработанную
                this.processedTransactions.add(tx.id);
            }
        }
    }

    // Метод разбора payload для поиска идентификатора пользователя (можно переопределить)
    parseUserIdFromPayload(payload) {
        // Пример: если payload имеет вид "user:12345"
        if (typeof payload === "string" && payload.startsWith("user:")) {
            return payload.split("user:")[1];
        }
        return null;
    }

    // Метод фиксации депозита, здесь следует обновить баланс пользователя в базе
    async recordDeposit(depositDetails) {
        // Обновление баланса пользователя в базе данных
        await this.db.query('UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2 AND coin_id = $3', [depositDetails.amount, depositDetails.userId, depositDetails.coinId]);
        // Вставка новой транзакции в базу данных
        await this.db.query('INSERT INTO transactions (user_id, coin_id, amount, type, timestamp) VALUES ($1, $2, $3, $4, $5)', [depositDetails.userId, depositDetails.coinId, depositDetails.amount, 'deposit', depositDetails.timestamp]);
    }
}

export default WalletBase;