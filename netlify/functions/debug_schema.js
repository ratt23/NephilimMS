import postgres from 'postgres';

export async function handler(event, context) {
    if (!process.env.NEON_DATABASE_URL) return { statusCode: 500, body: 'No DB URL' };

    const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

    try {
        const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'ecatalog_items'
    `;

        // Also check if table exists
        const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `;

        return {
            statusCode: 200,
            body: JSON.stringify({ tables, columns })
        };
    } catch (err) {
        return { statusCode: 500, body: err.message };
    }
}
