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
            const { isNewVisitor } = JSON.parse(body || '{}');

            await sql`
                INSERT INTO daily_stats (date, page_views, visitors)
                VALUES (CURRENT_DATE, 1, ${isNewVisitor ? 1 : 0})
                ON CONFLICT (date)
                DO UPDATE SET 
                    page_views = daily_stats.page_views + 1,
                    visitors = daily_stats.visitors + ${isNewVisitor ? 1 : 0}
            `;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        }

        if (action === 'stats' && httpMethod === 'GET') {
            const period = queryStringParameters?.period || '7days'; // 7days, 30days, year

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
                    SELECT to_char(date, 'Dy') as name,
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

        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid action' })
        };

    } catch (error) {
        console.error('Analytics error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
