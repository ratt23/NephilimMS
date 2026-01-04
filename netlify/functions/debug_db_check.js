import postgres from 'postgres';
const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export async function handler(event, context) {
    try {
        const settings = await sql`SELECT * FROM app_settings`;
        return {
            statusCode: 200,
            body: JSON.stringify(settings)
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: e.toString(), stack: e.stack })
        };
    }
}
