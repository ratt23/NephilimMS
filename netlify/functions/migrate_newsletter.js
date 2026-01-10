import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export async function handler(event, context) {
  try {
    // Create newsletters table
    await sql`
      CREATE EXTENSION IF NOT EXISTS pgcrypto
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS newsletters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        
        year SMALLINT NOT NULL CHECK (year >= 2000 AND year <= 2100),
        month SMALLINT NOT NULL CHECK (month >= 1 AND month <= 12),
        
        title TEXT NOT NULL,
        description TEXT,
        
        pdf_url TEXT NOT NULL,
        cloudinary_public_id TEXT,
        
        published_at DATE NOT NULL DEFAULT CURRENT_DATE,
        is_published BOOLEAN NOT NULL DEFAULT TRUE,
        
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        
        CONSTRAINT newsletters_year_month_unique UNIQUE (year, month)
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS newsletters_latest_idx
        ON newsletters (is_published, published_at DESC, year DESC, month DESC)
    `;

    // Create trigger for auto-update updated_at
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;

    await sql`
      DROP TRIGGER IF EXISTS newsletters_updated_at ON newsletters
    `;

    await sql`
      CREATE TRIGGER newsletters_updated_at
      BEFORE UPDATE ON newsletters
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Newsletter table created successfully',
        details: 'Table: newsletters, Trigger: auto update updated_at'
      })
    };

  } catch (error) {
    console.error('Migration error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Migration failed',
        error: error.message
      })
    };
  }
}
