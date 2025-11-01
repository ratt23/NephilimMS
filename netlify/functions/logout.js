// netlify/functions/logout.js
import { serialize } from 'cookie';

export async function handler(event, context) {
  // Buat cookie yang sama, tapi atur 'maxAge' ke -1 (langsung kedaluwarsa)
  const authCookie = serialize('nf_auth', 'expired', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: -1, // <-- Ini akan menghapus cookie
  });

  return {
    statusCode: 200,
    headers: {
      'Set-Cookie': authCookie,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ success: true, message: 'Logout berhasil' }),
  };
}