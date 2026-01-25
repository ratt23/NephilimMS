import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export const handler = async () => {
    try {
        console.log('Resetting eCatalog Categories...');

        const defaultCategories = JSON.stringify([
            { id: 'tarif-kamar', label: 'Tarif Kamar' },
            { id: 'fasilitas', label: 'Fasilitas' },
            { id: 'radiology', label: 'Cek Harga Radiologi' },
            { id: 'layanan-unggulan', label: 'Layanan Unggulan' },
            { id: 'contact-person', label: 'Contact Person' }
        ]);

        await sql`
            INSERT INTO app_settings (setting_key, setting_value, is_enabled, updated_at)
            VALUES ('ecatalog_categories', ${defaultCategories}, true, NOW())
            ON CONFLICT (setting_key) 
            DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW();
        `;

        // Also ensure visibility is all true
        const defaultVisibility = JSON.stringify({
            'tarif-kamar': true,
            'fasilitas': true,
            'radiology': true,
            'layanan-unggulan': true,
            'contact-person': true
        });

        await sql`
             INSERT INTO app_settings (setting_key, setting_value, is_enabled, updated_at)
            VALUES ('category_visibility', ${defaultVisibility}, true, NOW())
            ON CONFLICT (setting_key) 
            DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW();
        `;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Categories Reset Successfully' })
        };
    } catch (e) {
        console.error('Reset Failed:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: e.message })
        };
    }
};
