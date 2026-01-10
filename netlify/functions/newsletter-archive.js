import postgres from 'postgres';
import { parse } from 'cookie';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

function checkAuth(event) {
    const cookies = parse(event.headers.cookie || '');
    if (cookies.nf_auth !== 'true') {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Akses ditolak. Silakan login.' }),
        };
    }
    return null;
}

export async function handler(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // PUBLIC endpoint for newsletter archive
    if (event.httpMethod === 'GET') {
        try {
            const { page = '1', limit = '20', admin = 'false' } = event.queryStringParameters || {};

            // Admin can see all, public only sees published
            const isAdmin = admin === 'true';
            if (isAdmin) {
                const authError = checkAuth(event);
                if (authError) return { ...authError, headers };
            }

            const offset = (parseInt(page) - 1) * parseInt(limit);

            let whereClause = isAdmin ? sql`` : sql`WHERE is_published = true`;

            const [countResult] = await sql`
        SELECT COUNT(*) FROM newsletters ${whereClause}
      `;
            const total = parseInt(countResult.count);

            const newsletters = await sql`
        SELECT * FROM newsletters 
        ${whereClause}
        ORDER BY year DESC, month DESC
        LIMIT ${parseInt(limit)} OFFSET ${offset}
      `;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ newsletters, total })
            };

        } catch (error) {
            console.error('Newsletter archive error:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: 'Server error', error: error.message })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: 'Method not allowed' })
    };
}
