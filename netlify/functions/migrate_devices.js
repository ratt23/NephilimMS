import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, {
    ssl: 'require'
});

export const handler = async (event) => {
    try {
        console.log('Creating device_status table...');

        await sql`
            CREATE TABLE IF NOT EXISTS device_status (
                device_id TEXT PRIMARY KEY,
                last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                browser_info TEXT,
                current_slide TEXT,
                ip_address TEXT,
                status TEXT DEFAULT 'offline',
                refresh_trigger BOOLEAN DEFAULT FALSE
            );
        `;

        console.log('device_status table created successfully.');
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Migration successful' })
        };
    } catch (error) {
        console.error('Migration failed:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Migration failed', error: error.message })
        };
    }
};
