import { Hono } from 'hono';
import sql from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = new Hono();

// GET /mcu-packages (public - enabled only)
router.get('/', async (c) => {
    const packages = await sql`
    SELECT * FROM mcu_packages 
    WHERE is_enabled = true 
    ORDER BY display_order ASC, id ASC
  `;
    return c.json(packages);
});

// GET /mcu-packages/all (admin - all packages)
router.get('/all', requireAuth, async (c) => {
    const packages = await sql`
    SELECT * FROM mcu_packages 
    ORDER BY display_order ASC, id ASC
  `;
    return c.json(packages);
});

// GET /mcu-packages/:id
router.get('/:id', requireAuth, async (c) => {
    const id = c.req.param('id');

    if (id === 'all') {
        // Handled by /all route
        return c.json({ message: 'Use /mcu-packages/all' }, 400);
    }

    const [pkg] = await sql`SELECT * FROM mcu_packages WHERE id = ${id}`;

    if (!pkg) {
        return c.json({ message: 'Not found' }, 404);
    }

    return c.json(pkg);
});

// POST /mcu-packages
router.post('/', requireAuth, async (c) => {
    const body = await c.req.json();
    const { package_id, name, price, base_price, image_url, is_pelaut, is_recommended, items, addons, display_order } = body;

    const [newPkg] = await sql`
    INSERT INTO mcu_packages(
      package_id, name, price, base_price, image_url, is_pelaut, is_recommended, items, addons, display_order
    ) VALUES(
      ${package_id}, ${name}, ${price}, ${base_price || null}, ${image_url || null}, 
      ${is_pelaut || false}, ${is_recommended || false}, ${JSON.stringify(items)}, 
      ${addons ? JSON.stringify(addons) : null}, ${display_order || 0}
    ) RETURNING *
  `;

    return c.json(newPkg, 201);
});

// PUT /mcu-packages/:id
router.put('/:id', requireAuth, async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { package_id, name, price, base_price, image_url, is_pelaut, is_recommended, items, addons, is_enabled, display_order } = body;

    const [updated] = await sql`
    UPDATE mcu_packages SET
      package_id = ${package_id}, name = ${name}, price = ${price}, base_price = ${base_price || null}, 
      image_url = ${image_url || null}, is_pelaut = ${is_pelaut || false}, is_recommended = ${is_recommended || false}, 
      items = ${JSON.stringify(items)}, addons = ${addons ? JSON.stringify(addons) : null}, 
      is_enabled = ${is_enabled !== undefined ? is_enabled : true}, display_order = ${display_order || 0}, 
      updated_at = NOW()
    WHERE id = ${id} 
    RETURNING *
  `;

    return c.json(updated);
});

// DELETE /mcu-packages/:id (soft delete)
router.delete('/:id', requireAuth, async (c) => {
    const id = c.req.param('id');

    await sql`UPDATE mcu_packages SET is_enabled = false WHERE id = ${id}`;
    return c.json({ message: 'Disabled' });
});

export default router;
