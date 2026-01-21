import { Hono } from 'hono';
import sql from '../db.js';

const router = new Hono();

// Mapped to /analytics in server/index.js

router.post('/', async (c) => {
    try {
        const action = c.req.query('action');

        if (action === 'track') {
            const body = await c.req.json();
            const { isNewVisitor, path, device, browser, referrer, event_type, event_name } = body;

            // 1. Insert into granular log
            let trafficSource = 'Direct';
            if (referrer) {
                if (referrer.includes('google')) trafficSource = 'Organic Search';
                else if (referrer.includes('facebook') || referrer.includes('instagram') || referrer.includes('t.co')) trafficSource = 'Social Media';
                else if (referrer.includes(c.req.header('host'))) trafficSource = 'Internal'; // Self referral
                else trafficSource = 'Referral';
            }

            const region = c.req.header('x-nf-geo-country-code') || 'unknown';
            const city = c.req.header('x-nf-geo-city') || 'unknown';
            const ip = c.req.header('x-forwarded-for') || c.req.header('client-ip') || 'unknown';

            // Check if tables exist before inserting (basic error handling wrapper implicitly handles this by catching error)

            await sql`
                INSERT INTO analytics_events (
                    date, timestamp, event_type, path, event_name,
                    device_type, browser, region, city, 
                    referrer, traffic_source, 
                    ip_hash 
                )
                VALUES (
                    CURRENT_DATE, NOW(), ${event_type || 'pageview'}, ${path || event_name}, ${event_name || null},
                    ${device}, ${browser}, ${region}, ${city},
                    ${referrer}, ${trafficSource},
                    ${ip} 
                )
            `;

            // 2. Maintain Aggregated Daily Stats
            if (event_type === 'pageview') {
                await sql`
                    INSERT INTO daily_stats (date, page_views, visitors)
                    VALUES (CURRENT_DATE, 1, ${isNewVisitor ? 1 : 0})
                    ON CONFLICT (date)
                    DO UPDATE SET 
                        page_views = daily_stats.page_views + 1,
                        visitors = daily_stats.visitors + ${isNewVisitor ? 1 : 0}
                `;
            }

            return c.json({ success: true });
        }

        return c.json({ error: 'Invalid action' }, 400);

    } catch (error) {
        console.error('Analytics Track Error:', error);
        if (error.message && (error.message.includes('does not exist') || error.message.includes('relation'))) {
            // Silently fail if tracking but tables don't exist yet
            return c.json({ success: false, error: 'Analytics tables missing' }, 200);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

router.get('/', async (c) => {
    try {
        const action = c.req.query('action');

        if (action === 'stats') {
            const period = c.req.query('period') || '7days'; // 7days, 30days, year
            const type = c.req.query('type');

            if (type === 'advanced') {
                let interval = '7 days';
                if (period === '30days') interval = '30 days';
                if (period === 'year') interval = '1 year';

                const [devices, browsers, sources, topPages, conversions] = await Promise.all([
                    sql`SELECT device_type as name, COUNT(*)::int as value 
                        FROM analytics_events 
                        WHERE date > CURRENT_DATE - ${interval}::interval 
                        GROUP BY device_type`,

                    sql`SELECT browser as name, COUNT(*)::int as value 
                        FROM analytics_events 
                        WHERE date > CURRENT_DATE - ${interval}::interval 
                        GROUP BY browser`,

                    sql`SELECT traffic_source as name, COUNT(*)::int as value 
                        FROM analytics_events 
                        WHERE date > CURRENT_DATE - ${interval}::interval 
                        GROUP BY traffic_source`,

                    sql`SELECT path as name, COUNT(*)::int as value 
                        FROM analytics_events 
                        WHERE date > CURRENT_DATE - ${interval}::interval AND event_type = 'pageview'
                        GROUP BY path 
                        ORDER BY value DESC 
                        LIMIT 10`,

                    sql`SELECT event_name as name, COUNT(*)::int as value
                        FROM analytics_events
                        WHERE date > CURRENT_DATE - ${interval}::interval 
                        AND (event_type = 'event' OR event_type LIKE 'conversion%')
                        GROUP BY event_name
                        ORDER BY value DESC`
                ]);

                return c.json({ devices, browsers, sources, topPages, conversions });
            }

            // Basic Stats
            let rows;
            if (period === 'year') {
                rows = await sql`
                    SELECT to_char(date_trunc('month', date), 'Mon YYYY') as name,
                           SUM(visitors) as visitors,
                           SUM(page_views) as page_views,
                           MIN(date) as sort_date
                    FROM daily_stats
                    WHERE date > CURRENT_DATE - INTERVAL '1 year'
                    GROUP BY date_trunc('month', date)
                    ORDER BY sort_date DESC
                `;
            } else {
                const limit = period === '30days' ? 30 : 7;
                rows = await sql`
                    SELECT to_char(date, 'DD Mon') as name,
                           date as full_date,
                           visitors,
                           page_views
                    FROM daily_stats 
                    ORDER BY date DESC 
                    LIMIT ${limit}
                `;
            }

            const stats = rows.reverse().map(row => ({
                name: row.name,
                visitors: Number(row.visitors),
                pageviews: Number(row.page_views),
                fullDate: row.full_date || row.sort_date
            }));

            const systemStatus = {
                online: true,
                lastSync: new Date().toISOString()
            };

            return c.json({ stats, systemStatus });
        }

        if (action === 'monthly') {
            const month = c.req.query('month');
            if (!month || !/^\d{4}-\d{2}$/.test(month)) {
                return c.json({ error: 'Invalid month format' }, 400);
            }

            const rows = await sql`
                SELECT 
                    date,
                    to_char(date, 'DD Mon YYYY') as formatted_date,
                    to_char(date, 'Day') as day_name,
                    visitors,
                    page_views
                FROM daily_stats
                WHERE to_char(date, 'YYYY-MM') = ${month}
                ORDER BY date ASC
            `;

            const stats = rows.map(row => ({
                date: row.date,
                formattedDate: row.formatted_date,
                dayName: row.day_name.trim(),
                visitors: Number(row.visitors),
                pageviews: Number(row.page_views)
            }));

            return c.json({ stats });
        }

        return c.json({ error: 'Invalid action' }, 400);

    } catch (error) {
        console.error('Analytics Error:', error);
        if (error.message && (error.message.includes('does not exist') || error.message.includes('relation'))) {
            return c.json({
                stats: [],
                devices: [],
                browsers: [],
                sources: [],
                topPages: [],
                conversions: [],
                systemStatus: {
                    online: false,
                    error: 'Analytics tables not initialized',
                    lastSync: new Date().toISOString()
                }
            });
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

export default router;
