import { serialize } from 'cookie';

// Ambil password dari Netlify Environment Variables
// (yang Anda atur di file .env atau di dashboard Netlify)
const ADMIN_PASSWORD = process.env.DASHBOARD_PASS; 

export async function handler(event, context) {
  // 1. Hanya izinkan metode POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 2. Ambil password dari body request
    const { password } = JSON.parse(event.body);

    // 3. Cek password
    if (password === ADMIN_PASSWORD) {
      // 4. Jika BENAR, buat cookie
      const authCookie = serialize('nf_auth', 'true', { 
        //
        // === PERBAIKAN ADA DI SINI ===
        // httpOnly: true, // <-- Baris ini dihapus/dikomentari
        // Kita hapus 'httpOnly' agar cookie bisa dibaca
        // oleh JavaScript (js-cookie) di sisi frontend (React).
        //
        secure: true,   // Hanya kirim via HTTPS (saat di-deploy)
        sameSite: 'strict', // Batasi cookie hanya untuk domain ini
        path: '/',
        maxAge: 60 * 60 * 24, // Masa berlaku cookie: 1 hari
      });

      // 5. Kirim balasan "OK" dengan header untuk SET-COOKIE
      return {
        statusCode: 200,
        headers: {
          'Set-Cookie': authCookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ success: true, message: 'Login berhasil' }),
      };
    } else {
      // 6. Jika SALAH, kirim error
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: 'Password salah' }),
      };
    }
  } catch (error) {
    console.error("Login function error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
}