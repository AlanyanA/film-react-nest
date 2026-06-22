# Задачи, которые нужно выполнить вам

Этот документ описывает всё, что **невозможно сделать автоматически** из среды разработки (нет доступа к вашим облачным аккаунтам, SSH-ключам, доменам и GitHub-репозиторию под вашим именем). Код, Docker, тесты и CI уже подготовлены в репозитории — вам остаётся пройти шаги ниже.

---

## Содержание

1. [Подготовка GitHub-репозитория](#1-подготовка-github-репозитория)
2. [Локальная проверка Docker](#2-локальная-проверка-docker)
3. [Публикация образов в GHCR](#3-публикация-образов-в-ghcr)
4. [Создание VM в Yandex Cloud](#4-создание-vm-в-yandex-cloud)
5. [Домен nomoreparties.site](#5-домен-nomorepartiessite)
6. [Деплой на сервер](#6-деплой-на-сервер)
7. [Наполнение базы через pgAdmin](#7-наполнение-базы-через-pgadmin)
8. [Закрытие порта pgAdmin](#8-закрытие-порта-pgadmin)
9. [Обновление README и Pull Request](#9-обновление-readme-и-pull-request)
10. [Опционально: HTTPS и Continuous Delivery](#10-опционально-https-и-continuous-delivery)
11. [Чек-лист перед отправкой на ревью](#11-чек-лист-перед-отправкой-на-ревью)

---

## 1. Подготовка GitHub-репозитория

### Что уже сделано в коде

- Логгеры `DevLogger`, `JsonLogger`, `TskvLogger` + фабрика по `LOGGER_TYPE`
- Unit-тесты на логгеры и контроллеры
- `Dockerfile` для backend, frontend, nginx
- `docker-compose.yml` (локальная сборка) и `docker-compose.prod.yml` (сервер)
- GitHub Action `.github/workflows/deploy.yml`
- SQL-скрипты в `backend/test/`
- `.env.example` в корне и в `backend/`, `frontend/`

### Что сделать вам

1. **Закоммитьте и запушьте** все изменения в свой GitHub-репозиторий.
2. Убедитесь, что основная ветка называется **`main`** (workflow срабатывает на push в `main`).
3. В корневом `.env` (локально, не коммитить!) укажите:
   ```env
   IMAGE_OWNER=ваш-логин-github
   ```
   Именно этот логин будет в путях образов: `ghcr.io/<IMAGE_OWNER>/film-react-nest-backend:latest`.

---

## 2. Локальная проверка Docker

На машине должен быть установлен **Docker Desktop** (Windows) или Docker Engine (Linux/macOS).

```powershell
# В корне проекта
Copy-Item .env.example .env
# Отредактируйте .env: IMAGE_OWNER=ваш-github-логин

docker compose up -d --build
docker compose ps
```

**Ожидаемый результат:**

| Сервис   | Статус        | Порт              |
|----------|---------------|-------------------|
| postgres | running       | внутренний        |
| pgadmin  | running       | 8080              |
| backend  | running       | внутренний        |
| frontend | running       | внутренний        |
| nginx    | running       | 80                |

- Сайт: http://localhost  
- pgAdmin: http://localhost:8080  

Если `docker compose up --build` падает — исправьте ошибки **до деплоя**. Ревьювер не примет работу с ошибками сборки.

---

## 3. Публикация образов в GHCR

### Автоматически (рекомендуется)

После push в `main` workflow **Build and Push Docker Images** соберёт три образа и отправит их в GitHub Container Registry.

Проверка: GitHub → ваш репозиторий → **Actions** → последний успешный run.

### Сделать образы публичными (обязательно для pull на сервере без токена)

1. GitHub → ваш профиль → **Packages**
2. Для каждого пакета (`film-react-nest-backend`, `-frontend`, `-nginx`):
   - Package settings → **Change visibility** → **Public**

Без этого сервер не сможет скачать образы командой `docker compose pull`.

### Если workflow не запускается

- Ветка должна быть `main`
- В репозитории должны быть включены **Actions** (Settings → Actions → General)
- У workflow есть `permissions: packages: write` — это уже настроено в `deploy.yml`

---

## 4. Создание VM в Yandex Cloud

Эти шаги выполняются **только вами** в консоли Yandex Cloud.

### 4.1. Регистрация и платёжный аккаунт

1. https://cloud.yandex.ru — регистрация
2. Создайте **платёжный аккаунт** (доступен стартовый грант)
3. Создайте **облако** и **каталог** (folder)

### 4.2. Виртуальная машина

Рекомендуемые параметры:

| Параметр | Значение |
|----------|----------|
| Платформа | Intel Ice Lake |
| vCPU | 2 |
| RAM | 2–4 GB |
| Диск | 20 GB SSD |
| ОС | Ubuntu 22.04 LTS |
| Публичный IP | Включить |

### 4.3. SSH-доступ

**Вариант A — SSH-ключ при создании VM**

```powershell
# На Windows (PowerShell), если нет ключа:
ssh-keygen -t ed25519 -C "yandex-deploy"
# Содержимое .pub файла вставьте в Yandex Cloud при создании VM
```

**Вариант B — Yandex Cloud CLI (`yc`)**

```bash
yc compute instance list
yc compute ssh --name <имя-vm>
```

### 4.4. Группа безопасности / firewall

Откройте входящие порты:

| Порт | Назначение |
|------|------------|
| 22   | SSH |
| 80   | HTTP (nginx) |
| 8080 | pgAdmin (временно, потом закроете) |

---

## 5. Домен nomoreparties.site

1. Перейдите на https://domain.nomoreparties.site (сервис Практикума)
2. Создайте поддомен, например: `arman-film.nomoreparties.site`
3. Укажите **публичный IP** вашей VM из Yandex Cloud
4. Дождитесь применения DNS (обычно несколько минут)

Проверка:

```bash
ping arman-film.nomoreparties.site
```

---

## 6. Деплой на сервер

### 6.1. Подключение по SSH

```bash
ssh ubuntu@<публичный-IP-VM>
# или
ssh ubuntu@arman-film.nomoreparties.site
```

### 6.2. Установка Docker на Ubuntu

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
# Перелогиньтесь, чтобы группа docker применилась
```

### 6.3. Каталог проекта на сервере

```bash
mkdir -p ~/film-app && cd ~/film-app
```

Скопируйте на сервер **только** (через `scp` или вручную):

- `docker-compose.prod.yml` → переименуйте в `docker-compose.yml`
- `.env` (создайте на сервере из `.env.example`, **не** коммитьте секреты в git)

Пример `.env` на сервере:

```env
POSTGRES_USER=exampleuser
POSTGRES_PASSWORD=<надёжный-пароль>
POSTGRES_DB=exampledb
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=<надёжный-пароль>
PGADMIN_PORT=8080

IMAGE_OWNER=ваш-github-логин

PORT=3000
NODE_ENV=production
LOGGER_TYPE=tskv
DEBUG=*
```

### 6.4. Запуск

```bash
docker compose pull
docker compose up -d
docker compose ps
```

Проверьте в браузере:

- http://arman-film.nomoreparties.site — SPA (пока без фильмов, пока не заполните БД)
- http://arman-film.nomoreparties.site:8080 — pgAdmin

### 6.5. Если `pull` не работает

```bash
# Образы приватные — войдите в GHCR:
echo <GITHUB_PAT> | docker login ghcr.io -u ваш-github-логин --password-stdin
```

`GITHUB_PAT` — Personal Access Token с правом `read:packages`.  
Лучше сделать пакеты **публичными** (см. раздел 3).

---

## 7. Наполнение базы через pgAdmin

1. Откройте http://<ваш-домен>:8080
2. Войдите: `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD` из `.env`
3. **Add New Server:**
   - Name: `film-db`
   - Host: `postgres`
   - Port: `5432`
   - Database: `exampledb` (или ваш `POSTGRES_DB`)
   - Username / Password: из `.env`
4. Правый клик на базе → **Query Tool**
5. Выполните по порядку (файлы лежат у вас локально в `backend/test/`):

   ```
   prac.init.sql
   prac.films.sql
   prac.schedules.sql
   ```

6. Обновите http://<ваш-домен> — должны появиться фильмы.

---

## 8. Закрытие порта pgAdmin

После наполнения БД порт 8080 не должен быть доступен из интернета.

### Вариант A — убрать проброс порта

На сервере в `docker-compose.yml` удалите секцию `ports` у сервиса `pgadmin`, затем:

```bash
docker compose up -d
```

Доступ к pgAdmin только через SSH-туннель:

```bash
# С локальной машины:
ssh -L 8080:localhost:8080 ubuntu@<IP-VM>
# Затем откройте http://localhost:8080
```

### Вариант B — firewall Yandex Cloud

В группе безопасности VM удалите правило для порта 8080.

---

## 9. Обновление README и Pull Request

### README (обязательно для ревью)

В `README.md` замените placeholder на реальную ссылку:

```markdown
**Ссылка на работающее приложение:** http://arman-film.nomoreparties.site/
```

Закоммитьте и запушьте.

### Pull Request

1. Создайте ветку, например `review-2` или `sprint-14`
2. Запушьте все изменения
3. Откройте **Pull Request** на проверку
4. **Не пишите** в PR вопросы и просьбы о помощи ревьюеру — это основание для отклонения

---

## 10. Опционально: HTTPS и Continuous Delivery

### HTTPS (хорошая практика, не критично)

На VM с Ubuntu можно поставить **Certbot** + nginx снаружи или расширить конфиг nginx:

```bash
sudo apt install certbot
# Получить сертификат для домена и настроить редирект HTTP → HTTPS
```

Для `nomoreparties.site` уточните в материалах курса, поддерживается ли Let's Encrypt на этом домене.

### Continuous Delivery по SSH

Добавьте в `.github/workflows/deploy.yml` job после сборки образов:

```yaml
  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd ~/film-app
            docker compose pull
            docker compose up -d
```

Секреты в GitHub → Settings → Secrets:

| Secret | Значение |
|--------|----------|
| `SERVER_HOST` | IP или домен VM |
| `SERVER_USER` | `ubuntu` |
| `SERVER_SSH_KEY` | приватный SSH-ключ |

---

## 11. Чек-лист перед отправкой на ревью

### Критические (без них не примут)

- [ ] `npm run lint` в `backend/` — без ошибок
- [ ] `npm test` в `backend/` — все тесты зелёные
- [ ] `docker compose up -d --build` локально — без ошибок
- [ ] Приложение доступно по ссылке в README
- [ ] В README указана **рабочая** ссылка на задеплоенное приложение
- [ ] PR создан и отправлен на проверку
- [ ] Есть `.env.example` с перечислением переменных
- [ ] В `backend/test/` есть `prac.init.sql`, `prac.films.sql`, `prac.schedules.sql`
- [ ] Три логгера реализованы, выбор через `LOGGER_TYPE`
- [ ] GitHub Action публикует образы в GHCR

### Хорошие практики (плюс к оценке)

- [ ] HTTPS + редирект с HTTP
- [ ] SPA-роутинг в nginx (`try_files ... /index.html`)
- [ ] Автодеплой по SSH после push в `main`

---

## Частые проблемы

| Симптом | Решение |
|---------|---------|
| Backend падает при старте | Проверьте `DATABASE_URL`, дождитесь healthy postgres |
| Пустой список фильмов | Выполните SQL-скрипты в pgAdmin |
| `pull` образов 401/403 | Сделайте пакеты GHCR публичными или `docker login ghcr.io` |
| nginx 502 | `docker compose logs backend` — смотрите ошибки NestJS |
| Картинки не грузятся | Проверьте прокси `/content/` в nginx и `ServeStaticModule` в backend |
| Workflow не пушит образы | Push только в `main`, проверьте вкладку Actions |

---

## Что было сделано автоматически (для справки)

| Компонент | Путь |
|-----------|------|
| DevLogger | `backend/src/logger/dev.logger.ts` |
| JsonLogger | `backend/src/logger/json.logger.ts` |
| TskvLogger | `backend/src/logger/tskv.logger.ts` |
| Фабрика логгеров | `backend/src/logger/logger.factory.ts` |
| Подключение в bootstrap | `backend/src/main.ts` |
| Тесты логгеров | `backend/src/logger/*.spec.ts` |
| Тесты контроллеров | `backend/src/films/films.controller.spec.ts`, `backend/src/order/order.controller.spec.ts` |
| Backend Dockerfile | `backend/Dockerfile` |
| Frontend Dockerfile | `frontend/Dockerfile` |
| Nginx | `nginx/Dockerfile`, `nginx/nginx.conf` |
| Compose (dev) | `docker-compose.yml` |
| Compose (prod) | `docker-compose.prod.yml` |
| CI/CD | `.github/workflows/deploy.yml` |

Если что-то из чек-листа не сходится — напишите, на каком шаге застряли.
