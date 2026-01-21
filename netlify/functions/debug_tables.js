
import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export async function handler(event, context) {
    try {
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;
        return {
            statusCode: 200,
            body: JSON.stringify(tables),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}
