
import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export async function handler(event, context) {
    try {
        await sql`
      CREATE TABLE IF NOT EXISTS catalog_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        
        category TEXT NOT NULL, -- 'tarif-kamar', 'fasilitas', 'layanan-unggulan'
        title TEXT NOT NULL,    -- 'VIP', 'Kelas 1', 'IGD'
        description TEXT,
        price TEXT,             -- 'Rp 600.000' (stored as text for flexibility or int)
        
        image_url TEXT,
        cloudinary_public_id TEXT,
        
        features JSONB DEFAULT '[]', -- Array of strings ['AC', 'TV']
        
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Catalog items table created' })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}
