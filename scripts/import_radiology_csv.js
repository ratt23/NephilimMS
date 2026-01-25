import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

if (!process.env.NEON_DATABASE_URL) {
    console.error('NEON_DATABASE_URL is missing');
    process.exit(1);
}

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

async function run() {
    console.log('Reading CSV...');
    const csvPath = path.join(__dirname, '../excel/list_harga_radiologi_awam_detail_referensi.csv');
    const csvFile = fs.readFileSync(csvPath, 'utf8');

    Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            const rows = results.data;
            console.log(`Found ${rows.length} rows.`);

            try {
                // Determine if we should clear table first. 
                // User said "masukan semua", usually implies a full load.
                // Let's truncate to ensure no duplicates from previous tests.
                console.log('Truncating radiology_prices...');
                await sql`TRUNCATE TABLE radiology_prices RESTART IDENTITY`;

                console.log('Inserting data...');

                // Batch insert in chunks of 50 to look nice
                const chunkSize = 50;
                for (let i = 0; i < rows.length; i += chunkSize) {
                    const chunk = rows.slice(i, i + chunkSize);

                    const values = chunk.map(row => {
                        return {
                            name: row['nama pemeriksaan'] || '',
                            common_name: row['nama awam'] || '',
                            category: row['katerogi'] || 'General', // Handle typo in CSV header
                            price: parseFloat((row['Harga'] || '0').toString().replace(/[^0-9.-]+/g, "")) || 0,
                            is_active: true
                        };
                    }).filter(v => v.name); // Filter empty names

                    if (values.length > 0) {
                        await sql`
                            INSERT INTO radiology_prices ${sql(values, 'name', 'common_name', 'category', 'price', 'is_active')}
                        `;
                    }
                    process.stdout.write('.');
                }

                console.log('\nImport complete!');
            } catch (err) {
                console.error('\nError importing:', err);
            } finally {
                await sql.end();
            }
        },
        error: (err) => {
            console.error('CSV Parse Error:', err);
            sql.end();
        }
    });
}

run();
