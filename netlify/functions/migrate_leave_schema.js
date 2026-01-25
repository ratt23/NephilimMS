import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export const handler = async () => {
    try {
        console.log('Running Leave Schema Migration...');

        // Add reason column
        await sql`
            ALTER TABLE leave_data 
            ADD COLUMN IF NOT EXISTS reason TEXT;
        `;

        // Add created_at column
        await sql`
            ALTER TABLE leave_data 
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        `;

        console.log('Migration Complete: reason column added.');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Migration successful: leave_data.reason added' })
        };
    } catch (e) {
        console.error('Migration Failed:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: e.message })
        };
    }
};
