import postgres from 'postgres';

// 1. Koneksi ke database Neon
const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export async function handler(event, context) {
  /**
   * 2. Header CORS & Cache-Control
   */
  const headers = {
    'Access-Control-Allow-Origin': '*', // Ganti '*' dengan URL publik Anda saat deploy
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, must-revalidate' // <-- PERBAIKAN CACHE
  };

  try {
    // 3. Ambil data cuti yang aktif HARI INI
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
            CURRENT_DATE <= t1.end_date AND CURRENT_DATE >= t1.start_date
    `;

    // 4. Ubah format data agar sesuai dengan format script.js (dd-MM-yyyy)
    const formattedLeaveData = leaveData.map(leave => ({
      "NamaDokter": leave.doctor_name,
      "TanggalMulaiCuti": new Date(leave.start_date).toLocaleDateString('en-GB').replace(/\//g, '-'),
      "TanggalSelesaiCuti": new Date(leave.end_date).toLocaleDateString('en-GB').replace(/\//g, '-')
    }));

    // 5. Kirim data
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(formattedLeaveData)
    };

  } catch (error) {
    console.error("getLeaveData Error:", error);
    return { 
      statusCode: 500, 
      headers: headers,
      body: JSON.stringify({ error: 'Gagal mengambil data cuti' }) 
    };
  }
}