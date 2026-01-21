import { Hono } from 'hono';
import sql from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = new Hono();

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

// GET /doctors/grouped (Legacy)
router.get('/grouped', async (c) => {
    try {
        const doctors = await sql`
      SELECT d.id, d.name, d.specialty, d.schedule, d.image_url, d.updated_at, s.image_url AS image_url_sstv 
      FROM doctors d LEFT JOIN sstv_images s ON d.id = s.doctor_id ORDER BY d.name
    `;

        const doctorsData = {};
        for (const doc of doctors) {
            const specialtyKey = createKey(doc.specialty);
            if (!doctorsData[specialtyKey]) {
                doctorsData[specialtyKey] = { title: doc.specialty, doctors: [] };
            }
            doctorsData[specialtyKey].doctors.push({
                id: doc.id,
                name: doc.name,
                image_url: doc.image_url,
                image_url_sstv: doc.image_url_sstv,
                schedule: doc.schedule,
                updated_at: doc.updated_at
            });
        }

        return c.json(doctorsData);
    } catch (error) {
        console.error('[API Error] /doctors/grouped:', error);
        return c.json({ message: 'Error fetching grouped doctors', error: error.message }, 500);
    }
});

// GET /doctors/on-leave
router.get('/on-leave', async (c) => {
    try {
        // Use local date for Indonesia (WIB) - approximation
        const now = new Date();
        const offset = 7 * 60 * 60 * 1000; // UTC+7
        const localDate = new Date(now.getTime() + offset);
        const today = localDate.toISOString().split('T')[0];

        console.log(`[API] Fetching leaves for date: ${today} (UTC+7 approximation)`);

        const result = await sql`
      SELECT 
        t2.name as "NamaDokter", 
        t2.specialty as "Spesialis", 
        t1.start_date as "TanggalMulaiCuti", 
        t1.end_date as "TanggalSelesaiCuti"
      FROM leave_data t1 JOIN doctors t2 ON t1.doctor_id = t2.id
      WHERE t1.end_date >= ${today}
      ORDER BY t1.start_date ASC
    `;
        console.log(`[API] Found ${result.length} leaves`);
        return c.json(result);
        return c.json(result);
    } catch (error) {
        console.error('[API Error] /doctors/on-leave:', error);
        return c.json({ message: 'Error fetching leave data', error: error.message }, 500);
    }
});

// GET /doctors/all (Minimal)
router.get('/all', async (c) => {
    try {
        const doctors = await sql`SELECT id, name, specialty FROM doctors ORDER BY name`;
        return c.json(doctors);
    } catch (error) {
        console.error('[API Error] /doctors/all:', error);
        return c.json({ message: 'Error fetching doctors', error: error.message }, 500);
    }
});

// GET /doctors (List with search)
router.get('/', async (c) => {
    try {
        const { page = '1', limit = '30', search = '' } = c.req.query();
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const searchFilter = search
            ? sql`WHERE name ILIKE ${'%' + search + '%'} OR specialty ILIKE ${'%' + search + '%'}`
            : sql``;

        const [countResult] = await sql`SELECT COUNT(*) FROM doctors ${searchFilter}`;
        const doctors = await sql`SELECT * FROM doctors ${searchFilter} ORDER BY name LIMIT ${limit} OFFSET ${offset}`;

        return c.json({ doctors, total: parseInt(countResult.count) });
    } catch (error) {
        console.error('[API Error] /doctors:', error);
        return c.json({ message: 'Error fetching doctors', error: error.message }, 500);
    }
});

// POST /doctors (Create)
router.post('/', requireAuth, async (c) => {
    try {
        console.log('[API] POST /doctors received');
        const { name, specialty, image_url, schedule } = await c.req.json();
        console.log('[API] POST Body:', { name, specialty });

        if (!name || !specialty) {
            return c.json({ message: 'Nama dan Spesialisasi wajib.' }, 400);
        }

        const [newDoctor] = await sql`
      INSERT INTO doctors(name, specialty, image_url, schedule)
      VALUES(${name}, ${specialty}, ${image_url || ''}, ${schedule || '{}'})
      RETURNING *
    `;
        console.log('[API] Created doctor:', newDoctor.id);

        return c.json(newDoctor, 201);
    } catch (error) {
        console.error('[API Error] POST /doctors:', error);
        return c.json({ message: 'Error creating doctor', error: error.message }, 500);
    }
});

// PUT /doctors (Update)
router.put('/', requireAuth, async (c) => {
    try {
        const { id } = c.req.query();
        console.log('[API] PUT /doctors received, ID:', id);

        if (!id) {
            return c.json({ message: 'ID dibutuhkan' }, 400);
        }

        const { name, specialty, image_url, schedule } = await c.req.json();
        console.log('[API] PUT Body:', { name, specialty });

        const [updated] = await sql`
      UPDATE doctors 
      SET name = ${name}, specialty = ${specialty}, image_url = ${image_url}, schedule = ${schedule}
      WHERE id = ${id} 
      RETURNING *
    `;
        console.log('[API] Updated doctor:', updated?.id);

        return c.json(updated);
    } catch (error) {
        console.error('[API Error] PUT /doctors:', error);
        return c.json({ message: 'Error updating doctor', error: error.message }, 500);
    }
});

// DELETE /doctors
router.delete('/', requireAuth, async (c) => {
    try {
        const { id } = c.req.query();
        console.log('[API] DELETE /doctors received, ID:', id);

        if (!id) {
            return c.json({ message: 'ID dibutuhkan' }, 400);
        }

        await sql`DELETE FROM doctors WHERE id = ${id}`;
        console.log('[API] Deleted doctor:', id);
        return c.json({ message: 'Deleted' });
    } catch (error) {
        console.error('[API Error] DELETE /doctors:', error);
        return c.json({ message: 'Error deleting doctor', error: error.message }, 500);
    }
});

// POST /doctors/reset-updates (Reset Notification Timestamps)
router.post('/reset-updates', requireAuth, async (c) => {
    try {
        // Reset updated_at to a safe past date for ALL doctors
        await sql`UPDATE doctors SET updated_at = '2000-01-01 00:00:00'`;
        return c.json({ message: 'All notification timestamps reset successfully' });
    } catch (error) {
        console.error('[API Error] POST /doctors/reset-updates:', error);
        return c.json({ message: 'Error resetting timestamps', error: error.message }, 500);
    }
});

export default router;
