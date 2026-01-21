import { Hono } from 'hono';
import sql from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = new Hono();

// GET /newsletter-archive
router.get('/newsletter-archive', async (c) => {
    try {
        const { page = '1', limit = '20', admin = 'false' } = c.req.query();

        // Admin can see all, public only sees published
        const isAdmin = admin === 'true';
        if (isAdmin) {
            // Check auth manually for admin access to archives
            // logic mirrored from requireAuth but non-blocking return
            // In Hono middleware context, we usually use requireAuth. 
            // unique case: mixed public/private endpoint. 
            // For strict security, if admin=true, we should enforce auth.
            // But existing code just checked validation inside.
            // We can check cookie manually.
            const authCookie = c.req.header('Cookie');
            if (!authCookie || !authCookie.includes('nf_auth=true')) {
                return c.json({ message: 'Akses ditolak. Silakan login.' }, 401);
            }
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = isAdmin ? sql`` : sql`WHERE is_published = true`;

        const [countResult] = await sql`
        SELECT COUNT(*) FROM newsletters ${whereClause}
      `;
        const total = parseInt(countResult.count);

        const newsletters = await sql`
        SELECT * FROM newsletters 
        ${whereClause}
        ORDER BY year DESC, month DESC
        LIMIT ${parseInt(limit)} OFFSET ${offset}
      `;

        return c.json({ newsletters, total });

    } catch (error) {
        console.error('Newsletter archive error:', error);
        return c.json({ message: 'Server error', error: error.message }, 500);
    }
});

// GET /newsletter-issue
router.get('/newsletter-issue', async (c) => {
    try {
        const { year, month, id } = c.req.query();

        // Check auth for single issue? Legacy code checked auth for ALL methods in newsletter-issue.js
        // "Auth required for all methods" in newsletter-issue.js legacy code line 30.
        // So we should enforce auth here? 
        // Wait, lines 34-78 in legacy code are valid.
        // Line 6 checkAuth(event) is called at the top.
        // SO YES, Authentication IS required even for GET single issue in the legacy code.
        // That seems odd for a public newsletter, but I will stick to legacy behavior first.

        // Actually, looking at legacy archive vs issue:
        // Archive: Public (unless admin=true)
        // Issue: Private (Auth required) ??? 
        // Let's re-read legacy code.
        // newsletter-issue.js: Line 30: const authError = checkAuth(event);
        // Yes, it requires auth. This implies only admins read single issues? 
        // Or maybe the public view uses archive exclusively?
        // Let's assume legacy behavior is correct.

        // Manually checking auth to keep flow simple or use middleware on specific routes?
        // Since this router mounts on /, using middleware on the whole router might block archive.
        // So I will apply middleware to specific routes or check manually.

        // Let's implement requireAuth for this endpoint logic.
        const authCookie = c.req.header('Cookie');
        if (!authCookie || !authCookie.includes('nf_auth=true')) {
            return c.json({ message: 'Akses ditolak. Silakan login.' }, 401);
        }

        if (id) {
            const [newsletter] = await sql`SELECT * FROM newsletters WHERE id = ${id}`;
            if (!newsletter) {
                return c.json({ message: 'Newsletter not found' }, 404);
            }
            return c.json(newsletter);
        }

        if (year && month) {
            const [newsletter] = await sql`
          SELECT * FROM newsletters 
          WHERE year = ${parseInt(year)} AND month = ${parseInt(month)}
        `;
            if (!newsletter) {
                return c.json({ message: 'Newsletter not found' }, 404);
            }
            return c.json(newsletter);
        }

        return c.json({ message: 'Year & month OR id required' }, 400);

    } catch (error) {
        console.error('Newsletter issue error:', error);
        return c.json({ message: 'Server error', error: error.message }, 500);
    }
});

// PUT /newsletter-issue (Toggle Publish)
router.put('/newsletter-issue', requireAuth, async (c) => {
    const { id } = c.req.query();
    if (!id) {
        return c.json({ message: 'ID required' }, 400);
    }

    const [updated] = await sql`
        UPDATE newsletters 
        SET is_published = NOT is_published
        WHERE id = ${id}
        RETURNING *
      `;

    if (!updated) {
        return c.json({ message: 'Newsletter not found' }, 404);
    }

    return c.json(updated);
});

// DELETE /newsletter-issue
router.delete('/newsletter-issue', requireAuth, async (c) => {
    const { id } = c.req.query();
    if (!id) {
        return c.json({ message: 'ID required' }, 400);
    }

    await sql`DELETE FROM newsletters WHERE id = ${id}`;

    return c.json({ message: 'Newsletter deleted successfully' });
});

// POST /newsletter-upsert
router.post('/newsletter-upsert', requireAuth, async (c) => {
    try {
        const data = await c.req.json();
        const { year, month, title, description, pdf_url, cloudinary_public_id } = data;

        // Validation
        if (!year || !month || !title || !pdf_url) {
            return c.json({ message: 'Year, month, title, and PDF URL are required' }, 400);
        }

        // Check year/month validity
        const yearInt = parseInt(year);
        const monthInt = parseInt(month);

        if (yearInt < 2000 || yearInt > 2100 || monthInt < 1 || monthInt > 12) {
            return c.json({ message: 'Invalid year or month' }, 400);
        }

        // Generate UUID explicitly
        const id = crypto.randomUUID();

        // UPSERT
        const [newsletter] = await sql`
      INSERT INTO newsletters (
        id,
        year, 
        month, 
        title, 
        description, 
        pdf_url, 
        cloudinary_public_id,
        created_at,
        updated_at,
        published_at,
        is_published
      )
      VALUES (
        ${id},
        ${yearInt}, 
        ${monthInt}, 
        ${title}, 
        ${description || ''}, 
        ${pdf_url}, 
        ${cloudinary_public_id || ''},
        NOW(),
        NOW(),
        CURRENT_DATE,
        TRUE
      )
      ON CONFLICT (year, month)
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        pdf_url = EXCLUDED.pdf_url,
        cloudinary_public_id = EXCLUDED.cloudinary_public_id,
        updated_at = NOW()
      RETURNING *
    `;

        return c.json(newsletter);

    } catch (error) {
        console.error('Newsletter upsert error:', error);
        return c.json({ message: 'Server error', error: error.message }, 500);
    }
});

export default router;
