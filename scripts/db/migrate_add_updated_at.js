
import 'dotenv/config';
import sql from './db.js';

async function migrate() {
    try {
        console.log('Adding updated_at column to doctors table...');
        await sql`
            ALTER TABLE doctors 
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        `;
        console.log('✅ Migration successful: updated_at column added.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
