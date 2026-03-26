// scripts/run-ingest.mjs — run once to populate editorial content
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Load env files manually
function loadEnv(file) {
  try {
    const content = readFileSync(resolve(root, file), 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([^#=\s]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (match) process.env[match[1]] = match[2];
    }
  } catch { /* file may not exist */ }
}
loadEnv('.env');
loadEnv('.env.local');

// Dynamic import after env is set
const { runFullIngestion } = await import('../src/lib/editorial/ingest.ts');
console.log('[ingest] Starting...');
const results = await runFullIngestion();
console.log('[ingest] Done:', JSON.stringify(results.map(r => ({
  slug: r.slug, new: r.itemsNew, skipped: r.itemsSkipped, error: r.error
})), null, 2));
process.exit(0);
