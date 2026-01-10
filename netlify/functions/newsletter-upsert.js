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
        'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Auth required
    const authError = checkAuth(event);
    if (authError) return { ...authError, headers };

    try {
        const data = JSON.parse(event.body);
        const { year, month, title, description, pdf_url, cloudinary_public_id } = data;

        // Validation
        if (!year || !month || !title || !pdf_url) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'Year, month, title, and PDF URL are required' })
            };
        }

        // Check year/month validity
        const yearInt = parseInt(year);
        const monthInt = parseInt(month);

        if (yearInt < 2000 || yearInt > 2100 || monthInt < 1 || monthInt > 12) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'Invalid year or month' })
            };
        }

        // Generate UUID explicitly (database default might not work in all environments)
        const id = crypto.randomUUID();

        // UPSERT: Insert or update based on year+month unique constraint
        const [newsletter] = await sql`
      INSERT INTO newsletters (
        id,
        year, 
        month, 
        title, 
        description, 
        pdf_url, 
        cloudinary_public_id,
        created_at,
        updated_at,
        published_at,
        is_published
      )
      VALUES (
        ${id},
        ${yearInt}, 
        ${monthInt}, 
        ${title}, 
        ${description || ''}, 
        ${pdf_url}, 
        ${cloudinary_public_id || ''},
        NOW(),
        NOW(),
        CURRENT_DATE,
        TRUE
      )
      ON CONFLICT (year, month)
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        pdf_url = EXCLUDED.pdf_url,
        cloudinary_public_id = EXCLUDED.cloudinary_public_id,
        updated_at = NOW()
      RETURNING *
    `;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(newsletter)
        };

    } catch (error) {
        console.error('Newsletter upsert error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Server error', error: error.message })
        };
    }
}
