import postgres from 'postgres';

export async function handler(event, context) {
    if (!process.env.NEON_DATABASE_URL) {
        return { statusCode: 500, body: 'No DB URL configured' };
    }

    const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

    try {
        // Check if contact_person column exists
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'ecatalog_items'
        `;

        const hasContactPerson = columns.some(col => col.column_name === 'contact_person');

        if (!hasContactPerson) {
            // Add contact_person column
            await sql`
                ALTER TABLE ecatalog_items 
                ADD COLUMN contact_person TEXT DEFAULT ''
            `;

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Successfully added contact_person column to ecatalog_items table',
                    added: true
                })
            };
        } else {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'contact_person column already exists',
                    added: false
                })
            };
        }
    } catch (err) {
        console.error('Migration error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Migration failed',
                error: err.message
            })
        };
    }
}
