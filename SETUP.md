# Project Setup

## 1. Supabase Database Setup

### Create a project:

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for initialization to complete

### Get the connection string:

1. Go to **Settings** → **Database**
2. Copy the **Connection string** from the **Connection parameters** section
3. Replace `[password]` with your database password

## 2. Backblaze B2 Storage Setup

### Create an account:

1. Go to [backblaze.com](https://www.backblaze.com/b2/cloud-storage.html)
2. Create an account or log in to an existing one
3. Go to **B2 Cloud Storage**

### Create a bucket:

1. Click **Create a Bucket**
2. Enter a unique bucket name
3. Select **Public** for public access to images
4. Click **Create a Bucket**

### Create an Application Key:

1. Go to **App Keys**
2. Click **Add a New Application Key**
3. Enter a key name
4. Select the created bucket or leave **All** for access to all
5. Select permissions: **Read and Write**
6. Click **Create New Key**
7. **Important**: Save the **applicationKey** - it is shown only once!

## 3. Set Up Environment Variables

Create `.env` files based on the examples:

### Root `.env`:

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

## 4. Install Dependencies and Migrate

```bash
# Install dependencies
pnpm install

# Generate Prisma client
cd apps/api
pnpm run prisma:generate

# Run migrations
pnpm run prisma:migrate
```

## 5. Run the Project

```bash
# Run all services
pnpm dev

# Or run separately:
# API
cd apps/api && pnpm run start:dev

# Frontend
cd apps/web && pnpm run dev
```

## Getting Data for Environment Variables

### Supabase:

- **Project URL**: Settings → API → Project URL
- **Connection string**: Settings → Database → Connection parameters

### Backblaze B2:

- **Application Key ID**: App Keys → keyID
- **Application Key**: App Keys → applicationKey (shown only on creation!)
- **Bucket ID**: B2 Cloud Storage → select bucket → Bucket Details → bucketId
- **Bucket Name**: The name of the bucket you created
- **Download URL**: Usually `https://f000.backblazeb2.com` (may vary by region)

### Clerk:

- **Publishable Key**: Dashboard → API Keys → Publishable key
- **Secret Key**: Dashboard → API Keys → Secret key

## B2 File Storage Structure

Files will be saved in the following structure:

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

### Database connection errors:

- Check the correctness of the connection string
- Make sure the password does not contain special characters without escaping
- Check that the Supabase project is active

### B2 file upload errors:

- Check the correctness of the Application Key ID and Application Key
- Make sure the bucket exists and is accessible
- Check the access rights for the Application Key

### Authentication errors:

- Check the correctness of the Clerk keys
- Make sure the domain is added to the Clerk project settings
