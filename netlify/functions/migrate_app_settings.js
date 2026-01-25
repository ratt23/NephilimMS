import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export const handler = async () => {
    try {
        console.log('Running App Settings Migration...');

        // 1. Create table if not exists
        await sql`
            CREATE TABLE IF NOT EXISTS app_settings (
                setting_key TEXT PRIMARY KEY,
                setting_value TEXT,
                is_enabled BOOLEAN DEFAULT true,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;

        // 2. Seed initial data (optional)
        // Check if popup_ad_active exists
        await sql`
            INSERT INTO app_settings (setting_key, setting_value, is_enabled, updated_at)
            VALUES ('popup_ad_active', 'true', true, NOW())
            ON CONFLICT (setting_key) DO NOTHING;
        `;

        // Check if popup_ad_images exists
        await sql`
            INSERT INTO app_settings (setting_key, setting_value, is_enabled, updated_at)
            VALUES ('popup_ad_images', '[]', true, NOW())
            ON CONFLICT (setting_key) DO NOTHING;
        `;

        console.log('Migration Complete: app_settings checked/created.');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Migration successful: app_settings' })
        };
    } catch (e) {
        console.error('Migration Failed:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: e.message })
        };
    }
};
