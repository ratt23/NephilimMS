// netlify/functions/api.js
import postgres from 'postgres';
import { parse } from 'cookie';
import { sendLeaveNotification, sendNotification } from './utils/notificationSender.js';

// 1. KONEKSI KE DATABASE
const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

// 2. HELPER AUTENTIKASI
function checkAuth(event) {
  const cookies = parse(event.headers.cookie || '');
  if (cookies.nf_auth !== 'true') {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Akses ditolak. Silakan login.' }),
    };
  }
  return null;
}

// 3. HANDLER UTAMA
export async function handler(event, context) {
  // Cek Autentikasi di awal
  const authError = checkAuth(event);
  if (authError) return authError;

  const method = event.httpMethod;
  const path = event.path.replace('/.netlify/functions/api', '');

  try {
    // ===================================
    // === RUTE MANAJEMEN DOKTER
    // ===================================

    // --- GET /api/doctors (Pagination & Search) ---
    if (method === 'GET' && path === '/doctors') {
      const { page = 1, limit = 30, search = '' } = event.queryStringParameters;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const searchFilter = search
        ? sql`WHERE name ILIKE ${'%' + search + '%'} OR specialty ILIKE ${'%' + search + '%'}`
        : sql``;
      const [countResult] = await sql`SELECT COUNT(*) FROM doctors ${searchFilter}`;
      const total = parseInt(countResult.count);
      const doctors = await sql`
        SELECT * FROM doctors ${searchFilter} ORDER BY name LIMIT ${limit} OFFSET ${offset}
      `;
      return { statusCode: 200, body: JSON.stringify({ doctors, total }) };
    }

    // --- GET /api/doctors/all (Untuk dropdown form cuti) ---
    if (method === 'GET' && path === '/doctors/all') {
      const doctors = await sql`SELECT id, name, specialty FROM doctors ORDER BY name`;
      return { statusCode: 200, body: JSON.stringify(doctors) };
    }

    // --- POST /api/doctors (Buat dokter baru) ---
    if (method === 'POST' && path === '/doctors') {
      const { name, specialty, image_url, schedule } = JSON.parse(event.body);
      if (!name || !specialty) { return { statusCode: 400, body: JSON.stringify({ message: 'Nama dan Spesialisasi wajib diisi.' }) }; }
      const [newDoctor] = await sql`
        INSERT INTO doctors (name, specialty, image_url, schedule)
        VALUES (${name}, ${specialty}, ${image_url || ''}, ${schedule || '{}'})
        RETURNING *
      `;
      return { statusCode: 201, body: JSON.stringify(newDoctor) };
    }

    // --- PUT /api/doctors (Update dokter) ---
    if (method === 'PUT' && path === '/doctors') {
      const { id } = event.queryStringParameters;
      if (!id) return { statusCode: 400, body: JSON.stringify({ message: 'ID dokter dibutuhkan' }) };
      const { name, specialty, image_url, schedule } = JSON.parse(event.body);
      const [updatedDoctor] = await sql`
        UPDATE doctors SET name = ${name}, specialty = ${specialty}, image_url = ${image_url}, schedule = ${schedule}
        WHERE id = ${id} RETURNING *
      `;
      return { statusCode: 200, body: JSON.stringify(updatedDoctor) };
    }

    // --- DELETE /api/doctors (Hapus dokter) ---
    if (method === 'DELETE' && path === '/doctors') {
      const { id } = event.queryStringParameters;
      if (!id) return { statusCode: 400, body: JSON.stringify({ message: 'ID dokter dibutuhkan' }) };
      await sql`DELETE FROM doctors WHERE id = ${id}`;
      return { statusCode: 200, body: JSON.stringify({ message: 'Dokter berhasil dihapus' }) };
    }

    // --- GET /api/specialties (Untuk autocomplete) ---
    if (method === 'GET' && path === '/specialties') {
      const specialties = await sql`
        SELECT DISTINCT specialty FROM doctors ORDER BY specialty
      `;
      const specialtyList = specialties.map(s => s.specialty);
      return { statusCode: 200, body: JSON.stringify(specialtyList) };
    }

    // ===================================
    // === RUTE MANAJEMEN CUTI (LEAVES)
    // ===================================

    // --- GET /api/leaves ---
    if (method === 'GET' && path === '/leaves') {
      const leaves = await sql`
        SELECT t1.id, t1.start_date, t1.end_date, t2.name AS doctor_name
        FROM leave_data t1
        JOIN doctors t2 ON t1.doctor_id = t2.id
        ORDER BY t1.start_date DESC
      `;
      return { statusCode: 200, body: JSON.stringify(leaves) };
    }

    // --- POST /api/leaves ---
    if (method === 'POST' && path === '/leaves') {
      const { doctor_id, start_date, end_date } = JSON.parse(event.body);
      if (!doctor_id || !start_date || !end_date) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Semua field wajib diisi.' }) };
      }
      const [doctor] = await sql`SELECT name FROM doctors WHERE id = ${doctor_id}`;

      const [newLeave] = await sql`
        INSERT INTO leave_data (doctor_id, start_date, end_date)
        VALUES (${doctor_id}, ${start_date}, ${end_date})
        RETURNING id, start_date, end_date
      `;

      // Kirim Notifikasi jika sukses (Fire & Forget)
      if (newLeave) {
        const doctorName = doctor?.name || 'Dokter';
        sendLeaveNotification(doctorName, newLeave.start_date, newLeave.end_date)
          .then(() => console.log('Notif sent!'))
          .catch(err => console.error('Notif failed', err));
      }

      return { statusCode: 201, body: JSON.stringify(newLeave) };
    }

    // --- DELETE /api/leaves ---
    if (method === 'DELETE' && path === '/leaves') {
      const { id } = event.queryStringParameters;
      if (!id) return { statusCode: 400, body: JSON.stringify({ message: 'ID cuti dibutuhkan' }) };
      await sql`DELETE FROM leave_data WHERE id = ${id}`;
      return { statusCode: 200, body: JSON.stringify({ message: 'Data cuti berhasil dihapus' }) };
    }

    // ===================================
    // === RUTE NOTIFIKASI MANUAL
    // ===================================

    // --- POST /api/notifications ---
    if (method === 'POST' && path === '/notifications') {
      const { heading, content } = JSON.parse(event.body);
      if (!heading || !content) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Judul dan Pesan wajib diisi.' }) };
      }

      try {
        await sendNotification(heading, content);
        return { statusCode: 200, body: JSON.stringify({ message: 'Notifikasi berhasil dikirim' }) };
      } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ message: 'Gagal mengirim notifikasi', error: err.toString() }) };
      }
    }


    // ===================================
    // === RUTE MANAJEMEN FOTO SSTV
    // ===================================

    // --- GET /api/sstv_images ---
    if (method === 'GET' && path === '/sstv_images') {
      const images = await sql`SELECT * FROM sstv_images`;
      const imageMap = images.reduce((acc, img) => {
        acc[img.doctor_id] = img.image_url;
        return acc;
      }, {});
      return { statusCode: 200, body: JSON.stringify(imageMap) };
    }

    // --- POST /api/sstv_images (UPSERT) ---
    if (method === 'POST' && path === '/sstv_images') {
      const { doctor_id, image_url } = JSON.parse(event.body);
      if (!doctor_id || !image_url) {
        return { statusCode: 400, body: JSON.stringify({ message: 'ID Dokter dan URL wajib diisi.' }) };
      }
      const [result] = await sql`
        INSERT INTO sstv_images (doctor_id, image_url)
        VALUES (${doctor_id}, ${image_url})
        ON CONFLICT (doctor_id) 
        DO UPDATE SET image_url = EXCLUDED.image_url
        RETURNING *
      `;
      return { statusCode: 201, body: JSON.stringify(result) };
    }

    // ===================================
    // ===   RUTE MANAJEMEN PROMO   ===
    // ===================================

    // --- GET /api/promos (Sekarang ORDER BY sort_order) ---
    if (method === 'GET' && path === '/promos') {
      const promos = await sql`
        SELECT * FROM promo_images 
        ORDER BY sort_order ASC
      `;
      return { statusCode: 200, body: JSON.stringify(promos) };
    }

    // --- POST /api/promos (Upload foto promo baru) ---
    if (method === 'POST' && path === '/promos') {
      const { image_url, alt_text } = JSON.parse(event.body);
      if (!image_url) {
        return { statusCode: 400, body: JSON.stringify({ message: 'URL Gambar wajib diisi.' }) };
      }

      // ===================================
      // ===       PERBAIKAN BUG INI       ===
      // ===================================
      // Ambil sort_order tertinggi + 1
      const [maxOrderResult] = await sql`SELECT MAX(sort_order) as max FROM promo_images`;
      // Handle kasus jika maxOrderResult.max adalah null (saat tabel kosong)
      const newOrder = (maxOrderResult.max ? parseInt(maxOrderResult.max, 10) : 0) + 1;
      // ===================================

      const [newPromo] = await sql`
        INSERT INTO promo_images (image_url, alt_text, sort_order)
        VALUES (${image_url}, ${alt_text || ''}, ${newOrder})
        RETURNING *
      `;
      return { statusCode: 201, body: JSON.stringify(newPromo) };
    }

    // --- PUT /api/promos (Untuk edit alt_text) ---
    if (method === 'PUT' && path === '/promos') {
      const { id } = event.queryStringParameters;
      if (!id) return { statusCode: 400, body: JSON.stringify({ message: 'ID Promo dibutuhkan' }) };

      const { alt_text } = JSON.parse(event.body);

      const [updatedPromo] = await sql`
            UPDATE promo_images
            SET alt_text = ${alt_text}
            WHERE id = ${id}
            RETURNING *
        `;
      return { statusCode: 200, body: JSON.stringify(updatedPromo) };
    }

    // --- POST /api/promos/reorder (Untuk drag-and-drop) ---
    if (method === 'POST' && path === '/promos/reorder') {
      const { orderedIds } = JSON.parse(event.body);

      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Data urutan (orderedIds) dibutuhkan.' }) };
      }

      await sql.begin(async sql => {
        await sql`
                UPDATE promo_images AS p
                SET sort_order = temp.new_order
                FROM (
                    SELECT 
                        id, 
                        ROW_NUMBER() OVER () AS new_order
                    FROM UNNEST(${orderedIds}::int[]) AS id
                ) AS temp
                WHERE p.id = temp.id
            `;
      });

      return { statusCode: 200, body: JSON.stringify({ message: 'Urutan berhasil disimpan' }) };
    }

    // --- DELETE /api/promos ---
    if (method === 'DELETE' && path === '/promos') {
      const { id } = event.queryStringParameters;
      if (!id) return { statusCode: 400, body: JSON.stringify({ message: 'ID Promo dibutuhkan' }) };
      await sql`DELETE FROM promo_images WHERE id = ${id}`;
      return { statusCode: 200, body: JSON.stringify({ message: 'Promo berhasil dihapus' }) };
    }


    // --- Fallback ---
    return { statusCode: 404, body: JSON.stringify({ message: 'Endpoint tidak ditemukan' }) };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Terjadi kesalahan pada server', error: error.message }),
    };
  }
}