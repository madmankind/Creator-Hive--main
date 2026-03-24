# Prisma Schema Update Instructions

## Required Updates to schema.prisma

Add the following to `/Users/ajil/creator-hive-next/prisma/schema.prisma`:

### 1. Add New Enums (after existing enums)

```prisma
enum PricingTier {
  PRO
  SIGNATURE
}

enum Market {
  UAE
  KSA
  GCC
  GLOBAL
}

enum LanguagePref {
  EN
  AR
  BOTH
}

enum BriefObjective {
  AWARENESS
  GROWTH
  CONVERSIONS
  LAUNCH
}

enum BriefTimeline {
  ASAP
  THIS_MONTH
  NEXT_MONTH
  FLEXIBLE
}

enum BookingRequestStatusNew {
  SUBMITTED
  IN_REVIEW
  NEEDS_INFO
  APPROVED
  CONVERTED_TO_CAMPAIGN
  REJECTED
}

enum AttachmentType {
  TRADE_LICENSE
  BRAND_GUIDELINES
  OTHER
}

enum AttachmentOwnerType {
  REQUEST
  ORG
  CAMPAIGN
}
```

### 2. Add New Models (before closing brackets)

```prisma
model Brief {
  id            String          @id @default(cuid())
  objective     BriefObjective
  outputs       String[]
  platforms     String[]
  industry      String
  market        Market
  language      LanguagePref
  keyMessage    String?
  timeline      BriefTimeline
  pricingTier   PricingTier
  referenceLink String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  bookingRequests BookingRequest[]
  
  @@index([objective])
  @@index([market])
  @@index([createdAt])
  @@map("briefs")
}

model Pod {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  items           PodItem[]
  bookingRequests BookingRequest[]
  
  @@map("pods")
}

model PodItem {
  id        String   @id @default(cuid())
  podId     String
  talentId  String
  createdAt DateTime @default(now())
  
  pod Pod @relation(fields: [podId], references: [id], onDelete: Cascade)
  
  @@index([podId])
  @@index([talentId])
  @@map("pod_items")
}

model Attachment {
  id        String              @id @default(cuid())
  ownerType AttachmentOwnerType
  ownerId   String
  type      AttachmentType
  url       String
  filename  String
  createdAt DateTime            @default(now())
  
  @@index([ownerType, ownerId])
  @@index([type])
  @@map("attachments")
}
```

### 3. Replace Existing BookingRequest Model

**REMOVE** the old BookingRequest model:
```prisma
model BookingRequest {
  id           String        @id @default(cuid())
  userId       String
  agencyId     String?
  bookingType  BookingType   @default(SHORT)
  startDate    String?
  budgetRange  String?
  description  String        @db.Text
  contactEmail String
  talentIds    String[]
  status       BookingStatus @default(PENDING)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  user   User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  agency AgencyAccount? @relation(fields: [agencyId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([agencyId])
  @@map("booking_requests")
}
```

**REPLACE WITH:**
```prisma
model BookingRequest {
  id           String                   @id @default(cuid())
  briefId      String
  podId        String
  companyName  String
  contactEmail String
  contactPhone String?
  requestNote  String?
  status       BookingRequestStatusNew  @default(SUBMITTED)
  userId       String?
  createdAt    DateTime                 @default(now())
  updatedAt    DateTime                 @updatedAt
  
  brief Brief  @relation(fields: [briefId], references: [id], onDelete: Cascade)
  pod   Pod    @relation(fields: [podId], references: [id], onDelete: Cascade)
  user  User?  @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([briefId])
  @@index([podId])
  @@index([status])
  @@index([userId])
  @@index([createdAt])
  @@map("booking_requests")
}
```

### 4. Remove Deprecated Enums (if unused elsewhere)

```prisma
// Can be removed if not used by other models
enum BookingType {
  SHORT
  LONG
}

enum BookingStatus {
  PENDING
  REVIEWING
  CONFIRMED
}
```

## Migration Steps

1. **Backup your database first:**
   ```bash
   pg_dump your_database > backup_$(date +%Y%m%d).sql
   ```

2. **Update schema.prisma** with above changes

3. **Generate migration:**
   ```bash
   pnpm db:generate
   pnpm prisma migrate dev --name booking_flow_refactor
   ```

4. **Push to database:**
   ```bash
   pnpm db:push
   ```

5. **Verify in database:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('briefs', 'pods', 'pod_items', 'booking_requests', 'attachments');
   ```

## Rollback Plan (if needed)

```bash
# Restore from backup
psql your_database < backup_YYYYMMDD.sql

# Or use Prisma migrate
pnpm prisma migrate reset
```

## Notes

- Old `BookingRequest` data will be LOST during migration (drop/recreate)
- If you have production data, write a data migration script
- Test in staging environment first
- Update any existing API routes that reference old fields
