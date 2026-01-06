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
    'Cache-Control': 'public, max-age=600, s-maxage=600' // Cache 10 menit (browser & CDN)
  };

  try {
    // ===================================
    // ===  PERBAIKAN LOGIKA CUTI (WIT) ===
    // ===================================
    // Tentukan "hari ini" berdasarkan zona waktu WIT (Asia/Jayapura)
    const todayWIT = sql`(NOW() AT TIME ZONE 'Asia/Jayapura')::date`;

    // 3. Ambil data cuti yang belum selesai
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
            -- Tampilkan semua cuti yang tanggal selesainya hari ini ATAU di masa depan
            t1.end_date >= ${todayWIT}
        ORDER BY
            t1.start_date ASC -- Urutkan dari yang paling dekat
    `;
    // ===================================

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