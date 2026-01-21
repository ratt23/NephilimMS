// Standalone settings function with CORS
import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';
    const allowedOrigins = [
        'https://shab.web.id',
        'https://jadwaldoktershab.netlify.app',
        'https://dashdev1.netlify.app',
        'https://dashdev2.netlify.app',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:8888'
    ];

    const headers = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '*',
        'Access-Control-Allow-Methods': 'GET',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=300'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // GET all settings
        const settings = await sql`SELECT * FROM app_settings`;

        const settingsMap = {};
        for (const s of settings) {
            settingsMap[s.setting_key] = {
                value: s.setting_value,
                enabled: s.is_enabled
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(settingsMap)
        };
    } catch (error) {
        console.error("settings Error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch settings' })
        };
    }
}
