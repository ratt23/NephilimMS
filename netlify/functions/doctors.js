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
        if (path.endsWith('/grouped')) {
            // Fetch all doctors from MAIN database (JadwalDokter)
            // We join doctors with their schedules to determine status properly if needed,
            // but the original request was just for doctors list grouped by specialty.

            // Query adapted from original getDoctors.js logic
            const doctors = await sql`
        SELECT 
          d.id, d.name, d.specialty, d.sub_specialty, d.photo_url, d.status,
          s.day, s.start_time, s.end_time, s.quota, s.is_active
        FROM doctors d
        LEFT JOIN schedules s ON d.id = s.doctor_id
        WHERE d.is_active = true
      `;

            // Grouping logic
            const grouped = {};

            doctors.forEach(doc => {
                const key = createKey(doc.specialty);
                if (!grouped[key]) {
                    grouped[key] = {
                        name: doc.specialty,
                        doctors: []
                    };
                }

                let existingDoc = grouped[key].doctors.find(d => d.id === doc.id);
                if (!existingDoc) {
                    existingDoc = {
                        id: doc.id,
                        name: doc.name,
                        specialty: doc.specialty,
                        sub_specialty: doc.sub_specialty,
                        photo_url: doc.photo_url,
                        status: doc.status,
                        schedules: []
                    };
                    grouped[key].doctors.push(existingDoc);
                }

                if (doc.day) {
                    existingDoc.schedules.push({
                        day: doc.day,
                        time: `${doc.start_time} - ${doc.end_time}`,
                        quota: doc.quota,
                        active: doc.is_active
                    });
                }
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(grouped)
            };
        }

        // ROUTE: /doctors/on-leave
        if (path.endsWith('/on-leave')) {
            const leaves = await sql`
        SELECT 
          l.id, l.start_date, l.end_date, l.reason,
          d.name as doctor_name, d.photo_url, d.specialty
        FROM leaves l
        JOIN doctors d ON l.doctor_id = d.id
        WHERE l.status = 'approved' 
        AND l.end_date >= CURRENT_DATE
        ORDER BY l.start_date ASC
      `;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(leaves)
            };
        }

        // Default: Not Found
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

// Helper from api.js
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
