# FILM!

http://arman-film.nomorepartiessite.ru

## Быстрый старт через Docker

1. Скопируйте `.env.example` в `.env` в корне проекта и укажите переменные окружения (см. ниже).
2. Запустите:

```bash
docker compose up -d --build
```

3. Приложение: http://localhost  
4. pgAdmin: http://localhost:8080 (логин/пароль из `.env`)

### Переменные окружения (`.env`)

```env
# Frontend
VITE_API_URL=http://localhost:3000/api/afisha
VITE_CDN_URL=http://localhost/content/afisha

# PostgreSQL
POSTGRES_USER=exampleuser
POSTGRES_PASSWORD=examplepassword
POSTGRES_DB=afisha
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin

# Backend
DATABASE_DRIVER=postgres
DATABASE_URL=postgres://exampleuser:examplepassword@postgres:5432/afisha
DATABASE_USERNAME=exampleuser
DATABASE_PASSWORD=examplepassword
PORT=3000
DEBUG=*
NODE_ENV=development
```

## Локальная разработка

### PostgreSQL

Запустите PostgreSQL через Docker Compose:

```bash
docker compose up -d postgres pgadmin
```

### Бэкенд

```bash
cd backend
npm ci
cp .env.example .env   # перепроверьте DATABASE_URL = afisha
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
