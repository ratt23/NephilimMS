import { Hono } from 'hono';
import sql from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = new Hono();

// GET /posts
router.get('/', async (c) => {
    const { id, slug, page = '1', limit = '10', search = '', status, category, tag } = c.req.query();

    // Get by ID
    if (id) {
        const [post] = await sql`SELECT * FROM posts WHERE id = ${id}`;
        if (!post) return c.json({ message: 'Post not found' }, 404);
        return c.json(post);
    }

    // Get by slug
    if (slug) {
        const [post] = await sql`SELECT * FROM posts WHERE slug = ${slug}`;
        if (!post) return c.json({ message: 'Post not found' }, 404);
        return c.json(post);
    }

    // List with filters
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClause = sql`WHERE 1 = 1`;

    if (search) whereClause = sql`${whereClause} AND (title ILIKE ${'%' + search + '%'} OR content ILIKE ${'%' + search + '%'})`;
    if (status) whereClause = sql`${whereClause} AND status = ${status}`;
    if (category) whereClause = sql`${whereClause} AND category = ${category}`;
    if (tag) whereClause = sql`${whereClause} AND tags ILIKE ${'%' + tag + '%'}`;

    const [count] = await sql`SELECT COUNT(*) FROM posts ${whereClause}`;
    const posts = await sql`SELECT * FROM posts ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    return c.json({ posts, total: parseInt(count.count) });
});

// POST /posts
router.post('/', requireAuth, async (c) => {
    const { title, slug, content, excerpt, image_url, status, category, tags } = await c.req.json();

    if (!title || !slug) {
        return c.json({ message: 'Title/Slug required' }, 400);
    }

    try {
        const [newPost] = await sql`
      INSERT INTO posts(title, slug, content, excerpt, image_url, status, category, tags)
      VALUES(${title}, ${slug}, ${content || ''}, ${excerpt || ''}, ${image_url || ''}, ${status || 'draft'}, ${category || 'article'}, ${tags || ''})
      RETURNING *
    `;
        return c.json(newPost, 201);
    } catch (err) {
        if (err.code === '23505') {
            return c.json({ message: 'Slug exists' }, 400);
        }
        throw err;
    }
});

// PUT /posts
router.put('/', requireAuth, async (c) => {
    const { id } = c.req.query();

    if (!id) {
        return c.json({ message: 'ID required' }, 400);
    }

    const { title, slug, content, excerpt, image_url, status, category, tags } = await c.req.json();

    try {
        const [updated] = await sql`
      UPDATE posts 
      SET title = ${title}, slug = ${slug}, content = ${content}, excerpt = ${excerpt}, 
          image_url = ${image_url}, status = ${status}, category = ${category}, tags = ${tags}, updated_at = NOW()
      WHERE id = ${id} 
      RETURNING *
    `;
        return c.json(updated);
    } catch (err) {
        if (err.code === '23505') {
            return c.json({ message: 'Slug exists' }, 400);
        }
        throw err;
    }
});

// DELETE /posts
router.delete('/', requireAuth, async (c) => {
    const { id } = c.req.query();

    if (!id) {
        return c.json({ message: 'ID required' }, 400);
    }

    await sql`DELETE FROM posts WHERE id = ${id}`;
    return c.json({ message: 'Deleted' });
});

export default router;
