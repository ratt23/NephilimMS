// Standalone function for /doctors/grouped endpoint
import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

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

export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';
    const allowedOrigins = [
        'https://shab.web.id',
        'https://jadwaldoktershab.netlify.app',
        'https://dashdev1.netlify.app',
        'https://dashdev2.netlify.app',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173'
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
    } catch (error) {
        console.error("grouped Error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch doctors data' })
        };
    }
}
