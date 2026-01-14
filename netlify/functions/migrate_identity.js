import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export async function handler(event, context) {
    try {
        console.log('Starting Identity Migration...');

        // 2. Insert Default Identity Data
        const defaults = [
            { key: 'hospital_name', value: 'RSU Siloam Ambon', desc: 'Official name of the hospital' },
            { key: 'hospital_short_name', value: 'Siloam Ambon', desc: 'Short display name' },
            { key: 'hospital_tagline', value: 'Emergency & Contact Center', desc: 'Tagline used in headers' },
            { key: 'hospital_phone', value: '1-500-911', desc: 'Main contact phone number' },
            { key: 'hospital_address', value: 'Jl. Sultan Hasanudin, Tantui, Ambon', desc: 'Full physical address' },
            { key: 'hospital_email', value: 'info@siloamhospitals.com', desc: 'Official contact email' },
            // API & Infra Defaults
            { key: 'cors_allowed_origins', value: '*', desc: 'Allowed CORS origins' },
            { key: 'site_url', value: 'https://shab.web.id', desc: 'Base URL for the public website' }
        ];

        let insertedCount = 0;

        for (const item of defaults) {
            // NOTE: Using 'setting_key' and 'setting_value' as per actual DB schema
            const result = await sql`
        INSERT INTO app_settings (setting_key, setting_value, is_enabled)
        VALUES (${item.key}, ${item.value}, true)
        ON CONFLICT (setting_key) DO NOTHING
        RETURNING setting_key;
      `;
            if (result.length > 0) insertedCount++;
        }

        console.log(`Identity Migration Completed. Added ${insertedCount} new keys.`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Identity migration successful",
                added_keys: insertedCount
            }),
        };
    } catch (error) {
        console.error('Migration error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}
