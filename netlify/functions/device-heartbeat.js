import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, {
    ssl: 'require'
});

export const handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);

            // Handle Metadata Update (Rename / Pin)
            if (body.action === 'update_meta') {
                const { deviceId, friendlyName, isPinned } = body;

                if (!deviceId) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Device ID required' }) };
                }

                // Construct dynamic update query (postgres.js helper)
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

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true })
                };
            }

            // Handle Device Deletion (Soft delete - device will reappear on next heartbeat)
            if (body.action === 'delete') {
                const { deviceId } = body;

                if (!deviceId) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Device ID required' }) };
                }

                await sql`
                    DELETE FROM device_status WHERE device_id = ${deviceId}
                `;

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true })
                };
            }

            // Normal Heartbeat Logic
            const { deviceId, browserInfo, currentSlide, status } = body;
            const ipAddress = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';

            if (!deviceId) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Device ID required' }) };
            }

            // Upsert device status (Using dynamic values properly)
            // Note: We don't overwrite friendly_name or is_pinned here, which is correct.
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

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, refresh: refreshTrigger })
            };
        } else if (event.httpMethod === 'GET') {
            const action = event.queryStringParameters?.action;

            if (action === 'trigger_refresh') {
                const deviceId = event.queryStringParameters?.deviceId;
                if (!deviceId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Device ID required' }) };

                await sql`
                    UPDATE device_status SET refresh_trigger = TRUE WHERE device_id = ${deviceId}
                `;
                return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
            }

            // List all devices
            // Sort by pinned (true first), then online status (online first? maybe just heartbeat), then name
            const devices = await sql`
                SELECT * FROM device_status 
                ORDER BY 
                    is_pinned DESC NULLS LAST,
                    last_heartbeat DESC
            `;
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(devices)
            };
        } else {
            return { statusCode: 405, headers, body: 'Method Not Allowed' };
        }
    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    }
};
