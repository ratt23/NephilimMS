
import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export const handler = async () => {
    try {
        console.log('Patching category_covers in app_settings...');

        // 1. Get current setting
        const rows = await sql`SELECT setting_value FROM app_settings WHERE setting_key = 'category_covers'`;

        let currentCovers = {};
        if (rows.length > 0) {
            try {
                currentCovers = JSON.parse(rows[0].setting_value);
            } catch (e) {
                console.warn('Failed to parse existing covers:', e);
            }
        }

        // 2. Define defaults
        const defaults = {
            'tarif-kamar': '/asset/categories/placeholder.svg',
            'fasilitas': '/asset/categories/placeholder.svg',
            'radiology': '/asset/categories/placeholder.svg',
            'layanan-unggulan': '/asset/categories/placeholder.svg',
            'contact-person': '/asset/categories/placeholder.svg'
        };

        // 3. Merge (Defaults have lower priority than existing, BUT we ensure keys exist)
        // Actually, we want to ensure every key in 'defaults' exists in 'final'
        const finalCovers = { ...currentCovers };

        for (const [key, val] of Object.entries(defaults)) {
            if (!finalCovers[key]) {
                finalCovers[key] = val;
                console.log(`Adding missing key: ${key}`);
            }
        }

        // 4. Update DB
        const jsonStr = JSON.stringify(finalCovers);
        await sql`
            INSERT INTO app_settings (setting_key, setting_value, updated_at, is_enabled)
            VALUES ('category_covers', ${jsonStr}, NOW(), true)
            ON CONFLICT (setting_key) 
            DO UPDATE SET setting_value = ${jsonStr}, updated_at = NOW()
        `;

        console.log('Patch successful.');
        return { statusCode: 200, body: JSON.stringify({ message: 'Covers updated', covers: finalCovers }) };

    } catch (e) {
        console.error('Patch failed:', e);
        return { statusCode: 500, body: 'Error: ' + e.message };
    }
};
