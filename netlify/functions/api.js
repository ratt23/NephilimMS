import postgres from 'postgres';
import { parse } from 'cookie';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

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

export async function handler(event, context) {
  const authError = checkAuth(event);
  if (authError) return authError;

  const method = event.httpMethod;
  const path = event.path.replace('/.netlify/functions/api', '');

  try {
    // --- (Semua route /api/doctors, /api/specialties, /api/leaves Anda tetap sama) ---
    
    // --- ROUTE: GET /api/doctors (Pagination & Search) ---
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
    
    // --- ROUTE: GET /api/doctors/all (Untuk dropdown form cuti) ---
    if (method === 'GET' && path === '/doctors/all') {
        const doctors = await sql`SELECT id, name, specialty FROM doctors ORDER BY name`; // <-- Diperbarui untuk SstvManager
        return { statusCode: 200, body: JSON.stringify(doctors) };
    }

    // --- ROUTE: POST /api/doctors ---
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

    // --- ROUTE: PUT /api/doctors ---
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

    // --- ROUTE: DELETE /api/doctors ---
    if (method === 'DELETE' && path === '/doctors') {
      const { id } = event.queryStringParameters;
      if (!id) return { statusCode: 400, body: JSON.stringify({ message: 'ID dokter dibutuhkan' }) };
      await sql`DELETE FROM doctors WHERE id = ${id}`;
      return { statusCode: 200, body: JSON.stringify({ message: 'Dokter berhasil dihapus' }) };
    }

    // --- ROUTE: GET /api/specialties (Untuk autocomplete) ---
    if (method === 'GET' && path === '/specialties') {
      const specialties = await sql`
        SELECT DISTINCT specialty FROM doctors ORDER BY specialty
      `;
      const specialtyList = specialties.map(s => s.specialty);
      return { statusCode: 200, body: JSON.stringify(specialtyList) };
    }

    // --- ROUTE: GET /api/leaves ---
    if (method === 'GET' && path === '/leaves') {
      const leaves = await sql`
        SELECT t1.id, t1.start_date, t1.end_date, t2.name AS doctor_name
        FROM leave_data t1
        JOIN doctors t2 ON t1.doctor_id = t2.id
        ORDER BY t1.start_date DESC
      `;
      return { statusCode: 200, body: JSON.stringify(leaves) };
    }

    // --- ROUTE: POST /api/leaves ---
    if (method === 'POST' && path === '/leaves') {
      const { doctor_id, start_date, end_date } = JSON.parse(event.body);
      if (!doctor_id || !start_date || !end_date) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Semua field wajib diisi.' }) };
      }
      const [newLeave] = await sql`
        INSERT INTO leave_data (doctor_id, start_date, end_date)
        VALUES (${doctor_id}, ${start_date}, ${end_date})
        RETURNING id, start_date, end_date
      `;
      return { statusCode: 201, body: JSON.stringify(newLeave) };
    }
    
    // --- ROUTE: DELETE /api/leaves ---
    if (method === 'DELETE' && path === '/leaves') {
        const { id } = event.queryStringParameters;
        if (!id) return { statusCode: 400, body: JSON.stringify({ message: 'ID cuti dibutuhkan' }) };
        await sql`DELETE FROM leave_data WHERE id = ${id}`;
        return { statusCode: 200, body: JSON.stringify({ message: 'Data cuti berhasil dihapus' }) };
    }

    // ===================================
    // === ROUTE BARU UNTUK FOTO SSTV ===
    // ===================================

    // --- ROUTE BARU: GET /api/sstv_images (Mengambil semua foto sstv) ---
    if (method === 'GET' && path === '/sstv_images') {
      const images = await sql`SELECT * FROM sstv_images`;
      // Ubah array [ {doctor_id: 1, ...} ] menjadi objek { 1: ... } agar mudah diakses
      const imageMap = images.reduce((acc, img) => {
        acc[img.doctor_id] = img.image_url;
        return acc;
      }, {});
      return { statusCode: 200, body: JSON.stringify(imageMap) };
    }

    // --- ROUTE BARU: POST /api/sstv_images (Menyimpan/Update foto sstv) ---
    if (method === 'POST' && path === '/sstv_images') {
      const { doctor_id, image_url } = JSON.parse(event.body);
      if (!doctor_id || !image_url) {
        return { statusCode: 400, body: JSON.stringify({ message: 'ID Dokter dan URL wajib diisi.' }) };
      }
      
      // Gunakan "UPSERT": Update jika ada, Insert jika belum ada.
      const [result] = await sql`
        INSERT INTO sstv_images (doctor_id, image_url)
        VALUES (${doctor_id}, ${image_url})
        ON CONFLICT (doctor_id) 
        DO UPDATE SET image_url = EXCLUDED.image_url
        RETURNING *
      `;
      
      return { statusCode: 201, body: JSON.stringify(result) };
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