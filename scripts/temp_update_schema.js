import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

if (!process.env.NEON_DATABASE_URL) {
    console.error('NEON_DATABASE_URL is missing');
    process.exit(1);
}

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

async function run() {
    console.log('Running schema update for common_name...');
    try {
        await sql`ALTER TABLE radiology_prices ADD COLUMN IF NOT EXISTS common_name VARCHAR(255)`;
        console.log('Done.');
    } catch (e) {
        console.error(e);
    } finally {
        await sql.end();
    }
}

run();
