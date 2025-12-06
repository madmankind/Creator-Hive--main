# ⚡ Creator Hive - Quick Reference

Quick reference for common tasks and commands.

---

## 🗄️ **Database Commands**

```bash
# Generate Prisma Client (after schema changes)
pnpm db:generate

# Push schema to database (development)
pnpm db:push

# Create migration (development)
pnpm db:migrate

# Apply migrations (production)
pnpm db:migrate:deploy

# Open database GUI
pnpm db:studio

# Seed database
pnpm db:seed

# Reset database (⚠️ deletes all data)
pnpm db:reset
```

---

## 🔧 **Development Commands**

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Run tests
pnpm test

# Watch tests
pnpm test:watch

# E2E tests
pnpm e2e
```

---

## 📁 **Project Structure**

```
src/
├── app/              # Next.js pages & API routes
├── components/       # React components
├── lib/              # Utilities & helpers
├── server/           # Server-only code (db.ts)
├── store/            # Zustand stores
└── types/            # TypeScript types

prisma/
├── schema.prisma     # Database schema
└── seed.ts          # Seed data
```

---

## 🔐 **Environment Variables**

Required in `.env.local`:

```env
DATABASE_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXTAUTH_SECRET=...
```

See `.env.example` for full list.

---

## 🎯 **Common Tasks**

### Add a new database model

1. Edit `prisma/schema.prisma`
2. Run `pnpm db:push` (dev) or `pnpm db:migrate` (prod)
3. Run `pnpm db:generate`

### Create a new API route

1. Create `src/app/api/[route]/route.ts`
2. Use `db` from `src/server/db.ts`
3. Validate with Zod schemas
4. Handle errors with `handleDatabaseError`

### Add a new component

1. Create in `src/components/`
2. Use TypeScript
3. Add to appropriate folder (ui/, agency/, etc.)
4. Export from index if reusable

---

## 🐛 **Quick Fixes**

### "Prisma Client not generated"
```bash
pnpm db:generate
```

### "Schema out of sync"
```bash
pnpm db:push
```

### "Missing environment variables"
- Check `.env.local` exists
- Restart dev server
- Verify variable names match exactly

### "Port 3000 in use"
```bash
lsof -ti:3000 | xargs kill -9
```

---

## 📖 **Key Files**

- **Database Schema:** `prisma/schema.prisma`
- **DB Client:** `src/server/db.ts`
- **Supabase Client:** `src/lib/supabase.ts`
- **Setup Guide:** `SETUP_GUIDE.md`
- **Checklist:** `PROJECT_CHECKLIST.md`

---

## 🔗 **Useful Links**

- [Prisma Studio](http://localhost:5555) - Database GUI
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)

