-- Seed sample traffic data for testing Traffic Report
-- This will create daily stats for the last 14 days

-- Insert sample data for last 14 days
INSERT INTO daily_stats (date, visitors, page_views)
SELECT 
    CURRENT_DATE - (n || ' days')::interval,
    floor(random() * 100 + 20)::int,  -- Random visitors between 20-120
    floor(random() * 300 + 50)::int   -- Random pageviews between 50-350
FROM generate_series(0, 13) AS n
ON CONFLICT (date) DO UPDATE SET
    visitors = EXCLUDED.visitors,
    page_views = EXCLUDED.page_views;

-- Verify data
SELECT 
    date,
    to_char(date, 'Day') as day_name,
    visitors,
    page_views
FROM daily_stats
ORDER BY date DESC
LIMIT 14;
