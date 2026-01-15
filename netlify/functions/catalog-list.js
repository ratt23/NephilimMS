
import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export async function handler(event, context) {
    try {
        const { category } = event.queryStringParameters || {};

        let items;
        if (category) {
            items = await sql`
        SELECT * FROM catalog_items 
        WHERE category = ${category} AND is_active = true
        ORDER BY sort_order ASC, created_at DESC
      `;
        } else {
            items = await sql`
        SELECT * FROM catalog_items 
        WHERE is_active = true
        ORDER BY category ASC, sort_order ASC, created_at DESC
      `;
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify(items)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}
