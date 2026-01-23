import postgres from 'postgres';

export async function handler(event, context) {
    if (!process.env.NEON_DATABASE_URL) return { statusCode: 500, body: 'No DB URL' };

    const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

    try {
        await sql`
      CREATE TABLE IF NOT EXISTS ecatalog_items (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        price DECIMAL(12, 2) DEFAULT 0,
        is_visible BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Table ecatalog_items created or exists' })
        };
    } catch (err) {
        return { statusCode: 200, body: 'ERROR: ' + err.message };
    }
}
