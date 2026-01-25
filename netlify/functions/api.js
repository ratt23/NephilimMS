import postgres from 'postgres';
import { parse, serialize } from 'cookie';
import { sendLeaveNotification } from './utils/notificationSender.js';

// Database connection
let sql;

if (process.env.NEON_DATABASE_URL) {
  sql = postgres(process.env.NEON_DATABASE_URL, {
    ssl: 'require',
    idle_timeout: 5,
    connect_timeout: 10,
    max_lifetime: 60 * 30,
    prepare: false,
  });
} else {
  console.warn('⚠️ NEON_DATABASE_URL is missing! Database features will not work.');
  // Mock sql instance that throws error when used
  sql = {
    unsafe: async () => {
      throw new Error('Database connection invalid. Please check NEON_DATABASE_URL environment variable.');
    }
  };
}

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
    'https://ecatalog.shab.web.id',
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
    let path = event.path || '';
    // Remove both /api and /.netlify/functions/api prefixes
    path = path.replace(/^\/.netlify\/functions\/api/, '').replace(/^\/api/, '');
    const method = event.httpMethod;

    // Auth helper
    function checkAuth() {
      const cookies = parse(event.headers.cookie || '');
      // HARDCODED PASSWORD as requested
      const adminPassword = 'admin123';
      if (cookies.adminAuth !== adminPassword) {
        throw new Error('Unauthorized');
      }
    }

    // ==========================================
    // AUTHENTICATION
    // ==========================================
    if (path === '/login' && method === 'POST') {
      const { password } = JSON.parse(event.body || '{}');

      // HARDCODED PASSWORD as requested
      const adminPass = 'admin123';
      const inputPass = String(password || '').trim();

      if (inputPass === adminPass) {
        // Set cookie 'adminAuth' with the password value
        const authCookie = serialize('adminAuth', inputPass, {
          httpOnly: false,
          secure: true,
          sameSite: 'Lax',
          path: '/',
          maxAge: 60 * 60 * 24, // 1 day
        });

        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Set-Cookie': authCookie
          },
          body: JSON.stringify({ success: true, message: 'Login successful' })
        };
      } else {
        console.warn(`Login failed. Input Matches: ${inputPass === adminPass}`);
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Invalid password',
            debug: `Input Length: ${inputPass.length}`
          })
        };
      }
    }

    if (path === '/logout' && method === 'POST') {
      const authCookie = serialize('adminAuth', 'expired', {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        path: '/',
        maxAge: -1,
      });

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Set-Cookie': authCookie
        },
        body: JSON.stringify({ success: true, message: 'Logged out' })
      };
    }

    // ==========================================
    // SETTINGS (Using app_settings table)
    // ==========================================
    if (path.startsWith('/settings')) {
      // GET /settings
      if ((path === '/settings' || path === '/settings/') && method === 'GET') {
        // Use 'app_settings' because it contains the actual data
        const settings = await sql.unsafe('SELECT * FROM app_settings ORDER BY setting_key ASC');

        // Map to dictionary object format for frontend compatibility (ConfigContext.jsx expects object)
        const settingsMap = {};
        for (const s of settings) {
          settingsMap[s.setting_key] = {
            key: s.setting_key,
            value: s.setting_value,
            is_enabled: s.is_enabled,
            updated_at: s.updated_at
          };
        }
        return { statusCode: 200, headers, body: JSON.stringify(settingsMap) };
      }

      // GET /settings/:key
      if (path.startsWith('/settings/') && method === 'GET') {
        const key = path.split('/')[2];
        const rows = await sql.unsafe('SELECT * FROM app_settings WHERE setting_key = $1', [key]);
        if (rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Setting not found' }) };
        }
        const setting = rows[0];
        let value = setting.setting_value;
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
          // Upsert into app_settings
          await sql.unsafe('INSERT INTO app_settings (setting_key, setting_value, updated_at, is_enabled) VALUES ($1, $2, NOW(), true) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = NOW()', [key, jsonValue]);
        }
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Settings updated' }) };
      }

      // PUT /settings/:key
      if (path.startsWith('/settings/') && method === 'PUT') {
        checkAuth();
        const key = path.split('/')[2];
        const { value } = JSON.parse(event.body);
        const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);

        await sql.unsafe('INSERT INTO app_settings (setting_key, setting_value, updated_at, is_enabled) VALUES ($1, $2, NOW(), true) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = NOW()', [key, jsonValue]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Setting updated' }) };
      }

      // DELETE /settings/:key
      if (path.startsWith('/settings/') && method === 'DELETE') {
        checkAuth();
        const key = path.split('/')[2];
        await sql.unsafe('DELETE FROM app_settings WHERE setting_key = $1', [key]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Setting deleted' }) };
      }
    }

    // ==========================================
    // ANALYTICS
    // ==========================================
    if (path.startsWith('/analytics')) {
      const action = event.queryStringParameters?.action;

      // POST /analytics?action=track
      if (action === 'track' && method === 'POST') {
        const { isNewVisitor, path: pagePath, device, browser, referrer, event_type, event_name } = JSON.parse(event.body || '{}');

        // 1. Traffic Source Logic
        let trafficSource = 'Direct';
        if (referrer) {
          if (referrer.includes('google')) trafficSource = 'Organic Search';
          else if (referrer.includes('facebook') || referrer.includes('instagram') || referrer.includes('t.co')) trafficSource = 'Social Media';
          else if (referrer.includes(event.headers.host)) trafficSource = 'Internal';
          else trafficSource = 'Referral';
        }

        const region = event.headers['x-nf-geo-country-code'] || 'unknown';
        const city = event.headers['x-nf-geo-city'] || 'unknown';
        const ip = event.headers['client-ip'] || 'unknown';

        // Insert into analytics_events
        await sql.unsafe(`
                INSERT INTO analytics_events (
                    date, timestamp, event_type, path, event_name,
                    device_type, browser, region, city, 
                    referrer, traffic_source, ip_hash
                )
                VALUES (
                    CURRENT_DATE, NOW(), $1, $2, $3,
                    $4, $5, $6, $7,
                    $8, $9, $10
                )
            `, [
          event_type || 'pageview',
          pagePath || event_name,
          event_name || null,
          device,
          browser,
          region,
          city,
          referrer,
          trafficSource,
          ip
        ]);

        // 2. Aggregated Stats
        if (event_type === 'pageview') {
          await sql.unsafe(`
                    INSERT INTO daily_stats (date, page_views, visitors)
                    VALUES (CURRENT_DATE, 1, $1)
                    ON CONFLICT (date)
                    DO UPDATE SET 
                        page_views = daily_stats.page_views + 1,
                        visitors = daily_stats.visitors + $2
                `, [isNewVisitor ? 1 : 0, isNewVisitor ? 1 : 0]);
        }

        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
      }

      // GET /analytics?action=stats
      if (action === 'stats' && method === 'GET') {
        const type = event.queryStringParameters?.type || 'basic';
        const period = event.queryStringParameters?.period || '7days';

        // Handle advanced analytics
        if (type === 'advanced') {
          const daysLimit = period === '30days' ? 30 : 7;

          // Device breakdown
          const devices = await sql.unsafe(`
            SELECT device_type as name, COUNT(*) as value
            FROM analytics_events
            WHERE date >= CURRENT_DATE - INTERVAL '${daysLimit} days' AND device_type IS NOT NULL
            GROUP BY device_type
            ORDER BY value DESC
          `);

          // Browser breakdown
          const browsers = await sql.unsafe(`
            SELECT browser as name, COUNT(*) as value
            FROM analytics_events
            WHERE date >= CURRENT_DATE - INTERVAL '${daysLimit} days' AND browser IS NOT NULL
            GROUP BY browser
            ORDER BY value DESC
            LIMIT 5
          `);

          // Traffic sources
          const sources = await sql.unsafe(`
            SELECT traffic_source as name, COUNT(*) as value
            FROM analytics_events
            WHERE date >= CURRENT_DATE - INTERVAL '${daysLimit} days' AND traffic_source IS NOT NULL
            GROUP BY traffic_source
            ORDER BY value DESC
          `);

          // Top pages
          const topPages = await sql.unsafe(`
            SELECT path as name, COUNT(*) as value
            FROM analytics_events
            WHERE date >= CURRENT_DATE - INTERVAL '${daysLimit} days' AND path IS NOT NULL
            GROUP BY path
            ORDER BY value DESC
            LIMIT 10
          `);

          // Conversion events
          const conversions = await sql.unsafe(`
            SELECT event_name as name, COUNT(*) as value
            FROM analytics_events
            WHERE date >= CURRENT_DATE - INTERVAL '${daysLimit} days' AND event_type = 'conversion' AND event_name IS NOT NULL
            GROUP BY event_name
            ORDER BY value DESC
          `);

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              devices: devices.map(d => ({ name: d.name, value: Number(d.value) })),
              browsers: browsers.map(b => ({ name: b.name, value: Number(b.value) })),
              sources: sources.map(s => ({ name: s.name, value: Number(s.value) })),
              topPages: topPages.map(p => ({ name: p.name, value: Number(p.value) })),
              conversions: conversions.map(c => ({ name: c.name, value: Number(c.value) }))
            })
          };
        }

        // Basic stats (existing logic)
        let query = '';
        let params = [];

        if (period === 'year') {
          query = `
                    SELECT to_char(date_trunc('month', date), 'Mon YYYY') as name,
                           SUM(visitors) as visitors,
                           SUM(page_views) as page_views,
                           MIN(date) as sort_date
                    FROM daily_stats
                    WHERE date > CURRENT_DATE - INTERVAL '1 year'
                    GROUP BY date_trunc('month', date)
                    ORDER BY sort_date DESC
                `;
        } else {
          const limit = period === '30days' ? 30 : 7;
          query = `
                    SELECT to_char(date, 'DD Mon') as name,
                           date as full_date,
                           visitors,
                           page_views
                    FROM daily_stats 
                    ORDER BY date DESC 
                    LIMIT $1
                `;
          params.push(limit);
        }

        const rows = await sql.unsafe(query, params);

        const stats = rows.reverse().map(row => ({
          name: row.name,
          visitors: Number(row.visitors),
          pageviews: Number(row.page_views),
          fullDate: row.full_date || row.sort_date
        }));

        return { statusCode: 200, headers, body: JSON.stringify({ stats, systemStatus: { online: true, lastSync: new Date().toISOString() } }) };
      }

      // GET /analytics?action=monthly&month=YYYY-MM
      if (action === 'monthly' && method === 'GET') {
        const month = event.queryStringParameters?.month || new Date().toISOString().slice(0, 7);
        const [year, monthStr] = month.split('-');

        // Query daily stats for the selected month
        const query = `
          SELECT to_char(date, 'YYYY-MM-DD') as formattedDate,
                 to_char(date, 'Day') as dayName,
                 date,
                 visitors,
                 page_views as pageviews
          FROM daily_stats
          WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2
          ORDER BY date ASC
        `;

        const rows = await sql.unsafe(query, [year, monthStr]);

        const stats = rows.map(row => ({
          formattedDate: row.formatteddate, // postgres returns lowercase keys often
          dayName: row.dayname ? row.dayname.trim() : '',
          date: row.date,
          visitors: Number(row.visitors),
          pageviews: Number(row.pageviews)
        }));

        return { statusCode: 200, headers, body: JSON.stringify({ stats }) };
      }
    }

    // ==========================================
    // DOCTORS
    // ==========================================
    if (path.startsWith('/doctors')) {
      // GET /doctors/grouped (Legacy)
      if (path === '/doctors/grouped' && method === 'GET') {
        const doctors = await sql.unsafe('SELECT * FROM doctors');
        const doctorsData = {};
        for (const doc of doctors) {
          const specialtyKey = createKey(doc.specialty);
          if (!doctorsData[specialtyKey]) {
            // Frontend expects 'title' property for the specialty name
            doctorsData[specialtyKey] = { specialty: doc.specialty, title: doc.specialty, doctors: [] };
          }
          doctorsData[specialtyKey].doctors.push(doc);
        }
        return { statusCode: 200, headers, body: JSON.stringify(doctorsData) };
      }

      // GET /doctors/on-leave
      if (path === '/doctors/on-leave' && method === 'GET') {
        const today = new Date().toISOString().split('T')[0];
        const result = await sql.unsafe('SELECT t2.name AS "NamaDokter", t2.specialty AS "Spesialis", t1.start_date AS "TanggalMulaiCuti", t1.end_date AS "TanggalSelesaiCuti" FROM leave_data t1 JOIN doctors t2 ON t1.doctor_id = t2.id WHERE t1.end_date >= $1 ORDER BY t1.start_date ASC', [today]);
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

        let countQuery = 'SELECT COUNT(*) FROM doctors';
        let doctorsQuery = 'SELECT * FROM doctors';
        let params = [];

        if (search) {
          countQuery += ' WHERE name ILIKE $1 OR specialty ILIKE $2';
          doctorsQuery += ' WHERE name ILIKE $1 OR specialty ILIKE $2';
          params.push('%' + search + '%');
          params.push('%' + search + '%');
        }

        const countResult = await sql.unsafe(countQuery, params);

        doctorsQuery += ` ORDER BY name LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

        const doctors = await sql.unsafe(doctorsQuery, params);

        return { statusCode: 200, headers, body: JSON.stringify({ doctors, total: parseInt(countResult[0].count) }) };
      }

      // POST /doctors (Create)
      if ((path === '/doctors' || path === '/doctors/') && method === 'POST') {
        checkAuth();
        const { name, specialty, image_url, schedule } = JSON.parse(event.body);
        if (!name || !specialty) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Nama dan Spesialisasi wajib.' }) };

        const newDoctor = await sql.unsafe('INSERT INTO doctors(name, specialty, image_url, schedule, updated_at) VALUES($1, $2, $3, $4, NOW()) RETURNING *', [name, specialty, image_url || '', schedule || '{}']);
        return { statusCode: 201, headers, body: JSON.stringify(newDoctor[0]) };
      }

      // GET /doctors/:id
      if (path.match(/^\/doctors\/\d+$/) && method === 'GET') {
        const id = parseInt(path.split('/')[2]);
        const rows = await sql.unsafe('SELECT d.*, s.image_url AS image_url_sstv FROM doctors d LEFT JOIN sstv_images s ON d.id = s.doctor_id WHERE d.id = $1', [id]);
        if (rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Doctor not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(rows[0]) };
      }

      // PUT /doctors/:id or /doctors?id=X
      if ((path.match(/^\/doctors\/\d+$/) || (path === '/doctors' || path === '/doctors/')) && method === 'PUT') {
        checkAuth();

        // Get ID from path param or query param
        let id;
        if (path.match(/^\/doctors\/\d+$/)) {
          id = parseInt(path.split('/')[2]);
        } else if (event.queryStringParameters?.id) {
          id = parseInt(event.queryStringParameters.id);
        } else {
          return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing doctor ID' }) };
        }

        const { name, specialty, image_url, schedule } = JSON.parse(event.body);
        const updated = await sql.unsafe('UPDATE doctors SET name = $1, specialty = $2, image_url = $3, schedule = $4, updated_at = NOW() WHERE id = $5 RETURNING *', [name, specialty, image_url || '', schedule || '{}', id]);
        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Doctor not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }

      // DELETE /doctors/:id or /doctors?id=X
      if ((path.match(/^\/doctors\/\d+$/) || (path === '/doctors' || path === '/doctors/')) && method === 'DELETE') {
        checkAuth();

        // Get ID from path param or query param
        let id;
        if (path.match(/^\/doctors\/\d+$/)) {
          id = parseInt(path.split('/')[2]);
        } else if (event.queryStringParameters?.id) {
          id = parseInt(event.queryStringParameters.id);
        } else {
          return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing doctor ID' }) };
        }

        await sql.unsafe('DELETE FROM doctors WHERE id = $1', [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Doctor deleted' }) };
      }
    }

    // ==========================================
    // SPECIALTIES
    // ==========================================
    if ((path === '/specialties' || path === '/specialties/') && method === 'GET') {
      const rows = await sql.unsafe('SELECT DISTINCT specialty FROM doctors WHERE specialty IS NOT NULL AND specialty != \'\' ORDER BY specialty ASC');
      // Return simple array of strings
      const list = rows.map(r => r.specialty);
      return { statusCode: 200, headers, body: JSON.stringify(list) };
    }

    // ==========================================
    // LEAVE DATA
    // ==========================================
    if (path.startsWith('/leave') || path.startsWith('/leaves')) {
      // GET /leaves or /leave
      if ((path === '/leave' || path === '/leaves' || path === '/leave/' || path === '/leaves/') && method === 'GET') {
        // Return detailed list with doctor info
        const leave = await sql.unsafe('SELECT l.*, d.name AS doctor_name, d.specialty FROM leave_data l JOIN doctors d ON l.doctor_id = d.id ORDER BY l.start_date DESC');
        return { statusCode: 200, headers, body: JSON.stringify(leave) };
      }

      // POST /leaves
      if ((path === '/leave' || path === '/leaves' || path === '/leave/' || path === '/leaves/') && method === 'POST') {
        checkAuth();
        const { doctor_id, start_date, end_date, reason } = JSON.parse(event.body);
        if (!doctor_id || !start_date || !end_date) {
          return { statusCode: 400, headers, body: JSON.stringify({ message: 'doctor_id, start_date, dan end_date wajib.' }) };
        }
        const newLeave = await sql.unsafe('INSERT INTO leave_data(doctor_id, start_date, end_date, reason, created_at) VALUES($1, $2, $3, $4, NOW()) RETURNING *', [doctor_id, start_date, end_date, reason || '']);

        // Send notification (Fire and Forget - Don't block response)
        try {
          const doctorResult = await sql.unsafe('SELECT * FROM doctors WHERE id = $1', [doctor_id]);
          if (doctorResult.length > 0) {
            await sendLeaveNotification(doctorResult[0], start_date, end_date, reason);
          }
        } catch (noteErr) {
          console.error("Notification Error (Non-fatal):", noteErr);
        }

        return { statusCode: 201, headers, body: JSON.stringify(newLeave[0]) };
      }

      // DELETE /leaves (by ID or Cleanup)
      if ((path === '/leave' || path === '/leaves' || path === '/leave/' || path === '/leaves/') && method === 'DELETE') {
        checkAuth();

        // Delete by ID (query param)
        if (event.queryStringParameters?.id) {
          const id = parseInt(event.queryStringParameters.id);
          await sql.unsafe('DELETE FROM leave_data WHERE id = $1', [id]);
          return { statusCode: 200, headers, body: JSON.stringify({ message: 'Leave deleted' }) };
        }

        // Cleanup old leaves
        if (event.queryStringParameters?.cleanup === 'true') {
          const result = await sql.unsafe('DELETE FROM leave_data WHERE end_date < CURRENT_DATE');
          return { statusCode: 200, headers, body: JSON.stringify({ message: 'History cleanup success', deleted: result.count }) };
        }

        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing id or cleanup param' }) };
      }

      // PUT /leaves/:id
      if (path.match(/^\/leaves?\/\d+$/) && method === 'PUT') {
        checkAuth();
        const id = parseInt(path.split('/').pop()); // split by / and take last element which is ID
        const { doctor_id, start_date, end_date, reason } = JSON.parse(event.body);
        const updated = await sql.unsafe('UPDATE leave_data SET doctor_id = $1, start_date = $2, end_date = $3, reason = $4 WHERE id = $5 RETURNING *', [doctor_id, start_date, end_date, reason || '', id]);
        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Leave not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }

      // DELETE /leaves/:id
      if (path.match(/^\/leaves?\/\d+$/) && method === 'DELETE') {
        checkAuth();
        const id = parseInt(path.split('/').pop());
        await sql.unsafe('DELETE FROM leave_data WHERE id = $1', [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Leave deleted' }) };
      }
    }

    // ==========================================
    // CATALOG ITEMS
    // ==========================================
    // ==========================================
    // CATALOG ITEMS (Matches 'catalog_items' table: category (text), is_active (bool))
    // ==========================================
    if (path.startsWith('/catalog-items')) {
      // GET /catalog-items?category=X
      if ((path === '/catalog-items' || path === '/catalog-items/') && method === 'GET') {
        const category = event.queryStringParameters?.category;

        // Use 'catalog_items' table. 
        // Filter by is_active = true unless user is admin? 
        // For now public view shows active. Dashboard might need /all or filter logic.
        // Let's assume this is public facing.
        // But Dashboard uses this too? Dashboard usually sends a token. 
        // If we want dashboard to see all, we might need a separate param or check auth?
        // Let's just return is_active=true for now to be safe for public, 
        // AND add an admin endpoint OR support a query param 'all=true' with auth.
        // Actually api.js usually separates public/admin or uses auth.

        let query = 'SELECT * FROM catalog_items WHERE is_active = true';
        const params = [];

        if (category) {
          query += ' AND category = $1';
          params.push(category);
        }

        query += ' ORDER BY sort_order ASC, created_at DESC';

        const items = await sql.unsafe(query, params);
        return { statusCode: 200, headers, body: JSON.stringify(items) };
      }

      // GET /catalog-items/all (For Dashboard - shows inactive too)
      if (path === '/catalog-items/all' && method === 'GET') {
        checkAuth(); // Protect this
        const category = event.queryStringParameters?.category;
        let query = 'SELECT * FROM catalog_items WHERE 1=1';
        const params = [];

        if (category) {
          query += ' AND category = $1';
          params.push(category);
        }
        query += ' ORDER BY sort_order ASC, created_at DESC';
        const items = await sql.unsafe(query, params);
        return { statusCode: 200, headers, body: JSON.stringify(items) };
      }

      // POST /catalog-items
      if ((path === '/catalog-items' || path === '/catalog-items/') && method === 'POST') {
        checkAuth();
        // Schema: title, price, image_url, category, description, features, sort_order, is_active
        const { title, price, image_url, category, description, features, sort_order, is_active } = JSON.parse(event.body);

        const newItem = await sql.unsafe(`
            INSERT INTO catalog_items (
                title, price, image_url, category, description, 
                features, sort_order, is_active, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
            RETURNING *
          `, [
          title,
          price,
          image_url || '',
          category,
          description || '',
          features ? JSON.stringify(features) : '[]',
          sort_order || 0,
          is_active !== undefined ? is_active : true
        ]);

        return { statusCode: 201, headers, body: JSON.stringify(newItem[0]) };
      }

      // PUT /catalog-items/:id
      // Also handles soft restore (is_active: true)
      // We accept requests to base URL with ?id= query param OR path param. 
      // api.js often uses multiple styles. My ECatalogItemsManager uses ?id= for PUT/DELETE usually, 
      // BUT I standardized ECatalogItemsManager to use path params for DELETE? 
      // Let's check ECatalogItemsManager.jsx lines 294: `${getApiBaseUrl()}/catalog-items?id=${editItem.id}` for PUT/POST? 
      // Wait, line 294: url = ... ?id=...
      // So I must support query param ID for PUT.

      if ((path === '/catalog-items' || path === '/catalog-items/') && method === 'PUT') {
        checkAuth();
        const { id } = event.queryStringParameters || {};
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing ID' }) };

        const { title, price, image_url, category, description, features, sort_order, is_active } = JSON.parse(event.body);

        const updated = await sql.unsafe(`
            UPDATE catalog_items SET 
                title = $1, price = $2, image_url = $3, category = $4, 
                description = $5, features = $6, sort_order = $7, 
                is_active = $8, updated_at = NOW()
            WHERE id = $9
            RETURNING *
          `, [
          title, price, image_url, category, description,
          features ? JSON.stringify(features) : '[]',
          sort_order,
          is_active, // Allow setting to true/false
          id
        ]);

        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Item not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }

      // DELETE /catalog-items (Soft Delete via Query Param ID)
      // ECatalogItemsManager uses ?id= for DELETE too?
      // line 319: fetch(`${getApiBaseUrl()}/catalog-items?id=${id}` ... DELETE)
      if ((path === '/catalog-items' || path === '/catalog-items/') && method === 'DELETE') {
        checkAuth();
        const { id } = event.queryStringParameters || {};
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing ID' }) };

        await sql.unsafe('UPDATE catalog_items SET is_active = false WHERE id = $1', [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Item deleted (soft)' }) };
      }

      // Keep Path Param support too just in case
      if (path.match(/^\/catalog-items\/\d+$/) && method === 'DELETE') {
        checkAuth();
        const id = parseInt(path.split('/').pop());
        await sql.unsafe('UPDATE catalog_items SET is_active = false WHERE id = $1', [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Item deleted (soft)' }) };
      }
    }

    // ==========================================
    // RADIOLOGY PRICES
    // ==========================================
    if (path.startsWith('/radiology')) {
      // GET /radiology?search=...
      if ((path === '/radiology' || path === '/radiology/') && method === 'GET') {
        const search = event.queryStringParameters?.search || '';
        const limit = parseInt(event.queryStringParameters?.limit) || 1000;
        const offset = parseInt(event.queryStringParameters?.offset) || 0;

        let query = 'SELECT * FROM radiology_prices WHERE is_active = true';
        const params = [];

        if (search) {
          // Fuzzy search: Remove hyphens from both DB fields and Search term to match 'x-ray' with 'xray'
          query += ` AND (
                REPLACE(name, '-', '') ILIKE $1 
                OR REPLACE(common_name, '-', '') ILIKE $1 
                OR REPLACE(category, '-', '') ILIKE $1
            )`;
          // Remove hyphens from the search term
          const cleanSearch = search.replace(/-/g, '');
          params.push(`%${cleanSearch}%`);
        }

        query += ' ORDER BY category ASC, name ASC';

        // Add Pagination
        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const items = await sql.unsafe(query, params);
        return { statusCode: 200, headers, body: JSON.stringify(items) };
      }

      // POST /radiology (Admin Single)
      if ((path === '/radiology' || path === '/radiology/') && method === 'POST') {
        checkAuth();
        const { name, common_name, category, price } = JSON.parse(event.body);
        if (!name) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Name is required' }) };

        const newItem = await sql.unsafe(`
            INSERT INTO radiology_prices (name, common_name, category, price, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, true, NOW(), NOW())
            RETURNING *
        `, [name, common_name || '', category || 'General', price || 0]);

        return { statusCode: 201, headers, body: JSON.stringify(newItem[0]) };
      }

      // POST /radiology/batch (Batch Upload)
      if (path === '/radiology/batch' && method === 'POST') {
        checkAuth();
        const items = JSON.parse(event.body); // Expecting array of objects
        if (!Array.isArray(items)) {
          return { statusCode: 400, headers, body: JSON.stringify({ message: 'Input must be an array' }) };
        }

        // Transaction for safety
        const result = await sql.begin(async sql => {
          const inserted = [];
          for (const item of items) {
            const { name, common_name, category, price } = item;
            if (!name) continue; // Skip invalid

            const [newRow] = await sql`
                    INSERT INTO radiology_prices (name, common_name, category, price, is_active, created_at, updated_at)
                    VALUES (${name}, ${common_name || ''}, ${category || 'General'}, ${price || 0}, true, NOW(), NOW())
                    RETURNING *
                  `;
            inserted.push(newRow);
          }
          return inserted;
        });

        return { statusCode: 201, headers, body: JSON.stringify({ message: 'Batch upload success', count: result.length }) };
      }

      // PUT /radiology/:id
      if (path.match(/^\/radiology\/\d+$/) && method === 'PUT') {
        checkAuth();
        const id = parseInt(path.split('/').pop());
        const { name, common_name, category, price, is_active = true } = JSON.parse(event.body);

        const updated = await sql.unsafe(`
              UPDATE radiology_prices 
              SET name = $1, common_name = $2, category = $3, price = $4, is_active = $5, updated_at = NOW()
              WHERE id = $6
              RETURNING *
          `, [name, common_name, category, price, is_active, id]);

        if (updated.length === 0) return { statusCode: 404, headers, body: 'Not Found' };
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }

      // DELETE /radiology/:id
      if (path.match(/^\/radiology\/\d+$/) && method === 'DELETE') {
        checkAuth();
        const id = parseInt(path.split('/').pop());
        await sql.unsafe('UPDATE radiology_prices SET is_active = false WHERE id = $1', [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Deleted (soft)' }) };
      }
    }

    // ==========================================
    // POPUP AD (Multi-Image Support)
    // ==========================================
    if (path === '/popup-ad' || path === '/popup-ad/') {
      if (method === 'GET') {
        const s = await sql.unsafe("SELECT * FROM app_settings WHERE setting_key IN ('popup_ad_images', 'popup_ad_active')");
        const imagesRow = s.find(k => k.setting_key === 'popup_ad_images');
        const activeRow = s.find(k => k.setting_key === 'popup_ad_active');

        let images = [];
        try {
          images = imagesRow ? JSON.parse(imagesRow.setting_value) : [];
        } catch (e) {
          // Fallback for legacy single image string
          if (imagesRow?.setting_value && !imagesRow.setting_value.startsWith('[')) {
            images = [imagesRow.setting_value];
          }
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            images: images,
            active: activeRow?.is_enabled ?? false
          })
        };
      }

      if (method === 'POST') {
        checkAuth();
        const { images, active } = JSON.parse(event.body);

        // Save Images (JSON Array)
        await sql.unsafe(`
            INSERT INTO app_settings (setting_key, setting_value, is_enabled, updated_at)
            VALUES ('popup_ad_images', $1, true, NOW())
            ON CONFLICT (setting_key) DO UPDATE 
            SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
          `, [JSON.stringify(images || [])]);

        // Save Active State
        await sql.unsafe(`
            INSERT INTO app_settings (setting_key, setting_value, is_enabled, updated_at)
            VALUES ('popup_ad_active', 'true', $1, NOW())
            ON CONFLICT (setting_key) DO UPDATE 
            SET is_enabled = EXCLUDED.is_enabled, updated_at = NOW()
          `, [active]);

        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Popup settings saved', images, active }) };
      }
    }

    // ==========================================
    // MCU PACKAGES
    // ==========================================
    if (path.startsWith('/mcu-packages')) {
      // GET /mcu-packages/all
      if ((path === '/mcu-packages/all' || path === '/mcu-packages/all/') && method === 'GET') {
        const pkgs = await sql.unsafe('SELECT * FROM mcu_packages ORDER BY display_order ASC, created_at DESC');
        return { statusCode: 200, headers, body: JSON.stringify(pkgs) };
      }

      // POST /mcu-packages
      if ((path === '/mcu-packages' || path === '/mcu-packages/') && method === 'POST') {
        checkAuth();
        const { package_id, name, price, base_price, image_url, is_pelaut, is_recommended, items, addons, is_enabled = true, display_order = 0 } = JSON.parse(event.body);

        await sql.unsafe(`
          INSERT INTO mcu_packages (
            package_id, name, price, base_price, image_url, 
            is_pelaut, is_recommended, items, addons, 
            is_enabled, display_order, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        `, [
          package_id, name, price, base_price || null, image_url || '',
          is_pelaut || false, is_recommended || false,
          JSON.stringify(items || []), addons ? JSON.stringify(addons) : null,
          is_enabled, display_order
        ]);

        return { statusCode: 201, headers, body: JSON.stringify({ message: 'Package created' }) };
      }

      // PUT /mcu-packages/:id
      if (path.match(/^\/mcu-packages\/\d+$/) && method === 'PUT') {
        checkAuth();
        const id = parseInt(path.split('/').pop());
        const { package_id, name, price, base_price, image_url, is_pelaut, is_recommended, items, addons, is_enabled, display_order } = JSON.parse(event.body);

        await sql.unsafe(`
          UPDATE mcu_packages SET 
            package_id = $1, name = $2, price = $3, base_price = $4, 
            image_url = $5, is_pelaut = $6, is_recommended = $7, 
            items = $8, addons = $9, is_enabled = $10, display_order = $11,
            updated_at = NOW()
          WHERE id = $12
        `, [
          package_id, name, price, base_price || null, image_url || '',
          is_pelaut || false, is_recommended || false,
          JSON.stringify(items || []), addons ? JSON.stringify(addons) : null,
          is_enabled, display_order, id
        ]);

        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Package updated' }) };
      }

      // DELETE /mcu-packages/:id
      if (path.match(/^\/mcu-packages\/\d+$/) && method === 'DELETE') {
        checkAuth();
        const id = parseInt(path.split('/').pop());
        await sql.unsafe('DELETE FROM mcu_packages WHERE id = $1', [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Package deleted' }) };
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
        const newPromo = await sql.unsafe('INSERT INTO promos(title, content, image_url, sort_order, is_active, created_at, updated_at) VALUES($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *', [title || '', content || '', image_url || '', sort_order, is_active]);
        return { statusCode: 201, headers, body: JSON.stringify(newPromo[0]) };
      }

      // PUT /promos/:id or /promos?id=X
      if ((path.match(/^\/promos\/\d+$/) || (path === '/promos' || path === '/promos/')) && method === 'PUT') {
        checkAuth();

        // Get ID from path param or query param
        let id;
        if (path.match(/^\/promos\/\d+$/)) {
          id = parseInt(path.split('/')[2]);
        } else if (event.queryStringParameters?.id) {
          id = parseInt(event.queryStringParameters.id);
        } else {
          return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing promo ID' }) };
        }

        const { title, content, image_url, sort_order, is_active } = JSON.parse(event.body);
        const updated = await sql.unsafe('UPDATE promos SET title = $1, content = $2, image_url = $3, sort_order = $4, is_active = $5, updated_at = NOW() WHERE id = $6 RETURNING *', [title, content, image_url, sort_order, is_active, id]);
        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Promo not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }

      // DELETE /promos/:id or /promos?id=X
      if ((path.match(/^\/promos\/\d+$/) || (path === '/promos' || path === '/promos/')) && method === 'DELETE') {
        checkAuth();

        // Get ID from path param or query param
        let id;
        if (path.match(/^\/promos\/\d+$/)) {
          id = parseInt(path.split('/')[2]);
        } else if (event.queryStringParameters?.id) {
          id = parseInt(event.queryStringParameters.id);
        } else {
          return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing promo ID' }) };
        }

        await sql.unsafe('DELETE FROM promos WHERE id = $1', [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Promo deleted' }) };
      }
    }

    // ==========================================
    // SSTV IMAGES (Compatible with SstvManager.jsx)
    // ==========================================
    if (path.startsWith('/sstv') || path.startsWith('/sstv_images')) {
      // GET /sstv_images (Returns object map: { [doctor_id]: url, [promo_id]: url })
      if ((path === '/sstv_images' || path === '/sstv_images/') && method === 'GET') {
        const images = await sql.unsafe('SELECT * FROM sstv_images');
        const map = {};
        for (const img of images) {
          if (img.doctor_id) map[img.doctor_id] = img.image_url;
          if (img.promo_id) map[img.promo_id] = img.image_url;
        }
        return { statusCode: 200, headers, body: JSON.stringify(map) };
      }

      // POST /sstv_images
      if ((path === '/sstv_images' || path === '/sstv_images/') && method === 'POST') {
        checkAuth();
        const { doctor_id, promo_id, image_url } = JSON.parse(event.body);

        if (doctor_id) {
          await sql.unsafe('INSERT INTO sstv_images(doctor_id, image_url, uploaded_at) VALUES($1, $2, NOW()) ON CONFLICT (doctor_id) DO UPDATE SET image_url = $2, uploaded_at = NOW()', [doctor_id, image_url]);
        } else if (promo_id) {
          await sql.unsafe('INSERT INTO sstv_images(promo_id, image_url, uploaded_at) VALUES($1, $2, NOW()) ON CONFLICT (promo_id) DO UPDATE SET image_url = $2, uploaded_at = NOW()', [promo_id, image_url]);
        }

        return { statusCode: 200, headers, body: JSON.stringify({ message: 'SSTV image uploaded' }) };
      }

      // Legacy /sstv routes support ...
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
        await sql.unsafe('INSERT INTO sstv_images(doctor_id, image_url, uploaded_at) VALUES($1, $2, NOW()) ON CONFLICT (doctor_id) DO UPDATE SET image_url = $2, uploaded_at = NOW()', [doctor_id, image_url]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'SSTV image uploaded' }) };
      }

      // POST /sstv/promos/:promo_id
      if (path.match(/^\/sstv\/promos\/\d+$/) && method === 'POST') {
        checkAuth();
        const promo_id = parseInt(path.split('/')[3]);
        const { image_url } = JSON.parse(event.body);
        await sql.unsafe('INSERT INTO sstv_images(promo_id, image_url, uploaded_at) VALUES($1, $2, NOW()) ON CONFLICT (promo_id) DO UPDATE SET image_url = $2, uploaded_at = NOW()', [promo_id, image_url]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'SSTV image uploaded' }) };
      }

      // DELETE /sstv/doctors/:doctor_id
      if (path.match(/^\/sstv\/doctors\/\d+$/) && method === 'DELETE') {
        checkAuth();
        const doctor_id = parseInt(path.split('/')[3]);
        await sql.unsafe('DELETE FROM sstv_images WHERE doctor_id = $1', [doctor_id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'SSTV image deleted' }) };
      }

      // DELETE /sstv/promos/:promo_id
      if (path.match(/^\/sstv\/promos\/\d+$/) && method === 'DELETE') {
        checkAuth();
        const promo_id = parseInt(path.split('/')[3]);
        await sql.unsafe('DELETE FROM sstv_images WHERE promo_id = $1', [promo_id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'SSTV image deleted' }) };
      }
    }

    // ==========================================
    // ECATALOG
    // ==========================================


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
        const newAd = await sql.unsafe('INSERT INTO popup_ads(title, image_url, link_url, is_active, created_at) VALUES($1, $2, $3, $4, NOW()) RETURNING *', [title || '', image_url || '', link_url || '', is_active]);
        return { statusCode: 201, headers, body: JSON.stringify(newAd[0]) };
      }

      // PUT /popup-ad/:id
      if (path.match(/^\/popup-ad\/\d+$/) && method === 'PUT') {
        checkAuth();
        const id = parseInt(path.split('/')[2]);
        const { title, image_url, link_url, is_active } = JSON.parse(event.body);
        const updated = await sql.unsafe('UPDATE popup_ads SET title = $1, image_url = $2, link_url = $3, is_active = $4 WHERE id = $5 RETURNING *', [title, image_url, link_url, is_active, id]);
        if (!updated) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Popup ad not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }

      // DELETE /popup-ad/:id
      if (path.match(/^\/popup-ad\/\d+$/) && method === 'DELETE') {
        checkAuth();
        const id = parseInt(path.split('/')[2]);
        await sql.unsafe('DELETE FROM popup_ads WHERE id = $1', [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Popup ad deleted' }) };
      }
    }

    // ==========================================
    // E-NEWSLETTER
    // ==========================================
    // GET /newsletter-archive
    if (path === '/newsletter-archive' && method === 'GET') {
      const { page = 1, limit = 20, admin = 'false' } = event.queryStringParameters || {};
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE 1=1';
      const params = [limit, offset];

      if (admin !== 'true') {
        whereClause += ' AND is_published = true';
      }

      const newsletters = await sql.unsafe(`SELECT * FROM newsletters ${whereClause} ORDER BY year DESC, month DESC LIMIT $1 OFFSET $2`, params);
      const count = await sql.unsafe(`SELECT count(*) FROM newsletters ${whereClause}`);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          newsletters,
          total: parseInt(count[0].count),
          page: parseInt(page),
          limit: parseInt(limit)
        })
      };
    }

    // GET, PUT, DELETE /newsletter-issue
    if (path === '/newsletter-issue') {
      // GET (By Year/Month or ID)
      if (method === 'GET') {
        const { id, year, month } = event.queryStringParameters || {};
        let result;

        if (id) {
          result = await sql.unsafe('SELECT * FROM newsletters WHERE id = $1', [id]);
        } else if (year && month) {
          result = await sql.unsafe('SELECT * FROM newsletters WHERE year = $1 AND month = $2', [year, month]);
        } else {
          return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing id or year/month' }) };
        }

        if (result.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Newsletter not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
      }

      // PUT (Toggle Publish)
      if (method === 'PUT') {
        checkAuth();
        const { id } = event.queryStringParameters || {};
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing ID' }) };

        const current = await sql.unsafe('SELECT is_published FROM newsletters WHERE id = $1', [id]);
        if (current.length === 0) return { statusCode: 404, headers, body: JSON.stringify({ message: 'Not found' }) };

        const newStatus = !current[0].is_published;
        await sql.unsafe('UPDATE newsletters SET is_published = $1 WHERE id = $2', [newStatus, id]);

        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Status updated', is_published: newStatus }) };
      }

      // DELETE
      if (method === 'DELETE') {
        checkAuth();
        const { id } = event.queryStringParameters || {};
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing ID' }) };

        await sql.unsafe('DELETE FROM newsletters WHERE id = $1', [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Deleted' }) };
      }
    }

    // POST /newsletter-upsert
    if (path === '/newsletter-upsert' && method === 'POST') {
      checkAuth();
      const { id, year, month, title, description, pdf_url, cloudinary_public_id } = JSON.parse(event.body);

      // Check existing (Prevent duplicate Year/Month unless editing same ID)
      const existing = await sql.unsafe('SELECT id FROM newsletters WHERE year = $1 AND month = $2', [year, month]);
      if (existing.length > 0 && (!id || existing[0].id != id)) {
        return { statusCode: 409, headers, body: JSON.stringify({ message: `Newsletter for ${month}/${year} already exists` }) };
      }

      let result;
      if (id) {
        // Update
        result = await sql.unsafe(
          `UPDATE newsletters SET year=$1, month=$2, title=$3, description=$4, pdf_url=$5, cloudinary_public_id=$6, updated_at=NOW() WHERE id=$7 RETURNING *`,
          [year, month, title, description, pdf_url, cloudinary_public_id, id]
        );
      } else {
        // Insert
        result = await sql.unsafe(
          `INSERT INTO newsletters (year, month, title, description, pdf_url, cloudinary_public_id, is_published, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW()) RETURNING *`,
          [year, month, title, description, pdf_url, cloudinary_public_id]
        );
      }

      return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
    }


    // ==========================================
    // POSTS (Articles)
    // ==========================================
    if (path.startsWith('/posts')) {
      // GET /posts


      // GET /posts/all
      if (path === '/posts/all' && method === 'GET') {
        const posts = await sql.unsafe('SELECT * FROM posts ORDER BY created_at DESC');
        return { statusCode: 200, headers, body: JSON.stringify(posts) };
      }

      // GET /posts (with options)
      if ((path === '/posts' || path === '/posts/') && method === 'GET') {
        const { limit, category, status, admin } = event.queryStringParameters || {};
        let query = 'SELECT * FROM posts';
        const params = [];
        const conditions = [];

        // If admin=true, do NOT default to is_active=true
        if (admin !== 'true') {
          if (status) {
            conditions.push('status = $' + (params.length + 1));
            params.push(status);
          } else {
            conditions.push('is_active = true');
          }
        } else {
          // Admin mode: if status is explicitly provided, use it, otherwise show all
          if (status) {
            conditions.push('status = $' + (params.length + 1));
            params.push(status);
          }
        }

        if (category) {
          conditions.push('category = $' + (params.length + 1));
          params.push(category);
        }

        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        if (limit) {
          query += ' LIMIT $' + (params.length + 1);
          params.push(parseInt(limit));
        }

        const posts = await sql.unsafe(query, params);
        // Map old structure to support legacy
        // But table should be fixed by repair_db
        return { statusCode: 200, headers, body: JSON.stringify({ posts }) };
      }

      // GET /posts/:id
      if (path.match(/^\/posts\/\d+$/) && method === 'GET') {
        const id = parseInt(path.split('/')[2]);
        const rows = await sql.unsafe('SELECT * FROM posts WHERE id = $1', [id]);
        if (rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Post not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(rows[0]) };
      }

      // POST /posts
      if ((path === '/posts' || path === '/posts/') && method === 'POST') {
        checkAuth();
        const { title, content, image_url, is_active = true, slug, excerpt, category, tags, status } = JSON.parse(event.body);
        const newPost = await sql.unsafe(`
            INSERT INTO posts (
                title, content, image_url, is_active, slug, excerpt, category, tags, status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) 
            RETURNING *
        `, [
          title,
          content || '',
          image_url || '',
          is_active,
          slug || '',
          excerpt || '',
          category || 'article',
          tags || '',
          status || 'draft'
        ]);
        return { statusCode: 201, headers, body: JSON.stringify(newPost[0]) };
      }

      // PUT /posts/:id or /posts?id=X
      if ((path.match(/^\/posts\/\d+$/) || (path === '/posts' || path === '/posts/')) && method === 'PUT') {
        checkAuth();

        // Get ID from path param or query param
        let id;
        if (path.match(/^\/posts\/\d+$/)) {
          id = parseInt(path.split('/')[2]);
        } else if (event.queryStringParameters?.id) {
          id = parseInt(event.queryStringParameters.id);
        } else {
          return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing post ID' }) };
        }

        const { title, content, image_url, is_active, slug, excerpt, category, tags, status } = JSON.parse(event.body);

        const updated = await sql.unsafe(`
            UPDATE posts SET 
                title = $1, content = $2, image_url = $3, is_active = $4, 
                slug = $5, excerpt = $6, category = $7, tags = $8, status = $9,
                updated_at = NOW() 
            WHERE id = $10 
            RETURNING *
        `, [
          title,
          content,
          image_url,
          is_active,
          slug,
          excerpt,
          category,
          tags,
          status,
          id
        ]);

        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Post not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }

      // DELETE /posts/:id or /posts?id=X
      if ((path.match(/^\/posts\/\d+$/) || (path === '/posts' || path === '/posts/')) && method === 'DELETE') {
        checkAuth();

        // Get ID from path param or query param
        let id;
        if (path.match(/^\/posts\/\d+$/)) {
          id = parseInt(path.split('/')[2]);
        } else if (event.queryStringParameters?.id) {
          id = parseInt(event.queryStringParameters.id);
        } else {
          return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing post ID' }) };
        }

        await sql.unsafe('DELETE FROM posts WHERE id = $1', [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Post deleted' }) };
      }
    }

    // ==========================================
    // DEVICE HEARTBEAT
    // ==========================================
    // ==========================================
    // DEVICE HEARTBEAT
    // ==========================================
    if (path === '/device-heartbeat' && method === 'POST') {
      const body = JSON.parse(event.body);

      // Action-based routing for cleaner logic
      const action = body.action || 'heartbeat';

      if (action === 'heartbeat') {
        const { device_id, device_name, last_ip, friendly_name, browser_info, current_slide } = body;
        if (!device_id) return { statusCode: 400, headers, body: JSON.stringify({ message: 'device_id required' }) };

        await sql.unsafe(`
              INSERT INTO device_heartbeats (
                  device_id, friendly_name, last_heartbeat, ip_address, browser_info, current_slide, status, last_seen, last_ip, device_name
              ) VALUES ($1, $2, NOW(), $3, $4, $5, 'online', NOW(), $3, $2)
              ON CONFLICT (device_id) DO UPDATE SET 
                  last_heartbeat = NOW(),
                  last_seen = NOW(), -- Legacy
                  status = 'online',
                  ip_address = $3,
                  last_ip = $3, -- Legacy
                  browser_info = COALESCE($4, device_heartbeats.browser_info),
                  current_slide = COALESCE($5, device_heartbeats.current_slide)
                  -- Don't overwrite friendly_name if null, but maybe device_name is sent?
          `, [
          device_id,
          friendly_name || device_name || '',
          last_ip || event.headers['client-ip'] || 'unknown',
          browser_info,
          current_slide
        ]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Heartbeat recorded' }) };
      }

      if (action === 'update_meta') {
        checkAuth();
        const { deviceId, friendlyName, isPinned } = body;

        if (friendlyName !== undefined) {
          await sql.unsafe('UPDATE device_heartbeats SET friendly_name = $1 WHERE device_id = $2', [friendlyName, deviceId]);
        }
        if (isPinned !== undefined) {
          await sql.unsafe('UPDATE device_heartbeats SET is_pinned = $1 WHERE device_id = $2', [isPinned, deviceId]);
        }
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Device meta updated' }) };
      }

      if (action === 'trigger_refresh') {
        // This usually requires query param in GET, but let's support POST too
        // Wait, SstvManager sends GET for trigger_refresh
      }

      if (action === 'delete') {
        checkAuth();
        const { deviceId } = body;
        await sql.unsafe('DELETE FROM device_heartbeats WHERE device_id = $1', [deviceId]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Device deleted' }) };
      }
    }

    // GET /device-heartbeat
    if ((path === '/device-heartbeat' || path === '/device-heartbeat/') && method === 'GET') {
      const action = event.queryStringParameters?.action;

      if (action === 'trigger_refresh') {
        const { deviceId } = event.queryStringParameters;
        await sql.unsafe('UPDATE device_heartbeats SET refresh_trigger = true WHERE device_id = $1', [deviceId]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Refresh trigger set' }) };
      }

      // List all
      const devices = await sql.unsafe('SELECT * FROM device_heartbeats ORDER BY last_heartbeat DESC');
      return { statusCode: 200, headers, body: JSON.stringify(devices) };
    }

    // ==========================================
    // NEWSLETTER ARCHIVE
    // ==========================================
    if (path.startsWith('/newsletter-archive')) {
      if (method === 'GET') {
        const { limit = '20', page = '1', admin } = event.queryStringParameters || {};
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = 'SELECT * FROM newsletters';
        if (admin !== 'true') {
          query += ' WHERE is_published = true';
        }
        query += ` ORDER BY year DESC, month DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;

        const newsletters = await sql.unsafe(query);
        return { statusCode: 200, headers, body: JSON.stringify(newsletters) };
      }
    }

    // ==========================================
    // CATALOG ITEMS 
    // ==========================================
    // GET /catalog-items (public, non-deleted items)


    // ==========================================
    // ADMIN LOGIN
    // ==========================================
    // Support both /admin/login and /login
    if ((path === '/admin/login' || path === '/login') && method === 'POST') {
      const { password } = JSON.parse(event.body);
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

      if (password === adminPassword) {
        return {
          statusCode: 200,
          headers: {
            ...headers,
            // 'Set-Cookie': ... (Moved to multiValueHeaders)
          },
          multiValueHeaders: {
            'Set-Cookie': [
              'adminAuth=' + adminPassword + '; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=2592000',
              'adminSession=true; Path=/; Secure; SameSite=None; Max-Age=2592000'
            ]
          },
          body: JSON.stringify({ message: 'Login successful' })
        };
        return { statusCode: 401, headers, body: JSON.stringify({ message: 'Invalid password' }) };
      }
    }


    // GET /mcu-packages (Public for Client)
    if (path === '/mcu-packages' && method === 'GET') {
      try {
        // Query DB
        const items = await sql.unsafe('SELECT * FROM mcu_packages ORDER BY id ASC');
        return { statusCode: 200, headers, body: JSON.stringify(items) };
      } catch (err) {
        console.error('Failed to fetch mcu packages:', err);
        return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
      }
    }

    // GET /admin/logout
    if (path === '/admin/logout' && method === 'GET') {
      return {
        statusCode: 200,
        headers: {
          ...headers,
        },
        multiValueHeaders: {
          'Set-Cookie': [
            'adminAuth=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0',
            'adminSession=; Path=/; Secure; SameSite=None; Max-Age=0'
          ]
        },
        body: JSON.stringify({ message: 'Logged out' })
      };
    }

    // DEBUG ECATALOG
    if (path === '/debug-ecatalog' && method === 'GET') {
      try {
        // Test 1: Check DB Connection via app_settings
        await sql.unsafe('SELECT 1 FROM app_settings LIMIT 1');

        // Test 2: Check ecatalog_items
        const count = await sql.unsafe('SELECT count(*) FROM ecatalog_items');
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Table exists', count: count[0].count }) };
      } catch (err) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            message: 'Check failed',
            error: err.message,
            stack: err.stack,
            db_url_exists: !!process.env.NEON_DATABASE_URL
          })
        };
      }
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