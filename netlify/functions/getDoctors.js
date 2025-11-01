import postgres from 'postgres';

// 1. Koneksi ke database Neon
const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

/**
 * Helper untuk membuat key dari nama spesialisasi
 * (cth: "Spesialis Anak" -> "anak")
 * Pastikan logika ini SAMA PERSIS dengan yang ada di script.js publik Anda.
 */
function createKey(name) {
    if (typeof name !== 'string') return ''; // Safety check
    return name.toLowerCase()
        .replace(/spesialis|sub|dokter|gigi|&/g, '')
        .replace(/,/g, '') // Hapus koma
        .replace(/\(|\)/g, '') // Hapus kurung
        .trim()
        .replace(/\s+/g, '-') // Ganti spasi dengan strip
        .replace(/[^a-z0-9-]/g, ''); // Hapus karakter non-alfanumerik
}

export async function handler(event, context) {
  /**
   * 2. Header CORS (Cross-Origin Resource Sharing)
   * Ini adalah bagian PENTING untuk mengizinkan domain publik Anda
   * mengakses API ini.
   */
  const headers = {
    'Access-Control-Allow-Origin': '*', // <-- GANTI DENGAN URL PUBLIK ANDA SAAT DEPLOY
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json'
  };

  try {
    // 3. Ambil data dari database
    const doctors = await sql`SELECT * FROM doctors ORDER BY name`;

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
      
      // Masukkan data dokter
      doctorsData[specialtyKey].doctors.push({
        name: doc.name,
        image: doc.image_url,
        schedule: doc.schedule 
      });
    }

    // 5. Kirim data
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(doctorsData)
    };

  } catch (error) {
    console.error("getDoctors Error:", error);
    return { 
      statusCode: 500, 
      headers: headers, // Kirim header bahkan saat error
      body: JSON.stringify({ error: 'Gagal mengambil data dokter' }) 
    };
  }
}