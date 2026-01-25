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
    try {
        const result = await sql`SELECT count(*) FROM radiology_prices`;
        console.log(`Row count: ${result[0].count}`);

        const sample = await sql`SELECT * FROM radiology_prices LIMIT 3`;
        console.log('Sample data:', sample);
    } catch (e) {
        console.error(e);
    } finally {
        await sql.end();
    }
}

run();
