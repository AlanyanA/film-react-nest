# Инструкция по исправлению на Yandex Cloud

## Проблема

На сервере бэкенд подключается к БД `exampledb`, но таблицы там не созданы.

## Решение

### Вариант 1: Создать БД `afisha` и таблицы (рекомендуется)

1. **Подключитесь к PostgreSQL** (через SSH на ВМ):
```bash
psql -h localhost -U postgres -d postgres
```

2. **Выполните скрипт инициализации**:
```bash
psql -h localhost -U postgres -f init-cloud.sql
```

Или вручную (скопируйте содержимое `init-cloud.sql` в psql):
```sql
CREATE DATABASE IF NOT EXISTS afisha OWNER exampleuser;

-- Switch to afisha database
\c afisha;

CREATE TABLE IF NOT EXISTS films (
  id VARCHAR PRIMARY KEY,
  rating FLOAT NOT NULL,
  director VARCHAR NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::text[],
  image VARCHAR NOT NULL,
  cover VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  about VARCHAR NOT NULL,
  description VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS schedules (
  id VARCHAR PRIMARY KEY,
  daytime TIMESTAMPTZ NOT NULL,
  hall INTEGER NOT NULL,
  rows INTEGER NOT NULL,
  seats INTEGER NOT NULL,
  price FLOAT NOT NULL,
  taken TEXT[] DEFAULT ARRAY[]::text[],
  film_id VARCHAR NOT NULL REFERENCES films(id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON DATABASE afisha TO exampleuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO exampleuser;
```

3. **Обновите переменные окружения бэкенда**:
```bash
# Убедитесь, что в контейнере/сервере установлены:
DATABASE_DRIVER=postgres
DATABASE_URL=postgres://exampleuser:examplepass@localhost:5432/afisha
DATABASE_USERNAME=exampleuser
DATABASE_PASSWORD=examplepass
```

4. **Перезапустите бэкенд**:
```bash
docker compose restart backend
# или если используется systemd:
sudo systemctl restart backend
```

### Вариант 2: Использовать текущую БД `exampledb`

Если вы хотите оставить `exampledb`, выполните скрипт, но замените первую строку:
```sql
CREATE DATABASE IF NOT EXISTS exampledb OWNER exampleuser;
\c exampledb;
-- остальной код тот же
```

## Проверка

1. **Убедитесь, что таблицы созданы**:
```bash
psql -h localhost -U exampleuser -d afisha -c "\dt"
```

2. **Проверьте подключение бэкенда**:
```bash
curl http://localhost:3000/api/afisha/films
```

Должен вернуться JSON с фильмами (или пустой массив, если таблица пуста).

## Если есть данные

Если на сервере уже есть данные в какой-то БД, выполните:
```bash
# Показать все БД и таблицы:
psql -U postgres -c "\l"
psql -U postgres -d <database_name> -c "\dt"
```

И пришлите скрин — подскажу, как мигрировать данные в правильную БД.
