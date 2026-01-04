import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Manual .env parser for standalone execution
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value) {
                let val = value.join('=').trim();
                // Strip quotes if present
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1);
                }
                process.env[key.trim()] = val;
            }
        });
        console.log('Environment variables loaded from .env');
    }
} catch (e) {
    console.warn('Could not load .env file', e);
}

const sql = postgres(process.env.NEON_DATABASE_URL, {
    ssl: 'require'
});

async function runMigration() {
    try {
        console.log('Creating daily_stats table...');
        await sql`
            CREATE TABLE IF NOT EXISTS daily_stats (
                date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
                page_views INTEGER DEFAULT 0,
                visitors INTEGER DEFAULT 0
            );
        `;
        console.log('✅ daily_stats table created successfully.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await sql.end();
    }
}

runMigration();
