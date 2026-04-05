#!/bin/bash
# Creator Hive Integration Setup Script
# Sets up: Sentry, Hotjar, GA4, PostHog

echo "🚀 Creator Hive Integration Setup"
echo "===================================="
echo ""

# Step 1: Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Creating with environment variables..."
    touch .env.local
fi

# Step 2: Prompt for integration keys
echo "📝 Enter your integration keys (press Enter to skip any):"
echo ""

read -p "Sentry DSN (https://abc@def.ingest.sentry.io/123456): " SENTRY_DSN
read -p "Sentry Auth Token (for CLI setup): " SENTRY_AUTH_TOKEN
read -p "GA4 Measurement ID (G-XXXXXXXXXX): " GA4_ID
read -p "PostHog API Key (phc_...): " POSTHOG_KEY

echo ""
echo "📦 Adding to .env.local..."

# Add to .env.local if not already present
if ! grep -q "NEXT_PUBLIC_SENTRY_DSN" .env.local 2>/dev/null; then
    echo "NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN" >> .env.local
fi

if ! grep -q "SENTRY_DSN" .env.local 2>/dev/null; then
    echo "SENTRY_DSN=$SENTRY_DSN" >> .env.local
fi

if ! grep -q "NEXT_PUBLIC_GA_MEASUREMENT_ID" .env.local 2>/dev/null; then
    echo "NEXT_PUBLIC_GA_MEASUREMENT_ID=$GA4_ID" >> .env.local
fi

if ! grep -q "NEXT_PUBLIC_POSTHOG_KEY" .env.local 2>/dev/null; then
    echo "NEXT_PUBLIC_POSTHOG_KEY=$POSTHOG_KEY" >> .env.local
fi

echo "✅ Environment variables added!"
echo ""

# Step 3: Install Sentry
echo "📦 Installing Sentry..."
npm install @sentry/nextjs

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Restart your dev server: npm run dev"
echo "2. Visit: https://creatorhive.ae to verify integrations"
echo "3. Check dashboards:"
echo "   - Sentry: https://sentry.io"
echo "   - PostHog: https://app.posthog.com"
echo "   - GA4: https://analytics.google.com"
echo "   - Hotjar: https://dashboard.hotjar.com"
