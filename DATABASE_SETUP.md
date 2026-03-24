# Database Setup - Quick Fix

## The Problem
Your `.env.local` has a placeholder DATABASE_URL:
```
DATABASE_URL="postgresql://user:password@localhost:5432/creatorhive?schema=public"
```

Prisma requires a **real database connection** to run migrations.

---

## Solution Options

### Option 1: Use Supabase (Recommended - 5 minutes)

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Sign up / Log in
   - Click "New Project"
   - Choose a name and region
   - **Save your database password!**

2. **Get Connection String:**
   - In Supabase dashboard: **Settings** → **Database**
   - Scroll to **Connection string**
   - Select **URI** tab
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your actual password
   - Add `?pgbouncer=true&connection_limit=1` at the end

3. **Update `.env.local`:**
   ```bash
   # Edit .env.local and replace DATABASE_URL with:
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   ```

4. **Run Migration:**
   ```bash
   npx prisma migrate dev --name add_brief_status_and_audit
   npx prisma generate
   ```

---

### Option 2: Use Local PostgreSQL (If you have it installed)

1. **Create Database:**
   ```bash
   createdb creatorhive
   ```

2. **Update `.env.local`:**
   ```bash
   DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/creatorhive?schema=public"
   ```
   Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials.

3. **Run Migration:**
   ```bash
   npx prisma migrate dev --name add_brief_status_and_audit
   npx prisma generate
   ```

---

### Option 3: Skip Migration for Now (Development Only)

If you just want to test the code changes without running migrations:

1. **Temporarily set a dummy URL:**
   ```bash
   # In .env.local, use a valid format (but won't actually connect):
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test?schema=public"
   ```

2. **Generate Prisma Client only:**
   ```bash
   npx prisma generate
   ```

   **Note:** This will generate the client but won't create database tables. You'll need to run migrations later when you have a real database.

---

## Quick Check

After updating DATABASE_URL, verify it's loaded:

```bash
# Check if Prisma can read it
npx prisma validate
```

If this passes, you can run migrations.

---

## Need Help?

- See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed Supabase setup
- See [DATABASE_RECOMMENDATION.md](./DATABASE_RECOMMENDATION.md) for database options
