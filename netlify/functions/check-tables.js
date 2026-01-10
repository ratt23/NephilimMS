import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export const handler = async () => {
    try {
        // Check all critical tables
        const tablesToCheck = [
            'analytics_events',
            'daily_stats',
            'doctors',
            'leave_data',
            'newsletters',
            'popup_ads',
            'settings',
            'promo_images'
        ];

        const results = {};

        for (const tableName of tablesToCheck) {
            const check = await sql`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = ${tableName}
                )
            `;
            results[tableName] = check[0].exists;
        }

        // Count records in existing tables
        const counts = {};
        for (const [tableName, exists] of Object.entries(results)) {
            if (exists) {
                try {
                    const count = await sql`SELECT COUNT(*) as count FROM ${sql(tableName)}`;
                    counts[tableName] = parseInt(count[0].count);
                } catch (e) {
                    counts[tableName] = 'error: ' + e.message;
                }
            }
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tables: results,
                record_counts: counts,
                missing_tables: Object.keys(results).filter(key => !results[key]),
                message: 'Database health check complete'
            })
        };
    } catch (error) {
        console.error('Health check error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: error.message || 'Unknown error',
                details: error.toString(),
                stack: error.stack ? error.stack.split('\n').slice(0, 5).join('\n') : undefined
            })
        };
    }
};
