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
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Auth required for all methods
    const authError = checkAuth(event);
    if (authError) return { ...authError, headers };

    try {
        // GET: Retrieve specific newsletter by year & month or by id
        if (event.httpMethod === 'GET') {
            const { year, month, id } = event.queryStringParameters || {};

            if (id) {
                const [newsletter] = await sql`SELECT * FROM newsletters WHERE id = ${id}`;
                if (!newsletter) {
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({ message: 'Newsletter not found' })
                    };
                }
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(newsletter)
                };
            }

            if (year && month) {
                const [newsletter] = await sql`
          SELECT * FROM newsletters 
          WHERE year = ${parseInt(year)} AND month = ${parseInt(month)}
        `;
                if (!newsletter) {
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({ message: 'Newsletter not found' })
                    };
                }
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(newsletter)
                };
            }

            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'Year & month OR id required' })
            };
        }

        // PUT: Toggle publish status
        if (event.httpMethod === 'PUT') {
            const { id } = event.queryStringParameters || {};
            if (!id) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'ID required' })
                };
            }

            const [updated] = await sql`
        UPDATE newsletters 
        SET is_published = NOT is_published
        WHERE id = ${id}
        RETURNING *
      `;

            if (!updated) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ message: 'Newsletter not found' })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(updated)
            };
        }

        // DELETE: Remove newsletter
        if (event.httpMethod === 'DELETE') {
            const { id } = event.queryStringParameters || {};
            if (!id) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'ID required' })
                };
            }

            await sql`DELETE FROM newsletters WHERE id = ${id}`;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'Newsletter deleted successfully' })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: 'Method not allowed' })
        };

    } catch (error) {
        console.error('Newsletter issue error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Server error', error: error.message })
        };
    }
}
