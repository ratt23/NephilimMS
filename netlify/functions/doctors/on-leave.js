// Standalone function for /doctors/on-leave endpoint
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
        'http://localhost:5173'
    ];

    const headers = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '*',
        'Access-Control-Allow-Methods': 'GET',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600, s-maxage=600'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const todayWIT = sql`(NOW() AT TIME ZONE 'Asia/Jayapura')::date`;
        const leaveData = await sql`
      SELECT 
        t1.start_date,
        t1.end_date,
        t2.name AS doctor_name 
      FROM 
        leave_data t1
      JOIN 
        doctors t2 ON t1.doctor_id = t2.id
      WHERE 
        t1.end_date >= ${todayWIT}
      ORDER BY
        t1.start_date ASC
    `;

        const formattedLeaveData = leaveData.map(leave => ({
            "NamaDokter": leave.doctor_name,
            "TanggalMulaiCuti": new Date(leave.start_date).toLocaleDateString('en-GB').replace(/\//g, '-'),
            "TanggalSelesaiCuti": new Date(leave.end_date).toLocaleDateString('en-GB').replace(/\//g, '-')
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(formattedLeaveData)
        };
    } catch (error) {
        console.error("on-leave Error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch leave data' })
        };
    }
}
