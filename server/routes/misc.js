import { Hono } from 'hono';
import sql from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = new Hono();

// GET /popup-ad
router.get('/popup-ad', async (c) => {
  const settings = await sql`
    SELECT * FROM app_settings 
    WHERE setting_key IN ('popup_ad_image', 'popup_ad_active')
  `;

  const result = {
    image_url: settings.find(k => k.setting_key === 'popup_ad_image')?.setting_value || '',
    active: settings.find(k => k.setting_key === 'popup_ad_active')?.is_enabled ?? false
  };

  return c.json(result);
});

// POST /popup-ad
router.post('/popup-ad', requireAuth, async (c) => {
  const { image_url, active } = await c.req.json();

  await sql`
    INSERT INTO app_settings(setting_key, setting_value, is_enabled, updated_at) 
    VALUES('popup_ad_image', ${image_url}, true, NOW()) 
    ON CONFLICT(setting_key) 
    DO UPDATE SET setting_value = EXCLUDED.setting_value
  `;

  await sql`
    INSERT INTO app_settings(setting_key, setting_value, is_enabled, updated_at) 
    VALUES('popup_ad_active', ${active ? 'true' : 'false'}, ${active}, NOW()) 
    ON CONFLICT(setting_key) 
    DO UPDATE SET is_enabled = EXCLUDED.is_enabled, setting_value = EXCLUDED.setting_value
  `;

  return c.json({ message: 'Updated' });
});

// GET /specialties
router.get('/specialties', async (c) => {
  const specialties = await sql`
    SELECT DISTINCT specialty FROM doctors ORDER BY specialty
  `;
  return c.json(specialties.map(s => s.specialty));
});

// GET /sstv_images
router.get('/sstv_images', async (c) => {
  const images = await sql`SELECT * FROM sstv_images`;
  const map = images.reduce((acc, img) => ({ ...acc, [img.doctor_id]: img.image_url }), {});
  return c.json(map);
});

// POST /sstv_images
router.post('/sstv_images', requireAuth, async (c) => {
  const { doctor_id, image_url } = await c.req.json();

  const [result] = await sql`
    INSERT INTO sstv_images(doctor_id, image_url) 
    VALUES(${doctor_id}, ${image_url}) 
    ON CONFLICT(doctor_id) 
    DO UPDATE SET image_url = EXCLUDED.image_url 
    RETURNING *
  `;

  return c.json(result, 201);
});

// POST /device-heartbeat removed (moved to devices.js)

export default router;
