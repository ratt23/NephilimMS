import { Hono } from 'hono';
import sql from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = new Hono();

// GET /promos
router.get('/', async (c) => {
    const promos = await sql`SELECT * FROM promo_images ORDER BY sort_order ASC`;
    return c.json(promos);
});

// POST /promos
router.post('/', requireAuth, async (c) => {
    const { image_url, alt_text } = await c.req.json();

    if (!image_url) {
        return c.json({ message: 'URL wajib.' }, 400);
    }

    const [maxOrder] = await sql`SELECT MAX(sort_order) as max FROM promo_images`;
    const newOrder = (maxOrder.max ? parseInt(maxOrder.max, 10) : 0) + 1;

    const [newPromo] = await sql`
    INSERT INTO promo_images(image_url, alt_text, sort_order) 
    VALUES(${image_url}, ${alt_text || ''}, ${newOrder}) 
    RETURNING *
  `;

    return c.json(newPromo, 201);
});

// PUT /promos
router.put('/', requireAuth, async (c) => {
    const { id } = c.req.query();

    if (!id) {
        return c.json({ message: 'ID required' }, 400);
    }

    const { alt_text } = await c.req.json();

    const [updated] = await sql`
    UPDATE promo_images SET alt_text = ${alt_text} 
    WHERE id = ${id} 
    RETURNING *
  `;

    return c.json(updated);
});

// DELETE /promos
router.delete('/', requireAuth, async (c) => {
    const { id } = c.req.query();

    if (!id) {
        return c.json({ message: 'ID required' }, 400);
    }

    await sql`DELETE FROM promo_images WHERE id = ${id}`;
    return c.json({ message: 'Deleted' });
});

// POST /promos/reorder
router.post('/reorder', requireAuth, async (c) => {
    const { orderedIds } = await c.req.json();

    if (!orderedIds || !Array.isArray(orderedIds)) {
        return c.json({ message: 'orderedIds required' }, 400);
    }

    await sql.begin(async sql => {
        await sql`
      UPDATE promo_images AS p
      SET sort_order = temp.new_order
      FROM (SELECT id, ROW_NUMBER() OVER() AS new_order FROM UNNEST(${orderedIds}::int[]) AS id) AS temp
      WHERE p.id = temp.id
    `;
    });

    return c.json({ message: 'Reordered' });
});

export default router;
