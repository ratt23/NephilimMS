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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=300'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const path = event.path || '';
    console.log(`[DOCTORS] ${event.httpMethod} ${path}`);

    try {
        // ROUTE: /doctors/grouped
        // Logic matched from original getDoctors.js to ensure schema compatibility
        if (path.endsWith('/grouped')) {
            const doctors = await sql`
        SELECT 
            d.id, 
            d.name, 
            d.specialty, 
            d.schedule, 
            d.image_url, 
            s.image_url AS image_url_sstv 
        FROM 
            doctors d
        LEFT JOIN 
            sstv_images s ON d.id = s.doctor_id
        ORDER BY 
            d.name
      `;

            const doctorsData = {};
            for (const doc of doctors) {
                const specialtyKey = createKey(doc.specialty);
                if (!doctorsData[specialtyKey]) {
                    doctorsData[specialtyKey] = {
                        title: doc.specialty,
                        doctors: []
                    };
                }
                doctorsData[specialtyKey].doctors.push({
                    name: doc.name,
                    image_url: doc.image_url,
                    image_url_sstv: doc.image_url_sstv,
                    schedule: doc.schedule
                });
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(doctorsData)
            };
        }

        // ROUTE: /doctors/on-leave
        // Logic matched from api.js to ensure schema compatibility
        if (path.endsWith('/on-leave')) {
            const leaves = await sql`
        SELECT 
          l.id, l.start_date, l.end_date, l.reason,
          d.name as doctor_name, d.image_url, d.specialty
        FROM leaves l
        JOIN doctors d ON l.doctor_id = d.id
        WHERE l.status = 'approved' 
        AND l.end_date >= CURRENT_DATE
        ORDER BY l.start_date ASC
      `;

            // Map image_url to photo_url if frontend expects it
            const mappedLeaves = leaves.map(l => ({
                ...l,
                photo_url: l.image_url
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(mappedLeaves)
            };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Endpoint not found', path })
        };

    } catch (error) {
        console.error('[DOCTORS] Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    }
}

// Helper
function createKey(name) {
    if (typeof name !== 'string') return '';
    return name.toLowerCase()
        .replace(/spesialis|sub|dokter|gigi|&/g, '')
        .replace(/,/g, '')
        .replace(/\(|\)/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}
