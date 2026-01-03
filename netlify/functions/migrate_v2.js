import postgres from 'postgres';
const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export async function handler(event, context) {
    try {
        // 1. Alter posts table
        await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS category VARCHAR(50)`;
        await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT`;

        // 2. Create app_settings table for AdSense and other configs
        await sql`
      CREATE TABLE IF NOT EXISTS app_settings (
        setting_key VARCHAR(50) PRIMARY KEY,
        setting_value TEXT,
        is_enabled BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

        // 3. Insert default settings if not exist
        await sql`
      INSERT INTO app_settings (setting_key, setting_value, is_enabled)
      VALUES 
        ('adsense_script', '', false),
        ('show_ads_on_article', 'true', true),
        ('show_ads_on_newsletter', 'false', false)
      ON CONFLICT (setting_key) DO NOTHING
    `;

        return { statusCode: 200, body: JSON.stringify({ message: 'Migration V2 successful' }) };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
}
