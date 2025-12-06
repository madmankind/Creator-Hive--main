# 🚀 Creator Hive - Setup Guide

Complete setup guide for getting Creator Hive running locally with Supabase + Prisma.

---

## 📋 **Prerequisites**

- Node.js 18+ (recommended: 20+)
- pnpm (install: `npm install -g pnpm`)
- Git
- Supabase account (free tier works)

---

## 🔧 **Step 1: Clone & Install**

```bash
# Clone the repository
git clone <your-repo-url>
cd creator-hive-next

# Install dependencies
pnpm install
```

---

## 🗄️ **Step 2: Set Up Supabase**

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Name:** Creator Hive (or your choice)
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to you
5. Wait for project to be created (~2 minutes)

### 2.2 Get Database Connection String

1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. Add `?pgbouncer=true&connection_limit=1` at the end

**Example:**
```
postgresql://postgres:yourpassword@db.abcdefgh.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

### 2.3 Get API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

---

## 🔐 **Step 3: Configure Environment Variables**

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your values:

```env
# Database (from Step 2.2)
DATABASE_URL="postgresql://postgres:yourpassword@db.xxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Supabase (from Step 2.3)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Optional: Service role key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# NextAuth (generate a random secret)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"  # Use: openssl rand -base64 32

# External APIs (if you have them)
OPENAI_API_KEY="your-openai-key"
MODASH_API_BASE="https://api.modash.io/v1"
MODASH_API_KEY="your-modash-key"
```

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in `.env.local`.

---

## 🗃️ **Step 4: Set Up Database**

### 4.1 Generate Prisma Client

```bash
pnpm db:generate
```

### 4.2 Push Schema to Database

This will create all tables in your Supabase database:

```bash
pnpm db:push
```

**Note:** For production, use migrations instead:
```bash
pnpm db:migrate
```

### 4.3 (Optional) Seed Database

If you have seed data:

```bash
pnpm db:seed
```

### 4.4 Verify Database

Open Prisma Studio to view your database:

```bash
pnpm db:studio
```

This opens a GUI at `http://localhost:5555` where you can browse your database.

---

## 🚀 **Step 5: Run Development Server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✅ **Verification Checklist**

- [ ] Server starts without errors
- [ ] Can access `http://localhost:3000`
- [ ] No console errors in browser
- [ ] Database connection works (check Prisma Studio)
- [ ] Environment variables are loaded correctly

---

## 🐛 **Troubleshooting**

### **Error: "Missing Supabase environment variables"**

- Check that `.env.local` exists and has correct values
- Restart the dev server after adding environment variables
- Verify variable names match exactly (case-sensitive)

### **Error: "Can't reach database server"**

- Check your `DATABASE_URL` is correct
- Verify your Supabase project is active
- Check if your IP is allowed (Supabase allows all by default)
- Try the connection string from Supabase dashboard again

### **Error: "Prisma Client not generated"**

```bash
pnpm db:generate
```

### **Error: "Schema is out of sync"**

```bash
pnpm db:push
```

Or if using migrations:
```bash
pnpm db:migrate
```

### **Port 3000 already in use**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

---

## 📚 **Next Steps**

1. **Read the Project Checklist:** `PROJECT_CHECKLIST.md`
2. **Review Database Schema:** `prisma/schema.prisma`
3. **Explore API Routes:** `src/app/api/`
4. **Check Component Structure:** `src/components/`

---

## 🔗 **Useful Commands**

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Prisma Client
pnpm db:push          # Push schema changes (dev)
pnpm db:migrate       # Create migration (dev)
pnpm db:migrate:deploy # Apply migrations (prod)
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed database
pnpm db:reset         # Reset database (⚠️ deletes all data)

# Code Quality
pnpm lint             # Run ESLint
pnpm typecheck        # TypeScript type checking
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
```

---

## 📖 **Additional Resources**

- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Project Checklist](./PROJECT_CHECKLIST.md)

---

**Need Help?** Check the troubleshooting section or open an issue in the repository.

