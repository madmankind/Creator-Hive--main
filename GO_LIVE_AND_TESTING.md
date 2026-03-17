# Creator Hive — Go Live & Testing Mode

## Launch to Go Live

### 1. Pre-deploy checklist
- [ ] **Database**: Run `npm run db:migrate:deploy` on production DB
- [ ] **Secrets**: Set all env vars in Vercel/hosting (DATABASE_URL, AUTH_SECRET, Stripe, Supabase)
- [ ] **AUTH_URL / NEXTAUTH_URL**: Set to production URL (e.g. `https://creatorhive.com`)
- [ ] **App URL**: Set `APP_URL` to production domain

### 2. Deploy (Vercel)
```bash
vercel --prod
# or connect GitHub for auto-deploy
```

### 3. Post-deploy verification
- [ ] Visit `/` — homepage loads
- [ ] Auth flow (sign in with email / Google)
- [ ] Talent carousel and booking flow
- [ ] Admin at `/admin` (requires user with role ADMIN)

---

## Testing Mode (Staging / Pre-production)

### Option A: Vercel Preview
1. Push to a branch → Vercel creates preview URL
2. Use preview URL for testing; production remains untouched
3. Set env vars for preview: use staging DB and Stripe test keys

### Option B: Separate staging deployment
1. Create a second Vercel project (e.g. `creator-hive-staging`)
2. Use staging DB (`DATABASE_URL`), Stripe test keys, Supabase dev project
3. Point `AUTH_URL` to staging domain
4. Run migrations on staging DB

### Option C: Local testing against production DB (careful)
- Use `.env.local` with production `DATABASE_URL` for smoke tests
- **Risk**: Test data will appear in production
- Prefer Options A or B

---

## Testing checklist
- [ ] Client sign-up and auth
- [ ] Talent sign-up and onboarding
- [ ] Agency sign-up
- [ ] Package selection → talent gallery → add to pod
- [ ] Send booking request
- [ ] Admin: stats, bookings, campaigns, talent, users, agreements
- [ ] Creator dashboard: campaigns, invites
- [ ] Agency dashboard: campaigns

---

## Admin view connectivity

| Admin tab | Data source | Endpoints |
|-----------|-------------|-----------|
| Overview | Prisma (stats) | `/api/admin/stats` |
| Bookings | Prisma (BookingRequest) | `/api/admin/bookings`, `/api/admin/bookings/[id]` |
| Campaigns | Prisma (Campaign) | `/api/admin/campaigns`, `/api/admin/campaigns/[id]` |
| Talent | Prisma (CreatorProfile) | Server component + `/api/admin/talent/[id]` |
| Users | Prisma (User) | `/api/admin/users` |
| Agreements | UserAgreement + Supabase | `/api/admin/user-agreement/[userId]` |
