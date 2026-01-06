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

if (!dbUrl) {
    console.error("Error: NEON_DATABASE_URL not found in .env or environment");
    process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function setupSchema() {
    try {
        console.log("Creating 'analytics_events' table...");

        await sql`
            CREATE TABLE IF NOT EXISTS analytics_events (
                id SERIAL PRIMARY KEY,
                date DATE DEFAULT CURRENT_DATE,
                timestamp TIMESTAMP DEFAULT NOw(),
                event_type TEXT DEFAULT 'pageview',
                region TEXT,
                city TEXT,
                device_type TEXT,
                browser TEXT,
                os TEXT,
                referrer TEXT,
                traffic_source TEXT,
                path TEXT,
                ip_hash TEXT
            );
        `;

        console.log("✅ Table 'analytics_events' created successfully.");

        // Optional: Create index for faster querying
        await sql`CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(date);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);`;

        console.log("✅ Indexes created.");

    } catch (err) {
        console.error("❌ Schema setup failed:", err);
    } finally {
        await sql.end();
    }
}

setupSchema();
