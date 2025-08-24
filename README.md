# Creator Hive - Mobile-First Payments Platform

A modern, mobile-first Stripe-style payments platform built specifically for creators and freelancers. Rebuilt from the ground up with Next.js App Router, TypeScript, and Tailwind CSS.

## 🚀 Features

### Mobile-First Design
- **Responsive Navigation**: Bottom tab bar for mobile, top nav for desktop
- **Touch-Optimized**: 44px+ tap targets, swipe gestures, mobile-friendly interactions
- **Progressive Enhancement**: Scales beautifully from mobile to desktop

### Core Functionality
- **Dashboard**: Real-time KPI cards showing balance, pending payments, and activity
- **Invoice Management**: Create, send, and track invoices with line items and totals
- **Wallet**: Balance overview, payment methods, and payout scheduling
- **Client Management**: Organize and track client information
- **Job Discovery**: Browse and apply for creator opportunities
- **Messaging**: Client communication system

### Stripe Integration
- **Connect Onboarding**: Seamless account setup for payments
- **Webhook Handling**: Real-time payment and payout status updates
- **Payment Methods**: Card and bank account management
- **Secure Processing**: All payments handled through Stripe

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: Radix UI primitives with custom components
- **State Management**: SWR for data fetching
- **Database**: Prisma-ready (currently using mock APIs)
- **Payments**: Stripe Connect
- **Authentication**: NextAuth.js ready
- **Testing**: Vitest + Playwright

## 🎨 Design System

### Color Tokens
```css
--bg: #0b0f17;
--surface: #111827;
--surface-2: #0f172a;
--text: #e8ebf3;
--muted: #9aa3b2;
--border: rgba(255,255,255,.10);
--accent: #8b5cf6;
--accent-2: #06b6d4;
--success: #22c55e;
--warn: #f59e0b;
--danger: #ef4444;
```

### Typography Scale
- **Display**: 28px/36px (mobile) → 36px/44px (desktop)
- **H1**: 22px/28px → 28px/36px
- **H2**: 18px/22px → 22px/28px
- **H3**: 16px/18px → 18px/22px
- **Body**: 14px/16px → 16px/18px
- **Mono**: 13px/15px → 15px/17px

### Components
- **GlowCard**: Glassmorphic cards with hover animations
- **Table**: Stripe-style data tables with sorting and pagination
- **Modal/Sheet**: Accessible overlays for desktop/mobile
- **FAB**: Floating action button for primary actions
- **Badge**: Status indicators with semantic colors

## 📱 Routes

### Mobile Routes (Primary UX)
- `/home` - Dashboard with KPIs and activity feed
- `/wallet` - Balance, payment methods, and payouts
- `/messages` - Client conversations
- `/profile` - User profile and quick settings
- `/jobs` - Job discovery and applications

### Settings (Stripe-style)
- `/settings/invoices` - Full invoice management
- `/settings/payment-methods` - Cards and bank accounts
- `/settings/payouts` - Payout scheduling and history
- `/settings/tax-kyc` - Tax information and verification
- `/settings/clients` - Client management
- `/settings/api-keys` - API access management
- `/settings/webhooks` - Webhook configuration

## 🔧 Setup

### Environment Variables
Create a `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database
DATABASE_URL="file:./dev.db"
```

### Installation
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
pnpm e2e
```

### Stripe CLI Setup
For webhook development:
```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

## 📊 API Routes

### Mock APIs (Development)
- `GET /api/metrics` - Revenue and booking metrics
- `GET /api/wallet/balance` - Available and pending balance
- `GET/POST /api/invoices` - Invoice management
- `GET/POST /api/clients` - Client management
- `GET/POST /api/payment-methods` - Payment method management

### Stripe Integration
- `POST /api/stripe/connect` - Create Connect accounts and onboarding links
- `POST /api/stripe/webhook` - Handle Stripe webhook events

## 🏗 Architecture

### File Structure
```
src/
├── app/
│   ├── (mobile)/           # Mobile-first routes
│   ├── settings/           # Settings pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Base UI components
│   ├── stripekit/         # Stripe-style components
│   └── nav/               # Navigation components
├── lib/
│   ├── stripe.ts          # Stripe server client
│   ├── stripeClient.ts    # Stripe browser client
│   └── utils.ts           # Utilities
└── styles/
    └── brand.css          # Design tokens and utilities
```

### Key Patterns
- **Mobile-First**: All components designed for mobile, enhanced for desktop
- **Server Components**: Leverage Next.js App Router for performance
- **Type Safety**: Full TypeScript coverage with strict mode
- **Accessibility**: WCAG compliant with keyboard navigation and ARIA labels
- **Performance**: Optimized for Core Web Vitals

## 🚀 Deployment

### Production Checklist
- [ ] Configure real Stripe keys
- [ ] Set up database (Prisma migrations)
- [ ] Configure NextAuth providers
- [ ] Set up webhook endpoints
- [ ] Enable error monitoring
- [ ] Configure analytics

### Performance Targets
- **Lighthouse Mobile**: ≥90/95/95
- **CLS**: < 0.05
- **FCP**: < 1.8s
- **LCP**: < 2.5s

## 🧪 Testing

### Unit Tests
```bash
pnpm test
```
- Component rendering and behavior
- API route functionality
- Utility functions

### E2E Tests
```bash
pnpm e2e
```
- User authentication flow
- Invoice creation and management
- Payment method setup
- Mobile navigation

## 🤝 Contributing

1. Follow mobile-first development principles
2. Maintain TypeScript strict mode compliance
3. Use semantic HTML and ARIA labels
4. Test on mobile devices and screen readers
5. Follow the established design system

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ for the creator economy.

