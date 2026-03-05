# SASAGRAM

Сайт-визитка стримера SASAVOT на Next.js 16. Проект показывает главный экран, расписание стримов, записи и клипы Twitch, а также блок "Смотреть также" с агрегированными статусами Twitch/Kick.

Отдельная страница `/rating` позволяет анонимно оценивать реальные сохраненные стримы. Ограничение построено на случайном `HttpOnly` cookie: сервер хранит только хеш токена, не сохраняет raw IP, email, аккаунт или browser fingerprint.

## Стек

- Next.js 16 + App Router
- React 19
- TypeScript
- Tailwind CSS 4
- PostgreSQL / Supabase Postgres

## Запуск

```bash
npm install
npm run dev
```

Приложение будет доступно на `http://localhost:3000`.
Локальная разработка запускается через Webpack (`next dev --webpack`), чтобы избежать проблем Turbopack с резолвом модулей в этом окружении.

## Проверки

```bash
npm run lint
npm run typecheck
npm run build
npm run deps:check
```

## Карта зависимостей

Для визуализации связей между файлами и папками используется `dependency-cruiser`.

```bash
npm run deps:graph
```

Команда создаст файл `dependency-graph.svg` в корне проекта. Скрипт ищет `dot` в `PATH`, а на Windows также проверяет стандартные пути установки Graphviz.

Для текстовой проверки архитектурных правил используй:

```bash
npm run deps:check
```

## Env-переменные

Минимальный набор зависит от того, какие интеграции нужны локально.

### База данных

- `DATABASE_URL`
- или `SUPABASE_DB_URL`
- или набор `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

### Twitch

- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`

### Kick

- `KICK_API_KEY`
- или `KICK_CLIENT_ID`
- `KICK_CLIENT_SECRET`
- `KICK_AUTH_URL` опционально

### UI / медиа

- `NEXT_PUBLIC_DISCLAIMER_VIDEO_URL` опционально
- `NEXT_PUBLIC_DISCLAIMER_VIDEO_URL_MOBILE` опционально

## Основные папки

```text
src/
  app/                    Next.js страницы и API routes
  components/             legacy-обёртки и общие секции страницы
  features/
    schedule/             клиентский feature расписания
    twitch/               клиентский feature VODs/Clips
  server/
    db/                   подключение к БД
    streams/              сервисы и репозиторий стримов
    twitch/               Twitch API + media cache
    kick/                 Kick API helpers
    watch-also/           агрегация статусов внешних каналов
  shared/
    lib/                  переиспользуемые клиентские утилиты
  db/                     SQL init/migrations
scripts/                  служебные скрипты инициализации/миграции
```

## Package Manager

Проект использует `npm`. `package-lock.json` является основным lock-файлом.
