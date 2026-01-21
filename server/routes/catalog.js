import { Hono } from 'hono';
import sql from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = new Hono();

// Mounted at /catalog-items (see server/index.js)

// GET / (public - active only)
router.get('/', async (c) => {
  const { category } = c.req.query();

  let items;
  if (category) {
    items = await sql`
      SELECT * FROM catalog_items 
      WHERE category = ${category} AND is_active = true
      ORDER BY sort_order ASC, created_at DESC
    `;
  } else {
    items = await sql`
      SELECT * FROM catalog_items 
      WHERE is_active = true
      ORDER BY category ASC, sort_order ASC, created_at DESC
    `;
  }

  return c.json(items);
});

// GET /all (admin - all items)
router.get('/all', requireAuth, async (c) => {
  const { category } = c.req.query();

  let items;
  if (category) {
    items = await sql`
      SELECT * FROM catalog_items 
      WHERE category = ${category}
      ORDER BY sort_order ASC, created_at DESC
    `;
  } else {
    items = await sql`
      SELECT * FROM catalog_items 
      ORDER BY category ASC, sort_order ASC, created_at DESC
    `;
  }

  return c.json(items);
});

// POST / (Create)
router.post('/', requireAuth, async (c) => {
  const { category, title, description, price, image_url, cloudinary_public_id, features, sort_order } = await c.req.json();

  if (!category || !title) {
    return c.json({ message: 'Category and title required' }, 400);
  }

  const [newItem] = await sql`
    INSERT INTO catalog_items(
      category, title, description, price, image_url, cloudinary_public_id, features, sort_order, is_active
    ) VALUES(
      ${category}, ${title}, ${description || ''}, ${price || ''}, 
      ${image_url || ''}, ${cloudinary_public_id || ''}, 
      ${features ? JSON.stringify(features) : '[]'}, ${sort_order || 0}, true
    ) RETURNING *
  `;

  return c.json(newItem, 201);
});

// PUT / (Update)
router.put('/', requireAuth, async (c) => {
  const { id } = c.req.query();

  if (!id) {
    return c.json({ message: 'ID required' }, 400);
  }

  const { category, title, description, price, image_url, cloudinary_public_id, features, sort_order, is_active } = await c.req.json();

  const [updated] = await sql`
    UPDATE catalog_items SET
      category = ${category}, title = ${title}, description = ${description || ''},
      price = ${price || ''}, image_url = ${image_url || ''},
      cloudinary_public_id = ${cloudinary_public_id || ''},
      features = ${features ? JSON.stringify(features) : '[]'},
      sort_order = ${sort_order !== undefined ? sort_order : 0},
      is_active = ${is_active !== undefined ? is_active : true},
      updated_at = NOW()
    WHERE id = ${id} 
    RETURNING *
  `;

  return c.json(updated);
});

// DELETE / (soft delete)
router.delete('/', requireAuth, async (c) => {
  const { id } = c.req.query();

  if (!id) {
    return c.json({ message: 'ID required' }, 400);
  }

  await sql`UPDATE catalog_items SET is_active = false WHERE id = ${id}`;
  return c.json({ message: 'Deleted' });
});

// POST /reorder
router.post('/reorder', requireAuth, async (c) => {
  const body = await c.req.json();
  // Handle both orderedIds array (legacy) or items array
  const orderedIds = body.orderedIds;
  const items = body.items;

  if (orderedIds && Array.isArray(orderedIds)) {
    await sql.begin(async sql => {
      for (let i = 0; i < orderedIds.length; i++) {
        await sql`UPDATE catalog_items SET sort_order = ${i} WHERE id = ${orderedIds[i]}`;
      }
    });
    return c.json({ message: 'Reordered' });
  }

  if (items && Array.isArray(items)) {
    await sql.begin(async sql => {
      for (const item of items) {
        await sql`UPDATE catalog_items SET sort_order = ${item.sort_order} WHERE id = ${item.id}`;
      }
    });
    return c.json({ message: 'Order updated' });
  }

  return c.json({ message: 'Invalid payload' }, 400);
});

export default router;
