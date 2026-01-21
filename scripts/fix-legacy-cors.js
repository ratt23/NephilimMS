// Batch update all legacy standalone Netlify functions with proper CORS
// Run this with: node scripts/fix-legacy-cors.js

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const functionsDir = './netlify/functions';
const files = [
    'getDoctors.js',
    'getLeaveData.js',
    'getPromoImages.js',
    'catalog-list.js',
    'catalog-upsert.js',
    'catalog-delete.js',
    'newsletter-archive.js',
    'newsletter-issue.js',
    'newsletter-upsert.js',
    'device-heartbeat.js',
    'imageProxy.js',
    'pdf-proxy.js'
];

const oldCorsPattern = /const headers = \{[\s\S]*?'Access-Control-Allow-Origin': '\*',/;
const newCorsCode = `const origin = event.headers.origin || event.headers.Origin || '';
  const allowedOrigins = [
    'https://shab.web.id',
    'https://jadwaldoktershab.netlify.app',
    'https://dashdev1.netlify.app',
    'https://dashdev2.netlify.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
  ];

  const headers = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '*',`;

let updatedCount = 0;

for (const file of files) {
    const filepath = join(functionsDir, file);
    try {
        let content = readFileSync(filepath, 'utf8');

        if (oldCorsPattern.test(content)) {
            content = content.replace(oldCorsPattern, newCorsCode);
            writeFileSync(filepath, content, 'utf8');
            console.log(`✅ Updated: ${file}`);
            updatedCount++;
        } else {
            console.log(`⏭️  Skipped: ${file} (no matching pattern)`);
        }
    } catch (error) {
        console.log(`❌ Error processing ${file}:`, error.message);
    }
}

console.log(`\n✅ Total updated: ${updatedCount}/${files.length} files`);
