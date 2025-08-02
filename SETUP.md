# Настройка проекта

## 1. Настройка базы данных Supabase

### Создание проекта:

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Дождитесь завершения инициализации

### Получение строки подключения:

1. Перейдите в **Settings** → **Database**
2. Скопируйте **Connection string** из раздела **Connection parameters**
3. Замените `[password]` на ваш пароль базы данных

## 2. Настройка хранилища Backblaze B2

### Создание аккаунта:

1. Перейдите на [backblaze.com](https://www.backblaze.com/b2/cloud-storage.html)
2. Создайте аккаунт или войдите в существующий
3. Перейдите в **B2 Cloud Storage**

### Создание bucket:

1. Нажмите **Create a Bucket**
2. Введите уникальное имя bucket
3. Выберите **Public** для публичного доступа к изображениям
4. Нажмите **Create a Bucket**

### Создание Application Key:

1. Перейдите в **App Keys**
2. Нажмите **Add a New Application Key**
3. Введите имя ключа
4. Выберите созданный bucket или оставьте **All** для доступа ко всем
5. Выберите права: **Read and Write**
6. Нажмите **Create New Key**
7. **Важно**: Сохраните **applicationKey** - он показывается только один раз!

## 3. Настройка переменных окружения

Создайте файлы `.env` на основе примеров:

### Корневой `.env`:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Backblaze B2 Storage
B2_APPLICATION_KEY_ID="your-b2-application-key-id"
B2_APPLICATION_KEY="your-b2-application-key"
B2_BUCKET_ID="your-b2-bucket-id"
B2_BUCKET_NAME="your-b2-bucket-name"
B2_DOWNLOAD_URL="https://f000.backblazeb2.com"

# Clerk Authentication
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."

# Server
PORT=3001
NODE_ENV=development
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Backblaze B2 Storage
B2_APPLICATION_KEY_ID="your-b2-application-key-id"
B2_APPLICATION_KEY="your-b2-application-key"
B2_BUCKET_ID="your-b2-bucket-id"
B2_BUCKET_NAME="your-b2-bucket-name"
B2_DOWNLOAD_URL="https://f000.backblazeb2.com"

# Clerk Authentication
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Server
PORT=3001
NODE_ENV=development
```

### `apps/web/.env`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# API
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 4. Установка зависимостей и миграция

```bash
# Установка зависимостей
pnpm install

# Генерация Prisma клиента
cd apps/api
pnpm run prisma:generate

# Выполнение миграций
pnpm run prisma:migrate
```

## 5. Запуск проекта

```bash
# Запуск всех сервисов
pnpm dev

# Или запуск по отдельности:
# API
cd apps/api && pnpm run start:dev

# Frontend
cd apps/web && pnpm run dev
```

## Получение данных для переменных окружения

### Supabase:

- **Project URL**: Settings → API → Project URL
- **Connection string**: Settings → Database → Connection parameters

### Backblaze B2:

- **Application Key ID**: App Keys → keyID
- **Application Key**: App Keys → applicationKey (показывается только при создании!)
- **Bucket ID**: B2 Cloud Storage → выберите bucket → Bucket Details → bucketId
- **Bucket Name**: Имя bucket, которое вы создали
- **Download URL**: Обычно `https://f000.backblazeb2.com` (может отличаться в зависимости от региона)

### Clerk:

- **Publishable Key**: Dashboard → API Keys → Publishable key
- **Secret Key**: Dashboard → API Keys → Secret key

## Структура хранения файлов в B2

Файлы будут сохраняться в следующей структуре:

```
your-bucket/
├── photos/
│   ├── original/
│   │   ├── uuid1.jpg
│   │   ├── uuid2.png
│   │   └── ...
│   └── thumbnails/
│       ├── uuid1_thumbnail.jpg
│       ├── uuid2_thumbnail.png
│       └── ...
```

## Troubleshooting

### Ошибки подключения к базе данных:

- Проверьте правильность строки подключения
- Убедитесь, что пароль не содержит специальных символов без экранирования
- Проверьте, что проект Supabase активен

### Ошибки загрузки файлов в B2:

- Проверьте правильность Application Key ID и Application Key
- Убедитесь, что bucket существует и доступен
- Проверьте права доступа для Application Key

### Ошибки аутентификации:

- Проверьте правильность ключей Clerk
- Убедитесь, что домен добавлен в настройки Clerk проекта
