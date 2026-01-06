import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

// Manual .env parsing
let dbUrl = process.env.NEON_DATABASE_URL;
if (!dbUrl && fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    const match = envConfig.match(/NEON_DATABASE_URL=(.*)/);
    if (match) {
        dbUrl = match[1].trim().replace(/^["']|["']$/g, '');
    }
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function fixSchema() {
    try {
        console.log("Adding 'event_name' column if missing...");
        await sql`ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS event_name TEXT;`;
        console.log("✅ Column 'event_name' checked/added.");
    } catch (err) {
        console.error("❌ Schema fix failed:", err);
    } finally {
        await sql.end();
    }
}

fixSchema();
