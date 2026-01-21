import { Hono } from 'hono';
import sql from '../db.js';

const router = new Hono();

// Handle device heartbeat and management
// Mapped to /device-heartbeat in server/index.js

router.post('/', async (c) => {
    try {
        const body = await c.req.json();

        // Handle Metadata Update (Rename / Pin)
        if (body.action === 'update_meta') {
            const { deviceId, friendlyName, isPinned } = body;

            if (!deviceId) {
                return c.json({ error: 'Device ID required' }, 400);
            }

            // Construct dynamic update
            const updateData = {};
            if (friendlyName !== undefined) updateData.friendly_name = friendlyName;
            if (isPinned !== undefined) updateData.is_pinned = isPinned;

            if (Object.keys(updateData).length > 0) {
                await sql`
                    UPDATE device_status 
                    SET ${sql(updateData)}
                    WHERE device_id = ${deviceId}
                `;
            }

            return c.json({ success: true });
        }

        // Handle Device Deletion (Soft delete - device will reappear on next heartbeat)
        if (body.action === 'delete') {
            const { deviceId } = body;

            if (!deviceId) {
                return c.json({ error: 'Device ID required' }, 400);
            }

            await sql`
                DELETE FROM device_status WHERE device_id = ${deviceId}
            `;

            return c.json({ success: true });
        }

        // Normal Heartbeat Logic
        const { deviceId, browserInfo, currentSlide, status } = body;
        const ipAddress = c.req.header('x-forwarded-for') || c.req.header('client-ip') || 'unknown';

        if (!deviceId) {
            return c.json({ error: 'Device ID required' }, 400);
        }

        // Upsert device status
        const result = await sql`
            INSERT INTO device_status (device_id, last_heartbeat, browser_info, current_slide, ip_address, status)
            VALUES (${deviceId}, NOW(), ${browserInfo || ''}, ${currentSlide || ''}, ${ipAddress}, ${status || 'online'})
            ON CONFLICT (device_id) 
            DO UPDATE SET 
                last_heartbeat = NOW(),
                browser_info = EXCLUDED.browser_info,
                current_slide = EXCLUDED.current_slide,
                ip_address = EXCLUDED.ip_address,
                status = EXCLUDED.status
            RETURNING refresh_trigger
        `;

        const refreshTrigger = result[0]?.refresh_trigger || false;

        // If refresh triggered, reset it
        if (refreshTrigger) {
            await sql`
                UPDATE device_status SET refresh_trigger = FALSE WHERE device_id = ${deviceId}
            `;
        }

        return c.json({ success: true, refresh: refreshTrigger });

    } catch (error) {
        console.error('Device Heartbeat Error:', error);
        return c.json({ error: 'Internal Server Error', details: error.message }, 500);
    }
});

router.get('/', async (c) => {
    try {
        const action = c.req.query('action');

        if (action === 'trigger_refresh') {
            const deviceId = c.req.query('deviceId');
            if (!deviceId) return c.json({ error: 'Device ID required' }, 400);

            await sql`
                UPDATE device_status SET refresh_trigger = TRUE WHERE device_id = ${deviceId}
            `;
            return c.json({ success: true });
        }

        // List all devices
        // Sort by pinned (true first), then online status (online first? maybe just heartbeat), then name
        const devices = await sql`
            SELECT * FROM device_status 
            ORDER BY 
                is_pinned DESC NULLS LAST,
                last_heartbeat DESC
        `;
        return c.json(devices);

    } catch (error) {
        console.error('Device List Error:', error);
        return c.json({ error: 'Internal Server Error', details: error.message }, 500);
    }
});

export default router;
