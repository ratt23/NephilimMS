
import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_nYUOg7t6sJFa@ep-divine-queen-a1azjt4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require', { ssl: 'require' });

async function patch() {
    try {
        console.log('Forcing radiology visibility to FALSE...');

        // 1. Get current
        const rows = await sql`SELECT setting_value FROM app_settings WHERE setting_key = 'category_visibility'`;

        let vis = {};
        if (rows.length > 0) {
            vis = JSON.parse(rows[0].setting_value);
        }

        // 2. Update
        vis['radiology'] = false;
        console.log('New state:', vis);

        // 3. Save
        const jsonStr = JSON.stringify(vis);
        await sql`
            UPDATE app_settings 
            SET setting_value = ${jsonStr}, updated_at = NOW()
            WHERE setting_key = 'category_visibility'
        `;

        console.log('Update success.');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await sql.end();
    }
}
patch();
