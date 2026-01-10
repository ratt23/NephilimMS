import postgres from 'postgres';
import { parse } from 'cookie';
import { sendLeaveNotification } from './utils/notificationSender.js';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

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
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-onesignal-app-id, x-onesignal-api-key',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/api', '');
  const method = event.httpMethod;
  const cookies = parse(event.headers.cookie || '');

  function checkAuth() {
    if (cookies.nf_auth !== 'true') {
      throw { status: 401, message: 'Akses ditolak. Silakan login.' };
    }
  }

  try {
    // ==========================================
    // DOCTORS
    // ==========================================
    if (path.startsWith('/doctors')) {
      // GET /doctors/grouped (Legacy)
      if (path === '/doctors/grouped' && method === 'GET') {
        const doctors = await sql`
                    SELECT d.id, d.name, d.specialty, d.schedule, d.image_url, s.image_url AS image_url_sstv 
                    FROM doctors d LEFT JOIN sstv_images s ON d.id = s.doctor_id ORDER BY d.name
                `;
        const doctorsData = {};
        for (const doc of doctors) {
          const specialtyKey = createKey(doc.specialty);
          if (!doctorsData[specialtyKey]) doctorsData[specialtyKey] = { title: doc.specialty, doctors: [] };
          doctorsData[specialtyKey].doctors.push({
            name: doc.name, image_url: doc.image_url,
            image_url_sstv: doc.image_url_sstv, schedule: doc.schedule
          });
        }
        return { statusCode: 200, headers, body: JSON.stringify(doctorsData) };
      }

      // GET /doctors/on-leave
      if (path === '/doctors/on-leave' && method === 'GET') {
        const today = new Date().toISOString().split('T')[0];
        const result = await sql`
                    SELECT t2.name, t2.specialty, t1.start_date, t1.end_date
                    FROM leave_data t1 JOIN doctors t2 ON t1.doctor_id = t2.id
                    WHERE t1.start_date <= ${today} AND t1.end_date >= ${today}
                    ORDER BY t1.start_date ASC
                `;
        return { statusCode: 200, headers, body: JSON.stringify(result) };
      }

      // GET /doctors/all (Minimal)
      if (path === '/doctors/all' && method === 'GET') {
        const doctors = await sql`SELECT id, name, specialty FROM doctors ORDER BY name`;
        return { statusCode: 200, headers, body: JSON.stringify(doctors) };
      }

      // GET /doctors (List with search)
      if ((path === '/doctors' || path === '/doctors/') && method === 'GET') {
        const { page = '1', limit = '30', search = '' } = event.queryStringParameters || {};
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const searchFilter = search
          ? sql`WHERE name ILIKE ${'%' + search + '%'} OR specialty ILIKE ${'%' + search + '%'}`
          : sql``;

        const [countResult] = await sql`SELECT COUNT(*) FROM doctors ${searchFilter}`;
        const doctors = await sql`SELECT * FROM doctors ${searchFilter} ORDER BY name LIMIT ${limit} OFFSET ${offset}`;

        return { statusCode: 200, headers, body: JSON.stringify({ doctors, total: parseInt(countResult.count) }) };
      }

      // POST /doctors (Create)
      if ((path === '/doctors' || path === '/doctors/') && method === 'POST') {
        checkAuth();
        const { name, specialty, image_url, schedule } = JSON.parse(event.body);
        if (!name || !specialty) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Nama dan Spesialisasi wajib.' }) };

        const [newDoctor] = await sql`
                    INSERT INTO doctors (name, specialty, image_url, schedule)
                    VALUES (${name}, ${specialty}, ${image_url || ''}, ${schedule || '{}'})
                    RETURNING *
                `;
        return { statusCode: 201, headers, body: JSON.stringify(newDoctor) };
      }

      // PUT /doctors (Update)
      if ((path === '/doctors' || path === '/doctors/') && method === 'PUT') {
        checkAuth();
        const id = event.queryStringParameters?.id;
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'ID dibutuhkan' }) };

        const { name, specialty, image_url, schedule } = JSON.parse(event.body);
        const [updated] = await sql`
                    UPDATE doctors SET name=${name}, specialty=${specialty}, image_url=${image_url}, schedule=${schedule}
                    WHERE id=${id} RETURNING *
                `;
        return { statusCode: 200, headers, body: JSON.stringify(updated) };
      }

      // DELETE /doctors
      if ((path === '/doctors' || path === '/doctors/') && method === 'DELETE') {
        checkAuth();
        const id = event.queryStringParameters?.id;
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'ID dibutuhkan' }) };
        await sql`DELETE FROM doctors WHERE id=${id}`;
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Deleted' }) };
      }
    }

    // ==========================================
    // LEAVES
    // ==========================================
    if (path.startsWith('/leaves')) {
      // GET /leaves
      if ((path === '/leaves' || path === '/leaves/') && method === 'GET') {
        const leaves = await sql`
                    SELECT t1.id, t1.start_date, t1.end_date, t2.name AS doctor_name
                    FROM leave_data t1 JOIN doctors t2 ON t1.doctor_id = t2.id
                    ORDER BY t1.start_date DESC
                `;
        return { statusCode: 200, headers, body: JSON.stringify(leaves) };
      }

      // POST /leaves
      if ((path === '/leaves' || path === '/leaves/') && method === 'POST') {
        checkAuth();
        const { doctor_id, start_date, end_date } = JSON.parse(event.body);
        if (!doctor_id || !start_date || !end_date) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Semua field wajib.' }) };

        const [doctor] = await sql`SELECT name FROM doctors WHERE id = ${doctor_id}`;
        const [newLeave] = await sql`
                    INSERT INTO leave_data (doctor_id, start_date, end_date) VALUES (${doctor_id}, ${start_date}, ${end_date})
                    RETURNING id, start_date, end_date
                `;

        if (newLeave) {
          const appId = event.headers['x-onesignal-app-id'];
          const apiKey = event.headers['x-onesignal-api-key'];
          const overrideConfig = (appId && apiKey) ? { appId, apiKey } : {};
          sendLeaveNotification(doctor?.name || 'Dokter', newLeave.start_date, newLeave.end_date, overrideConfig).catch(console.error);
        }
        return { statusCode: 201, headers, body: JSON.stringify(newLeave) };
      }

      // DELETE /leaves
      if ((path === '/leaves' || path === '/leaves/') && method === 'DELETE') {
        checkAuth();
        const id = event.queryStringParameters?.id;
        const cleanup = event.queryStringParameters?.cleanup;

        if (cleanup === 'true') {
          await sql`DELETE FROM leave_data WHERE end_date < CURRENT_DATE`;
          return { statusCode: 200, headers, body: JSON.stringify({ message: 'Cleaned' }) };
        }
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'ID required' }) };
        await sql`DELETE FROM leave_data WHERE id=${id}`;
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Deleted' }) };
      }
    }

    // ==========================================
    // SETTINGS
    // ==========================================
    if (path.startsWith('/settings')) {
      if ((path === '/settings' || path === '/settings/') && method === 'GET') {
        const settings = await sql`SELECT * FROM app_settings`;
        const map = settings.reduce((acc, item) => {
          acc[item.setting_key] = { value: item.setting_value, enabled: item.is_enabled };
          return acc;
        }, {});
        return { statusCode: 200, headers, body: JSON.stringify(map) };
      }

      if ((path === '/settings' || path === '/settings/') && method === 'POST') {
        checkAuth();
        const updates = JSON.parse(event.body);
        const promises = Object.entries(updates).map(([key, data]) => {
          return sql`
                        INSERT INTO app_settings (setting_key, setting_value, is_enabled, updated_at)
                        VALUES (${key}, ${data.value}, ${data.enabled}, NOW())
                        ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, is_enabled = EXCLUDED.is_enabled, updated_at = NOW()
                    `;
        });
        await Promise.all(promises);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Updated' }) };
      }
    }

    // ==========================================
    // MISC (Popup, Specialties, SSTV, etc)
    // ==========================================
    if (path === '/popup-ad') {
      if (method === 'GET') {
        const s = await sql`SELECT * FROM app_settings WHERE setting_key IN ('popup_ad_image', 'popup_ad_active')`;
        const res = {
          image_url: s.find(k => k.setting_key === 'popup_ad_image')?.setting_value || '',
          active: s.find(k => k.setting_key === 'popup_ad_active')?.is_enabled ?? false
        };
        return { statusCode: 200, headers, body: JSON.stringify(res) };
      }
      if (method === 'POST') {
        checkAuth();
        const { image_url, active } = JSON.parse(event.body);
        await sql`INSERT INTO app_settings (setting_key, setting_value, is_enabled, updated_at) VALUES ('popup_ad_image', ${image_url}, true, NOW()) ON CONFLICT (setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value`;
        await sql`INSERT INTO app_settings (setting_key, setting_value, is_enabled, updated_at) VALUES ('popup_ad_active', ${active ? 'true' : 'false'}, ${active}, NOW()) ON CONFLICT (setting_key) DO UPDATE SET is_enabled=EXCLUDED.is_enabled, setting_value=EXCLUDED.setting_value`;
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Updated' }) };
      }
    }

    if (path === '/specialties' && method === 'GET') {
      const s = await sql`SELECT DISTINCT specialty FROM doctors ORDER BY specialty`;
      return { statusCode: 200, headers, body: JSON.stringify(s.map(i => i.specialty)) };
    }

    if (path === '/sstv_images') {
      if (method === 'GET') {
        const imgs = await sql`SELECT * FROM sstv_images`;
        const map = imgs.reduce((acc, i) => ({ ...acc, [i.doctor_id]: i.image_url }), {});
        return { statusCode: 200, headers, body: JSON.stringify(map) };
      }
      if (method === 'POST') {
        checkAuth();
        const { doctor_id, image_url } = JSON.parse(event.body);
        const [res] = await sql`INSERT INTO sstv_images (doctor_id, image_url) VALUES (${doctor_id}, ${image_url}) ON CONFLICT (doctor_id) DO UPDATE SET image_url=EXCLUDED.image_url RETURNING *`;
        return { statusCode: 201, headers, body: JSON.stringify(res) };
      }
    }

    // ==========================================
    // POSTS
    // ==========================================
    if (path.startsWith('/posts')) {
      if ((path === '/posts' || path === '/posts/') && method === 'GET') {
        const { id, slug, page = '1', limit = '10', search = '', status, category, tag } = event.queryStringParameters || {};

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

        const [count] = await sql`SELECT COUNT(*) FROM posts ${whereClause}`;
        const posts = await sql`SELECT * FROM posts ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        return { statusCode: 200, headers, body: JSON.stringify({ posts, total: parseInt(count.count) }) };
      }

      if ((path === '/posts' || path === '/posts/') && method === 'POST') {
        checkAuth();
        const { title, slug, content, excerpt, image_url, status, category, tags } = JSON.parse(event.body);
        if (!title || !slug) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Title/Slug required' }) };

        try {
          const [newPost] = await sql`
                        INSERT INTO posts (title, slug, content, excerpt, image_url, status, category, tags)
                        VALUES (${title}, ${slug}, ${content || ''}, ${excerpt || ''}, ${image_url || ''}, ${status || 'draft'}, ${category || 'article'}, ${tags || ''})
                        RETURNING *
                     `;
          return { statusCode: 201, headers, body: JSON.stringify(newPost) };
        } catch (err) {
          if (err.code === '23505') return { statusCode: 400, headers, body: JSON.stringify({ message: 'Slug exists' }) };
          throw err;
        }
      }

      if ((path === '/posts' || path === '/posts/') && method === 'PUT') {
        checkAuth();
        const id = event.queryStringParameters?.id;
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'ID required' }) };
        const { title, slug, content, excerpt, image_url, status, category, tags } = JSON.parse(event.body);
        try {
          const [updated] = await sql`
                        UPDATE posts SET title=${title}, slug=${slug}, content=${content}, excerpt=${excerpt}, image_url=${image_url}, status=${status}, category=${category}, tags=${tags}, updated_at=NOW()
                        WHERE id=${id} RETURNING *
                     `;
          return { statusCode: 200, headers, body: JSON.stringify(updated) };
        } catch (err) {
          if (err.code === '23505') return { statusCode: 400, headers, body: JSON.stringify({ message: 'Slug exists' }) };
          throw err;
        }
      }

      if ((path === '/posts' || path === '/posts/') && method === 'DELETE') {
        checkAuth();
        const id = event.queryStringParameters?.id;
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'ID required' }) };
        await sql`DELETE FROM posts WHERE id = ${id}`;
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Deleted' }) };
      }
    }

    // ==========================================
    // MCU PACKAGES
    // ==========================================
    if (path.startsWith('/mcu-packages')) {
      if ((path === '/mcu-packages' || path === '/mcu-packages/') && method === 'GET') {
        const packages = await sql`SELECT * FROM mcu_packages WHERE is_enabled = true ORDER BY display_order ASC, id ASC`;
        return { statusCode: 200, headers, body: JSON.stringify(packages) };
      }
      if (path === '/mcu-packages/all' && method === 'GET') {
        checkAuth();
        const packages = await sql`SELECT * FROM mcu_packages ORDER BY display_order ASC, id ASC`;
        return { statusCode: 200, headers, body: JSON.stringify(packages) };
      }

      // Regex for /mcu-packages/ID
      const idMatch = path.match(/^\/mcu-packages\/([^\/]+)$/);
      if (idMatch) {
        const id = idMatch[1];
        if (id !== 'all') {
          if (method === 'GET') {
            checkAuth();
            const [pkg] = await sql`SELECT * FROM mcu_packages WHERE id = ${id}`;
            if (!pkg) return { statusCode: 404, headers, body: JSON.stringify({ message: 'Not found' }) };
            return { statusCode: 200, headers, body: JSON.stringify(pkg) };
          }
          if (method === 'PUT') {
            checkAuth();
            const body = JSON.parse(event.body);
            const { package_id, name, price, base_price, image_url, is_pelaut, is_recommended, items, addons, is_enabled, display_order } = body;
            const [updated] = await sql`
                            UPDATE mcu_packages SET 
                                package_id=${package_id}, name=${name}, price=${price}, base_price=${base_price || null}, image_url=${image_url || null},
                                is_pelaut=${is_pelaut || false}, is_recommended=${is_recommended || false}, items=${JSON.stringify(items)}, 
                                addons=${addons ? JSON.stringify(addons) : null}, is_enabled=${is_enabled !== undefined ? is_enabled : true}, 
                                display_order=${display_order || 0}, updated_at=NOW()
                            WHERE id=${id} RETURNING *
                         `;
            return { statusCode: 200, headers, body: JSON.stringify(updated) };
          }
          if (method === 'DELETE') {
            checkAuth();
            await sql`UPDATE mcu_packages SET is_enabled = false WHERE id = ${id}`;
            return { statusCode: 200, headers, body: JSON.stringify({ message: 'Disabled' }) };
          }
        }
      }

      if ((path === '/mcu-packages' || path === '/mcu-packages/') && method === 'POST') {
        checkAuth();
        const body = JSON.parse(event.body);
        const { package_id, name, price, base_price, image_url, is_pelaut, is_recommended, items, addons, display_order } = body;
        const [newPkg] = await sql`
                    INSERT INTO mcu_packages (
                      package_id, name, price, base_price, image_url, is_pelaut, is_recommended, items, addons, display_order
                    ) VALUES (
                      ${package_id}, ${name}, ${price}, ${base_price || null}, ${image_url || null}, ${is_pelaut || false}, ${is_recommended || false}, ${JSON.stringify(items)}, ${addons ? JSON.stringify(addons) : null}, ${display_order || 0}
                    ) RETURNING *
                 `;
        return { statusCode: 201, headers, body: JSON.stringify(newPkg) };
      }
    }

    // ==========================================
    // PROMOS
    // ==========================================
    if (path.startsWith('/promos')) {
      if ((path === '/promos' || path === '/promos/') && method === 'GET') {
        const p = await sql`SELECT * FROM promo_images ORDER BY sort_order ASC`;
        return { statusCode: 200, headers, body: JSON.stringify(p) };
      }
      if ((path === '/promos' || path === '/promos/') && method === 'POST') {
        checkAuth();
        const { image_url, alt_text } = JSON.parse(event.body);
        if (!image_url) return { statusCode: 400, headers, body: JSON.stringify({ message: 'URL wajib.' }) };

        const [maxOrder] = await sql`SELECT MAX(sort_order) as max FROM promo_images`;
        const newOrder = (maxOrder.max ? parseInt(maxOrder.max, 10) : 0) + 1;

        const [newPromo] = await sql`INSERT INTO promo_images (image_url, alt_text, sort_order) VALUES (${image_url}, ${alt_text || ''}, ${newOrder}) RETURNING *`;
        return { statusCode: 201, headers, body: JSON.stringify(newPromo) };
      }
      if ((path === '/promos' || path === '/promos/') && method === 'PUT') {
        checkAuth();
        const id = event.queryStringParameters?.id;
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'ID required' }) };
        const { alt_text } = JSON.parse(event.body);
        const [updated] = await sql`UPDATE promo_images SET alt_text=${alt_text} WHERE id=${id} RETURNING *`;
        return { statusCode: 200, headers, body: JSON.stringify(updated) };
      }
      if ((path === '/promos' || path === '/promos/') && method === 'DELETE') {
        checkAuth();
        const id = event.queryStringParameters?.id;
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'ID required' }) };
        await sql`DELETE FROM promo_images WHERE id=${id}`;
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Deleted' }) };
      }
      if (path === '/promos/reorder' && method === 'POST') {
        checkAuth();
        const { orderedIds } = JSON.parse(event.body);
        if (!orderedIds || !Array.isArray(orderedIds)) return { statusCode: 400, headers, body: JSON.stringify({ message: 'orderedIds required' }) };

        await sql.begin(async sql => {
          await sql`
                        UPDATE promo_images AS p
                        SET sort_order = temp.new_order
                        FROM (SELECT id, ROW_NUMBER() OVER () AS new_order FROM UNNEST(${orderedIds}::int[]) AS id) AS temp
                        WHERE p.id = temp.id
                    `;
        });
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Reordered' }) };
      }
    }

    // Fallback
    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Not found' }) };

  } catch (error) {
    console.error('API Error:', error);

    // Check for database table errors
    if (error.message && error.message.includes('does not exist')) {
      const tableName = error.message.match(/relation "(\w+)" does not exist/)?.[1] || 'unknown';
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          error: `Table "${tableName}" does not exist`,
          doctors: [],
          total: 0,
          message: 'Database migration required'
        })
      };
    }

    // Auth errors
    if (error.status) {
      return {
        statusCode: error.status,
        headers,
        body: JSON.stringify({ message: error.message })
      };
    }

    // Generic errors - always return JSON
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Server error',
        error: error.message || error.toString(),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}