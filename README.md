# FILM!

**Ссылка на работающее приложение:** _замените на URL после деплоя, например http://your-name-film.nomoreparties.site/_

## Быстрый старт через Docker

1. Скопируйте `.env.example` в `.env` в корне проекта и укажите `IMAGE_OWNER` — ваш логин на GitHub.
2. Запустите:

```bash
docker compose up -d --build
```

3. Приложение: http://localhost  
4. pgAdmin: http://localhost:8080 (логин/пароль из `.env`)

### Наполнение базы данных

В pgAdmin добавьте сервер PostgreSQL:

| Параметр | Значение |
|----------|----------|
| Host     | `postgres` |
| Port     | `5432` |
| Database | из `POSTGRES_DB` в `.env` |
| Username | из `POSTGRES_USER` |
| Password | из `POSTGRES_PASSWORD` |

Выполните SQL-скрипты по порядку из `backend/test/`:

1. `prac.init.sql` — создание таблиц
2. `prac.films.sql` — тестовые фильмы
3. `prac.schedules.sql` — расписание сеансов

## Локальная разработка

### PostgreSQL

Запустите PostgreSQL (через Docker или локально):

```bash
docker compose up -d postgres
```

### Бэкенд

```bash
cd backend
npm ci
cp .env.example .env   # настройте DATABASE_URL
npm run start:dev
```

Переменные окружения бэкенда:

| Переменная | Описание |
|------------|----------|
| `DATABASE_DRIVER` | `postgres` |
| `DATABASE_URL` | строка подключения к PostgreSQL |
| `LOGGER_TYPE` | `dev` / `json` / `tskv` |
| `PORT` | порт API (по умолчанию 3000) |

### Фронтенд

```bash
cd frontend
npm ci
npm run dev
```

## Тестирование

```bash
cd backend
npm test
npm run lint
```

## CI/CD

- `.github/workflows/deploy.yml` — при push в `main` собирает и публикует образы в `ghcr.io/<ваш-логин>/film-react-nest-*`.
- `docker-compose.prod.yml` — для продакшен-сервера (только pull образов, без сборки).

Подробные шаги деплоя на Yandex Cloud — в файле [USER_TASKS.md](./USER_TASKS.md).
