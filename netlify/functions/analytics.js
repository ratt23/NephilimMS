import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, {
    ssl: 'require'
});

export const handler = async (event) => {
    const { httpMethod, queryStringParameters, body } = event;
    const action = queryStringParameters?.action;

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        if (action === 'track' && httpMethod === 'POST') {
            const { isNewVisitor, path, device, browser, referrer, event_type, event_name } = JSON.parse(body || '{}');

            // 1. Insert into granular log
            let trafficSource = 'Direct';
            if (referrer) {
                if (referrer.includes('google')) trafficSource = 'Organic Search';
                else if (referrer.includes('facebook') || referrer.includes('instagram') || referrer.includes('t.co')) trafficSource = 'Social Media';
                else if (referrer.includes(event.headers.host)) trafficSource = 'Internal'; // Self referral
                else trafficSource = 'Referral';
            }

            // Region from headers (Netlify specific) or 'unknown'
            const region = event.headers['x-nf-geo-country-code'] || 'unknown';
            const city = event.headers['x-nf-geo-city'] || 'unknown';

            // Anonymize IP hash (simple MD5-like or just store substring for privacy if needed)
            // For now we just log the event.

            await sql`
                INSERT INTO analytics_events (
                    date, timestamp, event_type, path, event_name,
                    device_type, browser, region, city, 
                    referrer, traffic_source, 
                    ip_hash -- storing simplified ip or session id could be better but keeping simple
                )
                VALUES (
                    CURRENT_DATE, NOW(), ${event_type || 'pageview'}, ${path || event_name}, ${event_name || null},
                    ${device}, ${browser}, ${region}, ${city},
                    ${referrer}, ${trafficSource},
                    ${event.headers['client-ip'] || 'unknown'} 
                )
            `;

            // 2. Maintain Aggregated Daily Stats (for summary chart compatibility)
            // Only count pageviews or visitors (not custom events)
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

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        }

        if (action === 'stats' && httpMethod === 'GET') {
            const period = queryStringParameters?.period || '7days'; // 7days, 30days, year
            const type = queryStringParameters?.type;

            // Advanced Stats (Traffic, Sources, Devices) from granular table
            if (type === 'advanced') {
                // Determine Date Range
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

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ devices, browsers, sources, topPages, conversions })
                };
            }

            // Basic Daily Stats (Existing Logic)
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

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ stats, systemStatus })
            };
        }

        // Monthly Report - Detailed day-by-day for specific month
        if (action === 'monthly' && httpMethod === 'GET') {
            const month = queryStringParameters?.month; // Format: YYYY-MM

            if (!month || !/^\d{4}-\d{2}$/.test(month)) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid month format. Use YYYY-MM' })
                };
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

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ stats })
            };
        }

        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid action' })
        };


    } catch (error) {
        console.error('Analytics error:', error);

        // Check if error is related to missing tables
        if (error.message && (error.message.includes('does not exist') || error.message.includes('relation'))) {
            return {
                statusCode: 200, // Return 200 with empty data instead of 500
                headers,
                body: JSON.stringify({
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
                })
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || 'Internal server error',
                details: error.toString()
            })
        };
    }
};
