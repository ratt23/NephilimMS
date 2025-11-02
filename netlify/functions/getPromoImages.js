import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Ganti '*' dengan URL publik Anda
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, must-revalidate' // Selalu ambil data baru
  };

  try {
    // --- PERUBAHAN DI SINI ---
    // Mengurutkan berdasarkan ID secara DESCENDING (terbaru ke terlama)
    const promos = await sql`SELECT id, image_url, alt_text FROM promo_images ORDER BY id DESC`;
    
    // Ubah format agar sesuai dengan yang diharapkan SSTV
    const formattedPromos = promos.map(p => ({
        id: p.id,
        imageUrl: p.image_url,
        altText: p.alt_text || 'Promo'
    }));

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(formattedPromos)
    };

  } catch (error) {
    console.error("getPromoImages Error:", error);
    return { 
      statusCode: 500, 
      headers: headers,
      body: JSON.stringify({ error: 'Gagal mengambil data promo' }) 
    };
  }
}