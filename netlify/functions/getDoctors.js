import postgres from 'postgres';

// 1. Koneksi ke database Neon
const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

/**
 * Helper untuk membuat key dari nama spesialisasi
 */
function createKey(name) {
  if (typeof name !== 'string') return ''; // Safety check
  return name.toLowerCase()
    .replace(/\b(spesialis|sub|dokter)\b/g, '') // Hapus kata spesifik (whole word)
    .replace(/&/g, '')
    .replace(/,/g, '') // Hapus koma
    .replace(/\(|\)/g, '') // Hapus kurung
    .trim()
    .replace(/\s+/g, '-') // Ganti spasi dengan strip
    .replace(/[^a-z0-9-]/g, ''); // Hapus karakter non-alfanumerik
}

export async function handler(event, context) {
  /**
   * 2. Header CORS & Cache-Control
   */
  const headers = {
    'Access-Control-Allow-Origin': '*', // Ganti '*' dengan URL publik Anda saat deploy
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300, s-maxage=300' // Cache 5 menit (browser & CDN)
  };

  try {
    // 3. Ambil data dokter, GABUNGKAN (LEFT JOIN) dengan tabel sstv_images
    const doctors = await sql`
        SELECT 
            d.id, 
            d.name, 
            d.specialty, 
            d.schedule, 
            d.image_url, 
            d.updated_at,
            s.image_url AS image_url_sstv 
        FROM 
            doctors d
        LEFT JOIN 
            sstv_images s ON d.id = s.doctor_id
        ORDER BY 
            d.name
    `;

    // 4. Ubah data "flat" menjadi format JSON yang dikelompokkan
    const doctorsData = {};

    for (const doc of doctors) {
      const specialtyKey = createKey(doc.specialty);

      if (!doctorsData[specialtyKey]) {
        doctorsData[specialtyKey] = {
          title: doc.specialty,
          doctors: []
        };
      }

      // 5. Masukkan data dokter (sekarang termasuk image_url_sstv)
      doctorsData[specialtyKey].doctors.push({
        name: doc.name,
        image_url: doc.image_url, // Foto untuk web publik
        image_url_sstv: doc.image_url_sstv, // Foto untuk SSTV
        schedule: doc.schedule,
        updated_at: doc.updated_at
      });
    }

    // 6. Kirim data
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(doctorsData)
    };

  } catch (error) {
    console.error("getDoctors Error:", error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: 'Gagal mengambil data dokter' })
    };
  }
}