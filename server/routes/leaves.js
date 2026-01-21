import { Hono } from 'hono';
import sql from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = new Hono();

// GET /leaves
router.get('/', async (c) => {
    const leaves = await sql`
    SELECT t1.id, t1.start_date, t1.end_date, t2.name AS doctor_name
    FROM leave_data t1 JOIN doctors t2 ON t1.doctor_id = t2.id
    ORDER BY t1.start_date DESC
  `;
    return c.json(leaves);
});

// POST /leaves
router.post('/', requireAuth, async (c) => {
    console.log('[API] POST /leaves received');
    const { doctor_id, start_date, end_date } = await c.req.json();
    console.log('[API] POST Body:', { doctor_id, start_date, end_date });

    if (!doctor_id || !start_date || !end_date) {
        return c.json({ message: 'Semua field wajib.' }, 400);
    }

    const [doctor] = await sql`SELECT name FROM doctors WHERE id = ${doctor_id}`;
    const [newLeave] = await sql`
    INSERT INTO leave_data(doctor_id, start_date, end_date) 
    VALUES(${doctor_id}, ${start_date}, ${end_date})
    RETURNING id, start_date, end_date
  `;
    console.log('[API] Created leave:', newLeave.id);

    // TODO: Implement OneSignal notification if needed
    // sendLeaveNotification(doctor?.name || 'Dokter', newLeave.start_date, newLeave.end_date);

    return c.json(newLeave, 201);
});

// DELETE /leaves
router.delete('/', requireAuth, async (c) => {
    const { id, cleanup } = c.req.query();
    console.log('[API] DELETE /leaves received, ID:', id, 'Cleanup:', cleanup);

    if (cleanup === 'true') {
        const result = await sql`DELETE FROM leave_data WHERE end_date < CURRENT_DATE`;
        console.log('[API] Cleanup count:', result.count);
        return c.json({ message: 'Cleaned' });
    }

    if (!id) {
        return c.json({ message: 'ID required' }, 400);
    }

    await sql`DELETE FROM leave_data WHERE id = ${id}`;
    console.log('[API] Deleted leave:', id);
    return c.json({ message: 'Deleted' });
});

export default router;
