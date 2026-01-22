import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export const handler = async () => {
    try {
        console.log('Starting DB Repair...');

        // 1. Posts Table Fixes
        console.log('Fixing posts table...');
        await sql`CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY)`; // Ensure exists
        await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS title VARCHAR(255)`;
        await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug VARCHAR(255)`;
        await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS content TEXT`;
        await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt TEXT`;
        await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url VARCHAR(255)`;
        await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft'`;
        await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`;
        await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`;

        await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`;
        await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'article'`;
        await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT`;

        // 2. Device Heartbeats
        console.log('Fixing device_heartbeats table...');
        await sql`
            CREATE TABLE IF NOT EXISTS device_heartbeats (
                device_id TEXT PRIMARY KEY
            )
        `;
        // Add columns individually to be safe if table exists
        await sql`ALTER TABLE device_heartbeats ADD COLUMN IF NOT EXISTS friendly_name TEXT`;
        await sql`ALTER TABLE device_heartbeats ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`;
        await sql`ALTER TABLE device_heartbeats ADD COLUMN IF NOT EXISTS ip_address TEXT`;
        await sql`ALTER TABLE device_heartbeats ADD COLUMN IF NOT EXISTS browser_info TEXT`;
        await sql`ALTER TABLE device_heartbeats ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'offline'`;
        await sql`ALTER TABLE device_heartbeats ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE`;
        await sql`ALTER TABLE device_heartbeats ADD COLUMN IF NOT EXISTS current_slide TEXT`;
        await sql`ALTER TABLE device_heartbeats ADD COLUMN IF NOT EXISTS refresh_trigger BOOLEAN DEFAULT FALSE`;
        await sql`ALTER TABLE device_heartbeats ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP`;
        await sql`ALTER TABLE device_heartbeats ADD COLUMN IF NOT EXISTS last_ip TEXT`;
        await sql`ALTER TABLE device_heartbeats ADD COLUMN IF NOT EXISTS device_name TEXT`;

        // 3. Newsletters
        console.log('Fixing newsletters table...');
        await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
        await sql`
            CREATE TABLE IF NOT EXISTS newsletters (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                year SMALLINT,
                month SMALLINT,
                title TEXT,
                description TEXT,
                pdf_url TEXT,
                cloudinary_public_id TEXT,
                published_at DATE DEFAULT CURRENT_DATE,
                is_published BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        console.log('DB Repair Complete');
        return { statusCode: 200, body: 'DB Repaired Successfully' };
    } catch (e) {
        console.error('DB Repair Failed:', e);
        return { statusCode: 500, body: 'Error: ' + e.message };
    }
};
