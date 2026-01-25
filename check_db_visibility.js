
import postgres from 'postgres';

// Use the same connection string as the app
const sql = postgres(process.env.NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_nYUOg7t6sJFa@ep-divine-queen-a1azjt4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require', { ssl: 'require' });

async function check() {
    try {
        console.log('Checking category_visibility in DB...');
        const rows = await sql`SELECT setting_value FROM app_settings WHERE setting_key = 'category_visibility'`;

        if (rows.length > 0) {
            console.log('Raw Value:', rows[0].setting_value);
            // Parse twice if it's double stringified (common issue)
            let val = rows[0].setting_value;
            try {
                if (typeof val === 'string') val = JSON.parse(val);
                console.log('Parsed Level 1:', val);
            } catch (e) { }
        } else {
            console.log('No setting found for category_visibility');
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await sql.end();
    }
}
check();
