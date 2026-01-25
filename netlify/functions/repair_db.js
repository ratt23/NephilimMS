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

        // 3. Radiology Prices
        console.log('Fixing radiology_prices table...');
        await sql`
            CREATE TABLE IF NOT EXISTS radiology_prices (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                common_name VARCHAR(255),
                category VARCHAR(100),
                price NUMERIC(15, 2) DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;
        // Ensure columns exist (in case table already existed)
        await sql`ALTER TABLE radiology_prices ADD COLUMN IF NOT EXISTS name VARCHAR(255)`;
        await sql`ALTER TABLE radiology_prices ADD COLUMN IF NOT EXISTS common_name VARCHAR(255)`;
        await sql`ALTER TABLE radiology_prices ADD COLUMN IF NOT EXISTS category VARCHAR(100)`;
        await sql`ALTER TABLE radiology_prices ADD COLUMN IF NOT EXISTS price NUMERIC(15, 2) DEFAULT 0`;
        await sql`ALTER TABLE radiology_prices ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`;

        // 4. Newsletters
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

        // 5. OPTIMIZATION / DSA (Indexes)
        console.log('Applying DSA Optimizations (Indexes)...');

        // Enable Trigram for fuzzy search (if available on Neon)
        try {
            await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;
            console.log('pg_trgm extension enabled.');
        } catch (e) {
            console.warn('Could not enable pg_trgm (might lack permissions), falling back to standard indexes.');
        }

        // Radiology Optimization
        await sql`CREATE INDEX IF NOT EXISTS idx_radiology_category ON radiology_prices (category)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_radiology_search_clean ON radiology_prices (REPLACE(name, '-', ''))`;
        await sql`CREATE INDEX IF NOT EXISTS idx_radiology_common_clean ON radiology_prices (REPLACE(common_name, '-', ''))`;

        // Doctors Optimization
        // Check if table exists first to avoid error if script runs on fresh DB before doctors table creation
        try {
            await sql`CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty)`;
            // Trigram index for ILIKE query performance
            await sql`CREATE INDEX IF NOT EXISTS idx_doctors_name_trgm ON doctors USING gin (name gin_trgm_ops)`;
        } catch (e) { console.log('Skipping doctors index (table might not exist yet)'); }

        // Leave Data Optimization
        try {
            await sql`CREATE INDEX IF NOT EXISTS idx_leave_dates ON leave_data(start_date, end_date)`;
            await sql`CREATE INDEX IF NOT EXISTS idx_leave_doctor_id ON leave_data(doctor_id)`;
        } catch (e) { console.log('Skipping leave_data index (table might not exist yet)'); }

        console.log('DB Repair Complete');
        return { statusCode: 200, body: 'DB Repaired Successfully' };
    } catch (e) {
        console.error('DB Repair Failed:', e);
        return { statusCode: 500, body: 'Error: ' + e.message };
    }
};
