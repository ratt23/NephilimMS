import { Hono } from 'hono';
import sql from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = new Hono();

// GET /settings
router.get('/', async (c) => {
    try {
        console.log('[API] Fetching settings...');
        const settings = await sql`SELECT * FROM app_settings`;
        console.log(`[API] Settings fetched: ${settings.length} rows`);

        const map = settings.reduce((acc, item) => {
            acc[item.setting_key] = { value: item.setting_value, enabled: item.is_enabled };
            return acc;
        }, {});

        return c.json(map);
    } catch (err) {
        console.error('[API] Error fetching settings:', err);
        return c.json({ message: 'Error fetching settings', error: err.message }, 500);
    }
});

// POST /settings
router.post('/', requireAuth, async (c) => {
    const updates = await c.req.json();

    const promises = Object.entries(updates).map(([key, data]) => {
        return sql`
      INSERT INTO app_settings(setting_key, setting_value, is_enabled, updated_at)
      VALUES(${key}, ${data.value}, ${data.enabled}, NOW())
      ON CONFLICT(setting_key) 
      DO UPDATE SET setting_value = EXCLUDED.setting_value, is_enabled = EXCLUDED.is_enabled, updated_at = NOW()
    `;
    });

    await Promise.all(promises);
    return c.json({ message: 'Updated' });
});

export default router;
