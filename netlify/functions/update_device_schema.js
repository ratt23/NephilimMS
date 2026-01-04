import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, {
    ssl: 'require'
});

export const handler = async (event) => {
    try {
        console.log('Updating device_status schema...');

        // Add friendly_name column
        await sql`
            ALTER TABLE device_status 
            ADD COLUMN IF NOT EXISTS friendly_name TEXT;
        `;

        // Add is_pinned column
        await sql`
            ALTER TABLE device_status 
            ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
        `;

        console.log('Schema updated successfully.');
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Schema update successful' })
        };
    } catch (error) {
        console.error('Schema update failed:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Schema update failed', error: error.message })
        };
    }
};
