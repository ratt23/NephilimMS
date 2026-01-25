-- Create radiology_prices table
CREATE TABLE IF NOT EXISTS radiology_prices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    common_name VARCHAR(255),
    category VARCHAR(100) DEFAULT 'General',
    price NUMERIC(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Optional: Create indexes for faster searching
CREATE INDEX IF NOT EXISTS idx_radiology_prices_name ON radiology_prices(name);
CREATE INDEX IF NOT EXISTS idx_radiology_prices_common_name ON radiology_prices(common_name);
CREATE INDEX IF NOT EXISTS idx_radiology_prices_category ON radiology_prices(category);
