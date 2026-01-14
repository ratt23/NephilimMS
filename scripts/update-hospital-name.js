const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

async function updateHospitalName() {
    try {
        console.log('🔄 Updating hospital_name in database...');

        // Update the value
        const result = await sql`
            UPDATE settings 
            SET value = 'RSU Siloam Ambon'
            WHERE key = 'hospital_name'
        `;

        console.log('✅ Update successful!');

        // Verify the update
        const check = await sql`
            SELECT key, value 
            FROM settings 
            WHERE key = 'hospital_name'
        `;

        if (check.length > 0) {
            console.log('\n📋 Current value in database:');
            console.log(`   ${check[0].key} = "${check[0].value}"`);
        }

        console.log('\n✨ Done! Refresh your eCatalog to see the changes.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

updateHospitalName();
