import postgres from 'postgres';
import { parse } from 'cookie';
import { sendLeaveNotification } from './utils/notificationSender.js';

const sql = postgres(process.env.NEON_DATABASE_URL, {
  ssl: 'require',
  idle_timeout: 5,
  connect_timeout: 10,
  max_lifetime: 60 * 30,
  prepare: false,
});

// Helper to create key from specialty name
function createKey(name) {
  if (typeof name !== 'string') return '';
  return name.toLowerCase()
    .replace(/spesialis|sub|dokter|gigi|&/g, '')
    .replace(/,/g, '')
    .replace(/\(|\)/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export async function handler(event, context) {
  const origin = event.headers.origin || event.headers.Origin || '';
  const allowedOrigins = [
    'https://shab.web.id',
    'https://jadwaldoktershab.netlify.app',
    'https://dashdev1.netlify.app',
    'https://dashdev2.netlify.app',
    'https://dashdev3.netlify.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
  ];

  const headers = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-onesignal-app-id, x-onesignal-api-key',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  console.log('[API] ' + event.httpMethod + ' ' + event.path);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = (event.path || '').replace('/api', '').replace(/.netlify\/functions\/api/, '');
    const method = event.httpMethod;

    // Auth helper
    function checkAuth() {
      const cookies = parse(event.headers.cookie || '');
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      if (cookies.adminAuth !== adminPassword) {
        throw new Error('Unauthorized');
      }
    }

    // ==========================================
    // SETTINGS
    // ==========================================
    if (path.startsWith('/settings')) {
      // GET /settings
      if ((path === '/settings' || path === '/settings/') && method === 'GET') {
        const settings = await sql.unsafe('SELECT * FROM settings ORDER BY setting_key ASC');
        return { statusCode: 200, headers, body: JSON.stringify(settings) };
      }

      // GET /settings/:key
      if (path.startsWith('/settings/') && method === 'GET') {
        const key = path.split('/')[2];
        const rows = await sql.unsafe('SELECT * FROM settings WHERE setting_key = ' + sql.escape(key));
        if (rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Setting not found' }) };
        }
        const setting = rows[0];
        let value = setting.value;
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if not JSON
        }
        return { statusCode: 200, headers, body: JSON.stringify({ key: setting.setting_key, value }) };
      }

      // POST /settings - Batch update
      if ((path === '/settings' || path === '/settings/') && method === 'POST') {
        checkAuth();
        const updates = JSON.parse(event.body);
        if (!Array.isArray(updates)) {
          return { statusCode: 400, headers, body: JSON.stringify({ message: 'Expected array of {key, value}' }) };
        }

        for (const { key, value } of updates) {
          const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
          const query = 'INSERT INTO settings (setting_key, value, updated_at) VALUES (' + sql.escape(key) + ', ' + sql.escape(jsonValue) + ', NOW()) ON CONFLICT (setting_key) DO UPDATE SET value = ' + sql.escape(jsonValue) + ', updated_at = NOW()';
          await sql.unsafe(query);
        }
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Settings updated' }) };
      }

      // PUT /settings/:key
      if (path.startsWith('/settings/') && method === 'PUT') {
        checkAuth();
        const key = path.split('/')[2];
        const { value } = JSON.parse(event.body);
        const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);

        const query = 'INSERT INTO settings (setting_key, value, updated_at) VALUES (' + sql.escape(key) + ', ' + sql.escape(jsonValue) + ', NOW()) ON CONFLICT (setting_key) DO UPDATE SET value = ' + sql.escape(jsonValue) + ', updated_at = NOW()';
        await sql.unsafe(query);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Setting updated' }) };
      }

      // DELETE /settings/:key
      if (path.startsWith('/settings/') && method === 'DELETE') {
        checkAuth();
        const key = path.split('/')[2];
        await sql.unsafe('DELETE FROM settings WHERE setting_key = ' + sql.escape(key));
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Setting deleted' }) };
      }
    }

    // ==========================================
    // DOCTORS
    // ==========================================
    if (path.startsWith('/doctors')) {
      // GET /doctors/grouped (Legacy)
      if (path === '/doctors/grouped' && method === 'GET') {
        const doctors = [];
        const doctorsData = {};
        for (const doc of doctors) {
          const specialtyKey = createKey(doc.specialty);
          if (!doctorsData[specialtyKey]) {
            doctorsData[specialtyKey] = { specialty: doc.specialty, doctors: [] };
          }
          doctorsData[specialtyKey].doctors.push(doc);
        }
        return { statusCode: 200, headers, body: JSON.stringify(doctorsData) };
      }

      // GET /doctors/on-leave
      if (path === '/doctors/on-leave' && method === 'GET') {
        const today = new Date().toISOString().split('T')[0];
        const query = 'SELECT t2.name AS "NamaDokter", t2.specialty AS "Spesialis", t1.start_date AS "TanggalMulaiCuti", t1.end_date AS "TanggalSelesaiCuti" FROM leave_data t1 JOIN doctors t2 ON t1.doctor_id = t2.id WHERE t1.end_date >= ' + sql.escape(today) + ' ORDER BY t1.start_date ASC';
        const result = await sql.unsafe(query);
        return { statusCode: 200, headers, body: JSON.stringify(result) };
      }

      // GET /doctors/all (Minimal)
      if (path === '/doctors/all' && method === 'GET') {
        const doctors = await sql.unsafe('SELECT id, name, specialty FROM doctors ORDER BY name');
        return { statusCode: 200, headers, body: JSON.stringify(doctors) };
      }

      // GET /doctors (List with search)
      if ((path === '/doctors' || path === '/doctors/') && method === 'GET') {
        const { page = '1', limit = '30', search = '' } = event.queryStringParameters || {};
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const searchFilter = search ? ' WHERE name ILIKE ' + sql.escape('%' + search + '%') + ' OR specialty ILIKE ' + sql.escape('%' + search + '%') : '';

        const countQuery = 'SELECT COUNT(*) FROM doctors' + searchFilter;
        const countResult = await sql.unsafe(countQuery);
        const doctorsQuery = 'SELECT * FROM doctors' + searchFilter + ' ORDER BY name LIMIT ' + parseInt(limit) + ' OFFSET ' + parseInt(offset);
        const doctors = await sql.unsafe(doctorsQuery);

        return { statusCode: 200, headers, body: JSON.stringify({ doctors, total: parseInt(countResult[0].count) }) };
      }

      // POST /doctors (Create)
      if ((path === '/doctors' || path === '/doctors/') && method === 'POST') {
        checkAuth();
        const { name, specialty, image_url, schedule } = JSON.parse(event.body);
        if (!name || !specialty) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Nama dan Spesialisasi wajib.' }) };

        const query = 'INSERT INTO doctors(name, specialty, image_url, schedule, updated_at) VALUES(' + sql.escape(name) + ', ' + sql.escape(specialty) + ', ' + sql.escape(image_url || '') + ', ' + sql.escape(schedule || '{}') + ', NOW()) RETURNING *';
        const newDoctor = await sql.unsafe(query);
        return { statusCode: 201, headers, body: JSON.stringify(newDoctor[0]) };
      }

      // GET /doctors/:id
      if (path.match(/^\/doctors\/\d+$/) && method === 'GET') {
        const id = parseInt(path.split('/')[2]);
        const query = 'SELECT d.*, s.image_url AS image_url_sstv FROM doctors d LEFT JOIN sstv_images s ON d.id = s.doctor_id WHERE d.id = ' + id;
        const rows = await sql.unsafe(query);
        if (rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Doctor not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(rows[0]) };
      }

      // PUT /doctors/:id
      if (path.match(/^\/doctors\/\d+$/) && method === 'PUT') {
        checkAuth();
        const id = parseInt(path.split('/')[2]);
        const { name, specialty, image_url, schedule } = JSON.parse(event.body);
        const query = 'UPDATE doctors SET name = ' + sql.escape(name) + ', specialty = ' + sql.escape(specialty) + ', image_url = ' + sql.escape(image_url || '') + ', schedule = ' + sql.escape(schedule || '{}') + ', updated_at = NOW() WHERE id = ' + id + ' RETURNING *';
        const updated = await sql.unsafe(query);
        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Doctor not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }

      // DELETE /doctors/:id
      if (path.match(/^\/doctors\/\d+$/) && method === 'DELETE') {
        checkAuth();
        const id = parseInt(path.split('/')[2]);
        await sql.unsafe('DELETE FROM doctors WHERE id = ' + id);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Doctor deleted' }) };
      }
    }

    // ==========================================
    // LEAVE DATA
    // ==========================================
    if (path.startsWith('/leave')) {
      // GET /leave
      if ((path === '/leave' || path === '/leave/') && method === 'GET') {
        const leave = await sql.unsafe('SELECT l.*, d.name AS doctor_name, d.specialty FROM leave_data l JOIN doctors d ON l.doctor_id = d.id ORDER BY l.start_date DESC');
        return { statusCode: 200, headers, body: JSON.stringify(leave) };
      }

      // POST /leave
      if ((path === '/leave' || path === '/leave/') && method === 'POST') {
        checkAuth();
        const { doctor_id, start_date, end_date, reason } = JSON.parse(event.body);
        if (!doctor_id || !start_date || !end_date) {
          return { statusCode: 400, headers, body: JSON.stringify({ message: 'doctor_id, start_date, dan end_date wajib.' }) };
        }
        const query = 'INSERT INTO leave_data(doctor_id, start_date, end_date, reason, created_at) VALUES(' + doctor_id + ', ' + sql.escape(start_date) + ', ' + sql.escape(end_date) + ', ' + sql.escape(reason || '') + ', NOW()) RETURNING *';
        const newLeave = await sql.unsafe(query);

        // Send notification
        const doctorQuery = 'SELECT * FROM doctors WHERE id = ' + doctor_id;
        const doctorResult = await sql.unsafe(doctorQuery);
        if (doctorResult.length > 0) {
          await sendLeaveNotification(doctorResult[0], start_date, end_date, reason);
        }

        return { statusCode: 201, headers, body: JSON.stringify(newLeave[0]) };
      }

      // PUT /leave/:id
      if (path.match(/^\/leave\/\d+$/) && method === 'PUT') {
        checkAuth();
        const id = parseInt(path.split('/')[2]);
        const { doctor_id, start_date, end_date, reason } = JSON.parse(event.body);
        const query = 'UPDATE leave_data SET doctor_id = ' + doctor_id + ', start_date = ' + sql.escape(start_date) + ', end_date = ' + sql.escape(end_date) + ', reason = ' + sql.escape(reason || '') + ' WHERE id = ' + id + ' RET URNING *';
        const updated = await sql.unsafe(query);
        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Leave not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }

      // DELETE /leave/:id
      if (path.match(/^\/leave\/\d+$/) && method === 'DELETE') {
        checkAuth();
        const id = parseInt(path.split('/')[2]);
        await sql.unsafe('DELETE FROM leave_data WHERE id = ' + id);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Leave deleted' }) };
      }
    }

    // ==========================================
    // PROMOS
    // ==========================================
    if (path.startsWith('/promos')) {
      // GET /promos
      if ((path === '/promos' || path === '/promos/') && method === 'GET') {
        const promos = await sql.unsafe('SELECT p.id, p.title, p.content, p.image_url, p.sort_order, p.is_active, p.created_at, p.updated_at, s.image_url AS image_url_sstv FROM promos p LEFT JOIN sstv_images s ON p.id = s.promo_id WHERE p.is_active = true ORDER BY p.sort_order ASC, p.created_at DESC');
        return { statusCode: 200, headers, body: JSON.stringify(promos) };
      }

      // GET /promos/all
      if (path === '/promos/all' && method === 'GET') {
        const promos = await sql.unsafe('SELECT * FROM promos ORDER BY sort_order ASC');
        return { statusCode: 200, headers, body: JSON.stringify(promos) };
      }

      // POST /promos
      if ((path === '/promos' || path === '/promos/') && method === 'POST') {
        checkAuth();
        const { title, content, image_url, sort_order = 0, is_active = true } = JSON.parse(event.body);
        const query = 'INSERT INTO promos(title, content, image_url, sort_order, is_active, created_at, updated_at) VALUES(' + sql.escape(title || '') + ', ' + sql.escape(content || '') + ', ' + sql.escape(image_url || '') + ', ' + sort_order + ', ' + is_active + ', NOW(), NOW()) RETURNING *';
        const newPromo = await sql.unsafe(query);
        return { statusCode: 201, headers, body: JSON.stringify(newPromo[0]) };
      }

      // PUT /promos/:id
      if (path.match(/^\/promos\/\d+$/) && method === 'PUT') {
        checkAuth();
        const id = parseInt(path.split('/')[2]);
        const { title, content, image_url, sort_order, is_active } = JSON.parse(event.body);
        const query = 'UPDATE promos SET title = ' + sql.escape(title) + ', content = ' + sql.escape(content) + ', image_url = ' + sql.escape(image_url) + ', sort_order = ' + sort_order + ', is_active = ' + is_active + ', updated_at = NOW() WHERE id = ' + id + ' RETURNING *';
        const updated = await sql.unsafe(query);
        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Promo not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }

      // DELETE /promos/:id
      if (path.match(/^\/promos\/\d+$/) && method === 'DELETE') {
        checkAuth();
        const id = parseInt(path.split('/')[2]);
        await sql.unsafe('DELETE FROM promos WHERE id = ' + id);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Promo deleted' }) };
      }
    }

    // ==========================================
    // SSTV IMAGES
    // ==========================================
    if (path.startsWith('/sstv')) {
      // GET /sstv/doctors
      if (path === '/sstv/doctors' && method === 'GET') {
        const images = await sql.unsafe('SELECT * FROM sstv_images WHERE doctor_id IS NOT NULL ORDER BY doctor_id ASC');
        return { statusCode: 200, headers, body: JSON.stringify(images) };
      }

      // GET /sstv/promos  
      if (path === '/sstv/promos' && method === 'GET') {
        const images = await sql.unsafe('SELECT * FROM sstv_images WHERE promo_id IS NOT NULL ORDER BY promo_id ASC');
        return { statusCode: 200, headers, body: JSON.stringify(images) };
      }

      // POST /sstv/doctors/:doctor_id
      if (path.match(/^\/sstv\/doctors\/\d+$/) && method === 'POST') {
        checkAuth();
        const doctor_id = parseInt(path.split('/')[3]);
        const { image_url } = JSON.parse(event.body);
        const query = 'INSERT INTO sstv_images(doctor_id, image_url, uploaded_at) VALUES(' + doctor_id + ', ' + sql.escape(image_url) + ', NOW()) ON CONFLICT (doctor_id) DO UPDATE SET image_url = ' + sql.escape(image_url) + ', uploaded_at = NOW()';
        await sql.unsafe(query);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'SSTV image uploaded' }) };
      }

      // POST /sstv/promos/:promo_id
      if (path.match(/^\/sstv\/promos\/\d+$/) && method === 'POST') {
        checkAuth();
        const promo_id = parseInt(path.split('/')[3]);
        const { image_url } = JSON.parse(event.body);
        const query = 'INSERT INTO sstv_images(promo_id, image_url, uploaded_at) VALUES(' + promo_id + ', ' + sql.escape(image_url) + ', NOW()) ON CONFLICT (promo_id) DO UPDATE SET image_url = ' + sql.escape(image_url) + ', uploaded_at = NOW()';
        await sql.unsafe(query);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'SSTV image uploaded' }) };
      }

      // DELETE /sstv/doctors/:doctor_id
      if (path.match(/^\/sstv\/doctors\/\d+$/) && method === 'DELETE') {
        checkAuth();
        const doctor_id = parseInt(path.split('/')[3]);
        await sql.unsafe('DELETE FROM sstv_images WHERE doctor_id = ' + doctor_id);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'SSTV image deleted' }) };
      }

      // DELETE /sstv/promos/:promo_id
      if (path.match(/^\/sstv\/promos\/\d+$/) && method === 'DELETE') {
        checkAuth();
        const promo_id = parseInt(path.split('/')[3]);
        await sql.unsafe('DELETE FROM sstv_images WHERE promo_id = ' + promo_id);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'SSTV image deleted' }) };
      }
    }

    // ==========================================
    // ECATALOG
    // ==========================================
    if (path.startsWith('/ecatalog')) {
      // GET /ecatalog/items
      if ((path === '/ecatalog/items' || path === '/ecatalog/items/') && method === 'GET') {
        const items = await sql.unsafe('SELECT * FROM ecatalog_items WHERE is_deleted = false ORDER BY category, sort_order ASC, created_at DESC');
        return { statusCode: 200, headers, body: JSON.stringify(items) };
      }

      // GET /ecatalog/items/all
      if (path === '/ecatalog/items/all' && method === 'GET') {
        const items = await sql.unsafe('SELECT * FROM ecatalog_items ORDER BY category, sort_order ASC');
        return { statusCode: 200, headers, body: JSON.stringify(items) };
      }

      // POST /ecatalog/items
      if ((path === '/ecatalog/items' || path === '/ecatalog/items/') && method === 'POST') {
        checkAuth();
        const { title, description, image_url, category, price, contact_person, sort_order = 0 } = JSON.parse(event.body);
        const query = 'INSERT INTO ecatalog_items(title, description, image_url, category, price, contact_person, sort_order, is_deleted, created_at, updated_at) VALUES(' + sql.escape(title) + ', ' + sql.escape(description || '') + ', ' + sql.escape(image_url || '') + ', ' + sql.escape(category) + ', ' + sql.escape(price || '') + ', ' + sql.escape(contact_person || '') + ', ' + sort_order + ', false, NOW(), NOW()) RETURNING *';
        const newItem = await sql.unsafe(query);
        return { statusCode: 201, headers, body: JSON.stringify(newItem[0]) };
      }

      // PUT /ecatalog/items/:id
      if (path.match(/^\/ecatalog\/items\/\d+$/) && method === 'PUT') {
        checkAuth();
        const id = parseInt(path.split('/')[3]);
        const { title, description, image_url, category, price, contact_person, sort_order, is_deleted } = JSON.parse(event.body);
        const query = 'UPDATE ecatalog_items SET title = ' + sql.escape(title) + ', description = ' + sql.escape(description) + ', image_url = ' + sql.escape(image_url) + ', category = ' + sql.escape(category) + ', price = ' + sql.escape(price) + ', contact_person = ' + sql.escape(contact_person) + ', sort_order = ' + sort_order + ', is_deleted = ' + is_deleted + ', updated_at = NOW() WHERE id = ' + id + ' RETURNING *';
        const updated = await sql.unsafe(query);
        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Item not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }

      // DELETE /ecatalog/items/:id (soft delete)
      if (path.match(/^\/ecatalog\/items\/\d+$/) && method === 'DELETE') {
        checkAuth();
        const id = parseInt(path.split('/')[3]);
        await sql.unsafe('UPDATE ecatalog_items SET is_deleted = true WHERE id = ' + id);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Item deleted' }) };
      }
    }

    // ==========================================
    // POPUP ADS
    // ==========================================
    if (path.startsWith('/popup-ad')) {
      // GET /popup-ad
      if ((path === '/popup-ad' || path === '/popup-ad/') && method === 'GET') {
        const rows = await sql.unsafe('SELECT * FROM popup_ads WHERE is_active = true ORDER BY created_at DESC LIMIT 1');
        if (rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'No active popup ad' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(rows[0]) };
      }

      // GET /popup-ad/all
      if (path === '/popup-ad/all' && method === 'GET') {
        const ads = await sql.unsafe('SELECT * FROM popup_ads ORDER BY created_at DESC');
        return { statusCode: 200, headers, body: JSON.stringify(ads) };
      }

      // POST /popup-ad
      if ((path === '/popup-ad' || path === '/popup-ad/') && method === 'POST') {
        checkAuth();
        const { title, image_url, link_url, is_active = true } = JSON.parse(event.body);
        const query = 'INSERT INTO popup_ads(title, image_url, link_url, is_active, created_at) VALUES(' + sql.escape(title || '') + ', ' + sql.escape(image_url || '') + ', ' + sql.escape(link_url || '') + ', ' + is_active + ', NOW()) RETURNING *';
        const newAd = await sql.unsafe(query);
        return { statusCode: 201, headers, body: JSON.stringify(newAd[0]) };
      }

      // PUT /popup-ad/:id
      if (path.match(/^\/popup-ad\/\d+$/) && method === 'PUT') {
        checkAuth();
        const id = parseInt(path.split('/')[2]);
        const { title, image_url, link_url, is_active } = JSON.parse(event.body);
        const query = 'UPDATE popup_ads SET title = ' + sql.escape(title) + ', image_url = ' + sql.escape(image_url) + ', link_url = ' + sql.escape(link_url) + ', is_active = ' + is_active + ' WHERE id = ' + id + ' RETURNING *';
        const updated = await sql.unsafe(query);
        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Popup ad not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }

      // DELETE /popup-ad/:id
      if (path.match(/^\/popup-ad\/\d+$/) && method === 'DELETE') {
        checkAuth();
        const id = parseInt(path.split('/')[2]);
        await sql.unsafe('DELETE FROM popup_ads WHERE id = ' + id);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Popup ad deleted' }) };
      }
    }

    // ==========================================
    // POSTS (Articles)
    // ==========================================
    if (path.startsWith('/posts')) {
      // GET /posts
      if ((path === '/posts' || path === '/posts/') && method === 'GET') {
        const posts = await sql.unsafe('SELECT * FROM posts WHERE is_active = true ORDER BY created_at DESC');
        return { statusCode: 200, headers, body: JSON.stringify(posts) };
      }

      // GET /posts/all
      if (path === '/posts/all' && method === 'GET') {
        const posts = await sql.unsafe('SELECT * FROM posts ORDER BY created_at DESC');
        return { statusCode: 200, headers, body: JSON.stringify(posts) };
      }

      // GET /posts/:id
      if (path.match(/^\/posts\/\d+$/) && method === 'GET') {
        const id = parseInt(path.split('/')[2]);
        const rows = await sql.unsafe('SELECT * FROM posts WHERE id = ' + id);
        if (rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Post not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(rows[0]) };
      }

      // POST /posts
      if ((path === '/posts' || path === '/posts/') && method === 'POST') {
        checkAuth();
        const { title, content, image_url, is_active = true } = JSON.parse(event.body);
        const query = 'INSERT INTO posts(title, content, image_url, is_active, created_at, updated_at) VALUES(' + sql.escape(title) + ', ' + sql.escape(content || '') + ', ' + sql.escape(image_url || '') + ', ' + is_active + ', NOW(), NOW()) RETURNING *';
        const newPost = await sql.unsafe(query);
        return { statusCode: 201, headers, body: JSON.stringify(newPost[0]) };
      }

      // PUT /posts/:id
      if (path.match(/^\/posts\/\d+$/) && method === 'PUT') {
        checkAuth();
        const id = parseInt(path.split('/')[2]);
        const { title, content, image_url, is_active } = JSON.parse(event.body);
        const query = 'UPDATE posts SET title = ' + sql.escape(title) + ', content = ' + sql.escape(content) + ', image_url = ' + sql.escape(image_url) + ', is_active = ' + is_active + ', updated_at = NOW() WHERE id = ' + id + ' RETURNING *';
        const updated = await sql.unsafe(query);
        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Post not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }

      // DELETE /posts/:id
      if (path.match(/^\/posts\/\d+$/) && method === 'DELETE') {
        checkAuth();
        const id = parseInt(path.split('/')[2]);
        await sql.unsafe('DELETE FROM posts WHERE id = ' + id);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Post deleted' }) };
      }
    }

    // ==========================================
    // DEVICE HEARTBEAT
    // ==========================================
    if (path === '/device-heartbeat' && method === 'POST') {
      const { device_id, device_name, last_ip } = JSON.parse(event.body);
      if (!device_id) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'device_id required' }) };
      }

      const query = 'INSERT INTO device_heartbeats(device_id, device_name, last_ip, last_seen) VALUES(' + sql.escape(device_id) + ', ' + sql.escape(device_name || '') + ', ' + sql.escape(last_ip || '') + ', NOW()) ON CONFLICT (device_id) DO UPDATE SET device_name = ' + sql.escape(device_name || '') + ', last_ip = ' + sql.escape(last_ip || '') + ', last_seen = NOW()';
      await sql.unsafe(query);
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Heartbeat recorded' }) };
    }

    // GET /device-heartbeat
    if ((path === '/device-heartbeat' || path === '/device-heartbeat/') && method === 'GET') {
      const devices = await sql.unsafe('SELECT * FROM device_heartbeats ORDER BY last_seen DESC');
      return { statusCode: 200, headers, body: JSON.stringify(devices) };
    }

    // ==========================================
    // ADMIN LOGIN
    // ==========================================
    if (path === '/admin/login' && method === 'POST') {
      const { password } = JSON.parse(event.body);
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

      if (password === adminPassword) {
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Set-Cookie': 'adminAuth=' + adminPassword + '; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=2592000'
          },
          body: JSON.stringify({ message: 'Login successful' })
        };
      } else {
        return { statusCode: 401, headers, body: JSON.stringify({ message: 'Invalid password' }) };
      }
    }

    // GET /admin/logout
    if (path === '/admin/logout' && method === 'GET') {
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Set-Cookie': 'adminAuth=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0'
        },
        body: JSON.stringify({ message: 'Logged out' })
      };
    }

    // ==========================================
    // 404 - Route not found
    // ==========================================
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found', path, method })
    };

  } catch (error) {
    console.error('[API Error]', error);
    if (error.message === 'Unauthorized') {
      return { statusCode: 401, headers, body: JSON.stringify({ message: 'Unauthorized' }) };
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
}