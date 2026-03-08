#!/bin/bash
# Installs a cron job to re-seed creator profiles every 3 hours.
# Run once: bash scripts/install-cron.sh

PROJ="/Users/ajil/creator-hive-next"
TSX=$(which tsx 2>/dev/null || echo "/usr/local/bin/tsx")
NODE=$(which node 2>/dev/null || echo "/usr/local/bin/node")
LOG="/tmp/creatorhive-seed.log"

CRON_CMD="0 */3 * * * cd $PROJ && $NODE $(dirname $TSX)/tsx scripts/seed-creators.ts >> $LOG 2>&1"

# Remove any existing creator-hive seed entry, then add fresh
(crontab -l 2>/dev/null | grep -v "seed-creators"; echo "$CRON_CMD") | crontab -

echo "✅ Cron installed. Runs every 3 hours."
echo "   Log: $LOG"
echo ""
crontab -l | grep seed-creators
