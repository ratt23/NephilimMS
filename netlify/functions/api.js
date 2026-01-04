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
  const method = event.httpMethod;
  const path = event.path.replace('/.netlify/functions/api', '');

  // --- CORS HEADERS ---
  // Default headers for preflight and basic requests
  let headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-onesignal-app-id, x-onesignal-api-key',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    // Default fallback if logic fails or no setting found
    'Access-Control-Allow-Origin': '*'
  };

  try {
    // Fetch allowed origins from DB
    // Note: In high traffic, this should be cached (redis/memory) but for now direct DB query is okay
    const [corsSetting] = await sql`SELECT setting_value FROM app_settings WHERE setting_key = 'cors_allowed_origins'`;

    if (corsSetting && corsSetting.setting_value) {
      const allowedOrigins = corsSetting.setting_value.split(',').map(o => o.trim());
      const origin = event.headers.origin || event.headers.Origin;

      if (allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Vary'] = 'Origin'; // Important for caching
      } else if (allowedOrigins.includes('*')) {
        headers['Access-Control-Allow-Origin'] = '*';
      }
      // If not in list, we fall back to hardcoded default (currently '*') or we could restrict it.
      // For this project "resale" value, defaulting to * if not matched might be safer unless strict mode is desired.
      // Let's stick to the user's logic: if they set specific origins, they probably WANT restriction.
      // But for now, to avoid breaking existing clients (dashdev1), let's keep '*' as fallback if no match found 
      // OR better: if setting exists, ONLY allow those. If setting doesn't exist, allow all.

      if (!allowedOrigins.includes('*') && !allowedOrigins.includes(origin)) {
        // If we want to be strict:
        // headers['Access-Control-Allow-Origin'] = allowedOrigins[0]; // or null
        // But to be safe during dev:
        headers['Access-Control-Allow-Origin'] = '*';
      }
    }
  } catch (e) {
    console.warn('Failed to fetch CORS settings:', e);
    // Fallback to *
  }


  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // --- PUBLIC ROUTES ---
  const PUBLIC_READ_PATHS = ['/posts', '/doctors', '/leaves', '/sstv_images', '/promos', '/doctors/all', '/specialties', '/settings', '/popup-ad', '/doctors/on-leave'];

  const isPublicRead = method === 'GET' && PUBLIC_READ_PATHS.includes(path);

  if (!isPublicRead) {
    const authError = checkAuth(event);
    if (authError) {
      return { ...authError, headers: { ...authError.headers, ...headers } };
    }
  }

  try {
    // ===================================
    // === RUTE MANAJEMEN DOKTER
    // ===================================
    if (method === 'GET' && path === '/doctors') {
      const { page = 1, limit = 30, search = '' } = event.queryStringParameters;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const searchFilter = search
        ? sql`WHERE name ILIKE ${'%' + search + '%'} OR specialty ILIKE ${'%' + search + '%'}`
        : sql``;
      const [countResult] = await sql`SELECT COUNT(*) FROM doctors ${searchFilter}`;
      const total = parseInt(countResult.count);
      const doctors = await sql`SELECT * FROM doctors ${searchFilter} ORDER BY name LIMIT ${limit} OFFSET ${offset}`;
      return { statusCode: 200, headers, body: JSON.stringify({ doctors, total }) };
    }

    if (method === 'GET' && path === '/doctors/all') {
      const doctors = await sql`SELECT id, name, specialty FROM doctors ORDER BY name`;
      return { statusCode: 200, headers, body: JSON.stringify(doctors) };
    }

    // GET /api/doctors/on-leave - Public endpoint for doctors currently on leave
    if (method === 'GET' && path === '/doctors/on-leave') {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

      const result = await sql`
        SELECT 
          t2.name,
          t2.specialty,
          t1.start_date,
          t1.end_date
        FROM leave_data t1
        JOIN doctors t2 ON t1.doctor_id = t2.id
        WHERE t1.start_date <= ${today} AND t1.end_date >= ${today}
        ORDER BY t1.start_date ASC
      `;

      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    if (method === 'POST' && path === '/doctors') {
      const { name, specialty, image_url, schedule } = JSON.parse(event.body);
      if (!name || !specialty) { return { statusCode: 400, headers, body: JSON.stringify({ message: 'Nama dan Spesialisasi wajib diisi.' }) }; }
      const [newDoctor] = await sql`
        INSERT INTO doctors (name, specialty, image_url, schedule)
        VALUES (${name}, ${specialty}, ${image_url || ''}, ${schedule || '{}'})
        RETURNING *
      `;
      return { statusCode: 201, headers, body: JSON.stringify(newDoctor) };
    }

    if (method === 'PUT' && path === '/doctors') {
      const { id } = event.queryStringParameters;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'ID dokter dibutuhkan' }) };
      const { name, specialty, image_url, schedule } = JSON.parse(event.body);
      const [updatedDoctor] = await sql`
        UPDATE doctors SET name = ${name}, specialty = ${specialty}, image_url = ${image_url}, schedule = ${schedule}
        WHERE id = ${id} RETURNING *
      `;
      return { statusCode: 200, headers, body: JSON.stringify(updatedDoctor) };
    }

    if (method === 'DELETE' && path === '/doctors') {
      const { id } = event.queryStringParameters;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'ID dokter dibutuhkan' }) };
      await sql`DELETE FROM doctors WHERE id = ${id}`;
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Dokter berhasil dihapus' }) };
    }

    if (method === 'GET' && path === '/specialties') {
      const specialties = await sql`SELECT DISTINCT specialty FROM doctors ORDER BY specialty`;
      const specialtyList = specialties.map(s => s.specialty);
      return { statusCode: 200, headers, body: JSON.stringify(specialtyList) };
    }

    // ===================================
    // === RUTE MANAJEMEN CUTI (LEAVES)
    // ===================================
    if (method === 'GET' && path === '/leaves') {
      const leaves = await sql`
        SELECT t1.id, t1.start_date, t1.end_date, t2.name AS doctor_name
        FROM leave_data t1
        JOIN doctors t2 ON t1.doctor_id = t2.id
        ORDER BY t1.start_date DESC
      `;
      return { statusCode: 200, headers, body: JSON.stringify(leaves) };
    }

    if (method === 'POST' && path === '/leaves') {
      const { doctor_id, start_date, end_date } = JSON.parse(event.body);
      if (!doctor_id || !start_date || !end_date) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Semua field wajib diisi.' }) };
      }
      const [doctor] = await sql`SELECT name FROM doctors WHERE id = ${doctor_id}`;
      const [newLeave] = await sql`
        INSERT INTO leave_data (doctor_id, start_date, end_date)
        VALUES (${doctor_id}, ${start_date}, ${end_date})
        RETURNING id, start_date, end_date
      `;
      if (newLeave) {
        const doctorName = doctor?.name || 'Dokter';
        const appId = event.headers['x-onesignal-app-id'];
        const apiKey = event.headers['x-onesignal-api-key'];
        const overrideConfig = (appId && apiKey) ? { appId, apiKey } : {};
        sendLeaveNotification(doctorName, newLeave.start_date, newLeave.end_date, overrideConfig)
          .then(() => console.log('Notif sent!'))
          .catch(err => console.error('Notif failed', err));
      }
      return { statusCode: 201, headers, body: JSON.stringify(newLeave) };
    }

    if (method === 'DELETE' && path === '/leaves') {
      const { id, cleanup } = event.queryStringParameters;
      if (cleanup === 'true') {
        await sql`DELETE FROM leave_data WHERE end_date < CURRENT_DATE`;
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'History cleared successfully' }) };
      }
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Leave ID required' }) };
      await sql`DELETE FROM leave_data WHERE id = ${id}`;
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Leave data deleted successfully' }) };
    }

    // ===================================
    // === RUTE NOTIFIKASI MANUAL
    // ===================================
    if (method === 'POST' && path === '/notifications') {
      const { heading, content } = JSON.parse(event.body);
      if (!heading || !content) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Judul dan Pesan wajib diisi.' }) };
      }
      const appId = event.headers['x-onesignal-app-id'];
      const apiKey = event.headers['x-onesignal-api-key'];
      const overrideConfig = (appId && apiKey) ? { appId, apiKey } : {};
      try {
        await sendNotification(heading, content, {}, overrideConfig);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Notifikasi berhasil dikirim' }) };
      } catch (err) {
        return { statusCode: 500, headers, body: JSON.stringify({ message: 'Gagal mengirim notifikasi', error: err.toString() }) };
      }
    }

    // ===================================
    // === RUTE MANAJEMEN FOTO SSTV
    // ===================================
    if (method === 'GET' && path === '/sstv_images') {
      const images = await sql`SELECT * FROM sstv_images`;
      const imageMap = images.reduce((acc, img) => {
        acc[img.doctor_id] = img.image_url;
        return acc;
      }, {});
      return { statusCode: 200, headers, body: JSON.stringify(imageMap) };
    }

    if (method === 'POST' && path === '/sstv_images') {
      const { doctor_id, image_url } = JSON.parse(event.body);
      if (!doctor_id || !image_url) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'ID Dokter dan URL wajib diisi.' }) };
      }
      const [result] = await sql`
        INSERT INTO sstv_images (doctor_id, image_url)
        VALUES (${doctor_id}, ${image_url})
        ON CONFLICT (doctor_id) DO UPDATE SET image_url = EXCLUDED.image_url
        RETURNING *
      `;
      return { statusCode: 201, headers, body: JSON.stringify(result) };
    }

    // ===================================
    // ===   RUTE MANAJEMEN PROMO   ===
    // ===================================
    if (method === 'GET' && path === '/promos') {
      const promos = await sql`SELECT * FROM promo_images ORDER BY sort_order ASC`;
      return { statusCode: 200, headers, body: JSON.stringify(promos) };
    }

    if (method === 'POST' && path === '/promos') {
      const { image_url, alt_text } = JSON.parse(event.body);
      if (!image_url) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'URL Gambar wajib diisi.' }) };
      }
      const [maxOrderResult] = await sql`SELECT MAX(sort_order) as max FROM promo_images`;
      const newOrder = (maxOrderResult.max ? parseInt(maxOrderResult.max, 10) : 0) + 1;
      const [newPromo] = await sql`
        INSERT INTO promo_images (image_url, alt_text, sort_order)
        VALUES (${image_url}, ${alt_text || ''}, ${newOrder})
        RETURNING *
      `;
      return { statusCode: 201, headers, body: JSON.stringify(newPromo) };
    }

    if (method === 'PUT' && path === '/promos') {
      const { id } = event.queryStringParameters;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'ID Promo dibutuhkan' }) };
      const { alt_text } = JSON.parse(event.body);
      const [updatedPromo] = await sql`UPDATE promo_images SET alt_text = ${alt_text} WHERE id = ${id} RETURNING *`;
      return { statusCode: 200, headers, body: JSON.stringify(updatedPromo) };
    }

    if (method === 'POST' && path === '/promos/reorder') {
      const { orderedIds } = JSON.parse(event.body);
      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Data urutan dibutuhkan.' }) };
      }
      await sql.begin(async sql => {
        await sql`
            UPDATE promo_images AS p
            SET sort_order = temp.new_order
            FROM (SELECT id, ROW_NUMBER() OVER () AS new_order FROM UNNEST(${orderedIds}::int[]) AS id) AS temp
            WHERE p.id = temp.id
        `;
      });
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Urutan berhasil disimpan' }) };
    }

    if (method === 'DELETE' && path === '/promos') {
      const { id } = event.queryStringParameters;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'ID Promo dibutuhkan' }) };
      await sql`DELETE FROM promo_images WHERE id = ${id}`;
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Promo berhasil dihapus' }) };
    }

    // ===================================
    // ===   RUTE MANAJEMEN POSTING (BLOG)   ===
    // ===================================
    if (method === 'GET' && path === '/posts') {
      const { id, slug, page = 1, limit = 10, search = '', status, category, tag } = event.queryStringParameters;

      if (id) {
        const [post] = await sql`SELECT * FROM posts WHERE id = ${id}`;
        if (!post) return { statusCode: 404, headers, body: JSON.stringify({ message: 'Post not found' }) };
        return { statusCode: 200, headers, body: JSON.stringify(post) };
      }

      if (slug) {
        const [post] = await sql`SELECT * FROM posts WHERE slug = ${slug}`;
        if (!post) return { statusCode: 404, headers, body: JSON.stringify({ message: 'Post not found' }) };
        return { statusCode: 200, headers, body: JSON.stringify(post) };
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      let whereClause = sql`WHERE 1=1`;
      if (search) whereClause = sql`${whereClause} AND (title ILIKE ${'%' + search + '%'} OR content ILIKE ${'%' + search + '%'})`;
      if (status) whereClause = sql`${whereClause} AND status = ${status}`;
      if (category) whereClause = sql`${whereClause} AND category = ${category}`;
      if (tag) whereClause = sql`${whereClause} AND tags ILIKE ${'%' + tag + '%'}`;

      const [countResult] = await sql`SELECT COUNT(*) FROM posts ${whereClause}`;
      const total = parseInt(countResult.count);
      const posts = await sql`SELECT * FROM posts ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      return { statusCode: 200, headers, body: JSON.stringify({ posts, total }) };
    }

    if (method === 'POST' && path === '/posts') {
      const { title, slug, content, excerpt, image_url, status, category, tags } = JSON.parse(event.body);
      if (!title || !slug) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Title and Slug are required.' }) };
      try {
        const [newPost] = await sql`
          INSERT INTO posts (title, slug, content, excerpt, image_url, status, category, tags)
          VALUES (${title}, ${slug}, ${content || ''}, ${excerpt || ''}, ${image_url || ''}, ${status || 'draft'}, ${category || 'article'}, ${tags || ''})
          RETURNING *
        `;
        return { statusCode: 201, headers, body: JSON.stringify(newPost) };
      } catch (err) {
        if (err.code === '23505') return { statusCode: 400, headers, body: JSON.stringify({ message: 'Slug already exists.' }) };
        throw err;
      }
    }

    if (method === 'PUT' && path === '/posts') {
      const { id } = event.queryStringParameters;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Post ID required' }) };
      const { title, slug, content, excerpt, image_url, status, category, tags } = JSON.parse(event.body);
      try {
        const [updatedPost] = await sql`
          UPDATE posts 
          SET title = ${title}, slug = ${slug}, content = ${content}, excerpt = ${excerpt}, image_url = ${image_url}, status = ${status}, category = ${category}, tags = ${tags}, updated_at = NOW()
          WHERE id = ${id} RETURNING *
        `;
        return { statusCode: 200, headers, body: JSON.stringify(updatedPost) };
      } catch (err) {
        if (err.code === '23505') return { statusCode: 400, headers, body: JSON.stringify({ message: 'Slug already exists.' }) };
        throw err;
      }
    }

    if (method === 'DELETE' && path === '/posts') {
      const { id } = event.queryStringParameters;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Post ID required' }) };
      await sql`DELETE FROM posts WHERE id = ${id}`;
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Post deleted successfully' }) };
    }

    // ===================================
    // ===   RUTE APP SETTINGS (ADS)   ===
    // ===================================
    if (method === 'GET' && path === '/settings') {
      const settings = await sql`SELECT * FROM app_settings`;
      const settingsMap = settings.reduce((acc, item) => {
        acc[item.setting_key] = { value: item.setting_value, enabled: item.is_enabled };
        return acc;
      }, {});
      return { statusCode: 200, headers, body: JSON.stringify(settingsMap) };
    }

    if (method === 'POST' && path === '/settings') {
      const settingsUpdates = JSON.parse(event.body);
      // Upsert parallel
      const promises = Object.entries(settingsUpdates).map(([key, data]) => {
        return sql`
           INSERT INTO app_settings (setting_key, setting_value, is_enabled, updated_at)
           VALUES (${key}, ${data.value}, ${data.enabled}, NOW())
           ON CONFLICT (setting_key) 
           DO UPDATE SET setting_value = EXCLUDED.setting_value, is_enabled = EXCLUDED.is_enabled, updated_at = NOW()
         `;
      });
      await Promise.all(promises);
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Settings updated' }) };
    }

    // ===================================
    // ===   RUTE POPUP AD   ===
    // ===================================

    // --- GET /api/popup-ad ---
    if (method === 'GET' && path === '/popup-ad') {
      const settings = await sql`SELECT * FROM app_settings WHERE setting_key IN ('popup_ad_image', 'popup_ad_active')`;
      const result = {
        image_url: settings.find(s => s.setting_key === 'popup_ad_image')?.setting_value || '',
        active: settings.find(s => s.setting_key === 'popup_ad_active')?.is_enabled ?? false
      };
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    // --- POST /api/popup-ad ---
    if (method === 'POST' && path === '/popup-ad') {
      const { image_url, active } = JSON.parse(event.body);

      await sql.begin(async sql => {
        // Update Image URL
        await sql`
            INSERT INTO app_settings (setting_key, setting_value, is_enabled, updated_at)
            VALUES ('popup_ad_image', ${image_url}, true, NOW())
            ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
          `;
        // Update Active Status (is_enabled column acts as the boolean toggle here, setting_value can be ignored or string 'true'/'false')
        await sql`
             INSERT INTO app_settings (setting_key, setting_value, is_enabled, updated_at)
             VALUES ('popup_ad_active', ${active ? 'true' : 'false'}, ${active}, NOW())
             ON CONFLICT (setting_key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled, setting_value = EXCLUDED.setting_value, updated_at = NOW()
          `;
      });

      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Popup Ad updated successfully' }) };
    }

    // --- Fallback ---
    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Endpoint tidak ditemukan' }) };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Terjadi kesalahan pada server', error: error.message }),
    };
  }
}