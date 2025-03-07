// -- Создание новой записи в таблице валют
// INSERT INTO currencies (name, symbol, exchange_rate)
// VALUES ('Новая валюта', 'NEW', 1.0);
//
// -- Обновление таблицы балансов в фоновом режиме
// CREATE OR REPLACE FUNCTION update_balances()
// RETURNS void AS $$
// DECLARE
// user_id integer;
// BEGIN
// FOR user_id IN SELECT id FROM users LOOP
// UPDATE balances
// SET balance = balance || '{"NEW": 0}'
// WHERE user_id = user_id;
// END LOOP;
// END;
// $$ LANGUAGE plpgsql;
//
// -- Выполнение функции в фоновом режиме
// SELECT pg_background_launch('update_balances()');