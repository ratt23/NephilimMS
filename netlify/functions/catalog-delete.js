
import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export async function handler(event, context) {
    if (event.httpMethod !== 'POST') { // Using POST for delete actions is safer sometimes, or DELETE method
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { id } = JSON.parse(event.body);

        if (!id) {
            return { statusCode: 400, body: 'Missing ID' };
        }

        await sql`
      DELETE FROM catalog_items WHERE id = ${id}
    `;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Item deleted' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}
