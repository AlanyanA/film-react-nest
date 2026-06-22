# Deployment Guide for Yandex Cloud

## Проблема

При деплое на Yandex Cloud приложение показывает ошибку `relation "films" does not exist` — таблицы в БД не созданы.

## Почему это произошло

1. **Локально** (в docker-compose):
   - При старте автоматически создаётся база `afisha`
   - `TypeORM` с `synchronize: true` создаёт таблицы из сущностей

2. **На сервере** (Yandex Cloud):
   - Контейнер бэкенда подключается к `exampledb` (неправильная БД)
   - Таблицы `films` и `schedules` в этой БД не существуют
   - Синхронизация не запустилась, потому что нет прав или база неправильная

## Быстрое исправление (3 шага)

### Шаг 1: Подключитесь к PostgreSQL на сервере

```bash
# SSH на ВМ Yandex Cloud
ssh -i your-key ubuntu@<your-server-ip>

# Подключитесь к PostgreSQL
psql -h localhost -U postgres -d postgres
```

Если требуется пароль — найдите его в конфигурации сервера или docker-compose.yml.

### Шаг 2: Создайте БД и таблицы

Выполните в psql (скопируйте целиком):

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS afisha OWNER exampleuser;

-- Switch to afisha
\c afisha;

-- Create films table
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

-- Create schedules table
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

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE afisha TO exampleuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO exampleuser;

-- Verify
\dt
```

### Шаг 3: Обновите переменные окружения и перезапустите бэкенд

Убедитесь, что в окружении бэкенда установлены:

```bash
DATABASE_DRIVER=postgres
DATABASE_URL=postgres://exampleuser:examplepass@postgres:5432/afisha
DATABASE_USERNAME=exampleuser
DATABASE_PASSWORD=examplepass
```

Перезапустите контейнер:

```bash
docker compose restart backend
# или
docker restart <backend-container-id>
```

## Проверка

```bash
# На сервере
curl http://localhost:3000/api/afisha/films

# Должен вернуть: {"items":[],"total":0}
# (или с данными, если уже добавили фильмы)
```

## Добавление тестовых данных

Если нужны тестовые фильмы и расписание:

```bash
# На ВМ Yandex Cloud
psql -h localhost -U exampleuser -d afisha << 'EOF'
INSERT INTO films (id, rating, director, tags, image, cover, title, about, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 8.5, 'Christopher Nolan', ARRAY['Action', 'Sci-Fi'], '/images/bg1s.jpg', '/images/bg1c.jpg', 'Inception', 'A thief who steals corporate secrets', 'Dom Cobb is a skilled thief...'),
('550e8400-e29b-41d4-a716-446655440002', 9.0, 'Francis Ford Coppola', ARRAY['Crime', 'Drama'], '/images/bg2s.jpg', '/images/bg2c.jpg', 'The Godfather', 'The aging patriarch of an organized crime dynasty', 'The film presents an epic saga...');

INSERT INTO schedules (id, daytime, hall, rows, seats, price, taken, film_id) VALUES
('650e8400-e29b-41d4-a716-446655440001', '2026-06-23 10:00:00+03:00', 1, 10, 15, 350.00, ARRAY[]::text[], '550e8400-e29b-41d4-a716-446655440001'),
('650e8400-e29b-41d4-a716-446655440002', '2026-06-23 14:00:00+03:00', 2, 10, 15, 400.00, ARRAY[]::text[], '550e8400-e29b-41d4-a716-446655440002');
EOF
```

Или загрузите скрипт `insert-test-data.sql`:

```bash
psql -h localhost -U exampleuser -d afisha -f insert-test-data.sql
```

## Альтернатива: Использовать текущую БД `exampledb`

Если вы хотите оставить подключение к `exampledb` без изменений:

```sql
-- Создайте БД exampledb, если её нет
CREATE DATABASE IF NOT EXISTS exampledb OWNER exampleuser;
\c exampledb;

-- Затем выполните остальной SQL из Шага 2
-- (все команды CREATE TABLE и GRANT)
```

## Команды для диагностики

```bash
# Список всех БД
psql -U postgres -c "\l"

# Таблицы в конкретной БД
psql -U exampleuser -d afisha -c "\dt"

# Проверить подключение бэкенда
curl -v http://localhost:3000/api/afisha/films

# Логи контейнера бэкенда
docker logs <backend-container-id> --tail 100
```

## Если всё ещё не работает

1. **Проверьте, что контейнеры запущены**:
   ```bash
   docker ps
   ```

2. **Проверьте логи**:
   ```bash
   docker logs postgres_container
   docker logs <backend-container-id>
   ```

3. **Проверьте наличие данных**:
   ```bash
   psql -U exampleuser -d afisha -c "SELECT COUNT(*) FROM films;"
   ```

4. **Проверьте переменные окружения в бэкенде**:
   ```bash
   docker exec <backend-container-id> env | grep DATABASE
   ```

Если ошибка остаётся — пришлите вывод команд выше для диагностики.
