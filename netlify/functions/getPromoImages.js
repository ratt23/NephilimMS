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
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '*', // Ganti '*' dengan URL publik Anda
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=600, s-maxage=600' // Cache 10 menit (browser & CDN)
  };

  try {
    // --- PERUBAHAN DI SINI ---
    // Mengurutkan berdasarkan sort_order ASC (sesuai Promo Manager)
    const promos = await sql`SELECT id, image_url, alt_text FROM promo_images ORDER BY sort_order ASC`;

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