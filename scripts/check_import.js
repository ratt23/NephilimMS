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

        const sample = await sql`SELECT common_name FROM radiology_prices WHERE name = 'PHLEBOGRAPHY RISET' LIMIT 1`;
        console.log('Sample common_name:', sample[0]?.common_name);
    } catch (e) {
        console.error(e);
    } finally {
        await sql.end();
    }
}

run();
