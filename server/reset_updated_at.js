
import 'dotenv/config';
import sql from './db.js';

async function resetTimestamps() {
    try {
        console.log('Resetting updated_at for all doctors to 7 days ago...');
        const result = await sql`
            UPDATE doctors 
            SET updated_at = NOW() - INTERVAL '7 days'
        `;
        console.log(`✅ Success: Updated ${result.count} doctors.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Reset failed:', error);
        process.exit(1);
    }
}

resetTimestamps();
