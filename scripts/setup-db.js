import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

async function migrate() {
    console.log('🔄 Starting Database Migration...');

    try {
        // 1. Doctors Table
        await sql`
            CREATE TABLE IF NOT EXISTS doctors (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                specialty VARCHAR(255) NOT NULL,
                image_url TEXT,
                schedule JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                sort_order INTEGER DEFAULT 0
            );
        `;
        console.log('✅ Table "doctors" checked/created.');

        // 2. SSTV Images (Linked to Doctors)
        await sql`
            CREATE TABLE IF NOT EXISTS sstv_images (
                id SERIAL PRIMARY KEY,
                doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
                image_url TEXT NOT NULL
            );
        `;
        console.log('✅ Table "sstv_images" checked/created.');

        // 3. Leave Data
        await sql`
            CREATE TABLE IF NOT EXISTS leave_data (
                id SERIAL PRIMARY KEY,
                doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('✅ Table "leave_data" checked/created.');

        // 4. Newsletters
        await sql`
            CREATE TABLE IF NOT EXISTS newsletters (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                pdf_url TEXT NOT NULL,
                thumbnail_url TEXT,
                status VARCHAR(50) DEFAULT 'draft',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                published_at TIMESTAMP WITH TIME ZONE
            );
        `;
        console.log('✅ Table "newsletters" checked/created.');

        // 5. Analytics Events
        await sql`
            CREATE TABLE IF NOT EXISTS analytics_events (
                id SERIAL PRIMARY KEY,
                event_type VARCHAR(100),
                path VARCHAR(255),
                details JSONB,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('✅ Table "analytics_events" checked/created.');

        // 6. Daily Stats
        await sql`
            CREATE TABLE IF NOT EXISTS daily_stats (
                date DATE PRIMARY KEY,
                views INTEGER DEFAULT 0,
                visitors INTEGER DEFAULT 0,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('✅ Table "daily_stats" checked/created.');

        // 7. Popup Ads
        await sql`
            CREATE TABLE IF NOT EXISTS popup_ads (
                id SERIAL PRIMARY KEY,
                image_url TEXT NOT NULL,
                link_url TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('✅ Table "popup_ads" checked/created.');

        // 8. Settings & Promo Images
        await sql`
             CREATE TABLE IF NOT EXISTS settings (
                key VARCHAR(100) PRIMARY KEY,
                value JSONB
            );
        `;
        await sql`
             CREATE TABLE IF NOT EXISTS promo_images (
                 id SERIAL PRIMARY KEY,
                 url TEXT NOT NULL,
                 caption TEXT,
                 sort_order INTEGER DEFAULT 0
            );
        `;
        console.log('✅ Tables "settings" & "promo_images" checked/created.');

        console.log('🎉 Migration Complete! Database is ready.');

    } catch (error) {
        console.error('❌ Migration Failed:', error);
    } finally {
        await sql.end();
    }
}

migrate();
