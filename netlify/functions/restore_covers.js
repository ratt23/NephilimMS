import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export const handler = async () => {
    try {
        console.log('Restoring real category covers...');

        const correctCovers = JSON.stringify({
            'tarif-kamar': '/asset/categories/tarif_kamar.png',
            'fasilitas': '/asset/categories/fasilitas.png',
            'radiology': '/asset/categories/radiology.png',
            'layanan-unggulan': '/asset/categories/layanan_unggulan.png',
            'contact-person': '/asset/categories/contact_person.png'
        });

        await sql`
            INSERT INTO app_settings (setting_key, setting_value, is_enabled, updated_at)
            VALUES ('category_covers', ${correctCovers}, true, NOW())
            ON CONFLICT (setting_key) 
            DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW();
        `;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Covers RESTORED to PNG assets', covers: correctCovers })
        };
    } catch (e) {
        console.error('Restore Failed:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: e.message })
        };
    }
};
