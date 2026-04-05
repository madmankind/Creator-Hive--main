#!/bin/bash
# Quick Analytics Setup Script for Creator Hive
# Run this to install essential analytics libraries

echo "🚀 Creator Hive Analytics Setup"
echo "================================"
echo ""

# Step 1: Install Sentry
echo "📦 Installing Sentry for error tracking..."
npm install @sentry/nextjs
echo "✅ Sentry installed"
echo ""

# Step 2: Info needed
echo "📋 You'll need these from Google & Hotjar:"
echo ""
echo "1. GA4 Measurement ID:"
echo "   - Go to https://analytics.google.com"
echo "   - Select Creator Hive property"
echo "   - Admin → Data Streams → Web → Copy Measurement ID (G-XXXXXXXXXX)"
echo ""
echo "2. Hotjar ID:"
echo "   - Go to https://www.hotjar.com"
echo "   - Sign up (free plan)"
echo "   - Copy Hotjar ID (8 digits)"
echo ""
echo "3. Sentry DSN:"
echo "   - Go to https://sentry.io"
echo "   - Sign up (free plan)"
echo "   - Create project for Next.js"
echo "   - Copy DSN (looks like: https://abc@def.ingest.sentry.io/123456)"
echo ""

read -p "Press ENTER after you've gathered these..."

echo ""
echo "📝 Add these to .env.local:"
echo ""
echo "NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX"
echo "GA4_API_SECRET=xxxxx_from_google_analytics"
echo "NEXT_PUBLIC_HOTJAR_ID=12345678"
echo "NEXT_PUBLIC_SENTRY_DSN=https://abc@def.ingest.sentry.io/123456"
echo "SENTRY_DSN=https://abc_private@def.ingest.sentry.io/123456"
echo ""

echo "✅ Setup complete! Next steps:"
echo "1. Add env vars to .env.local"
echo "2. Update src/app/layout.tsx with GA4 & Hotjar scripts"
echo "3. Create sentry.client.config.ts & sentry.server.config.ts"
echo "4. Restart dev server"
echo ""
echo "📖 Full guide: ANALYTICS_SETUP_GUIDE.md"
