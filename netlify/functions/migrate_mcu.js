// Migration script to create mcu_packages table and seed with existing data
import postgres from 'postgres';

export const handler = async () => {
    const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

    try {
        console.log('Creating mcu_packages table...');

        // Create table
        await sql`
            CREATE TABLE IF NOT EXISTS mcu_packages (
                id SERIAL PRIMARY KEY,
                package_id VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                price INTEGER NOT NULL,
                base_price INTEGER,
                image_url TEXT,
                is_pelaut BOOLEAN DEFAULT false,
                is_recommended BOOLEAN DEFAULT false,
                items JSONB NOT NULL,
                addons JSONB,
                is_enabled BOOLEAN DEFAULT true,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;

        console.log('Table created successfully');

        // Seed data from existing mcuPackages.js
        const seedData = [
            {
                package_id: 'pelaut',
                name: 'MCU Pelaut',
                price: 1550000,
                base_price: 1550000,
                image_url: '/asset/webp/6.webp',
                is_pelaut: true,
                is_recommended: true,
                display_order: 1,
                items: [
                    { category: 'Pemeriksaan Fisik', items: ['Pemeriksaan Dokter Umum', 'Pemeriksaan Dokter Gigi', 'Ishihara dan Visus'] },
                    { category: 'Pemeriksaan Darah', items: ['Darah Lengkap', 'VDRL', 'HBsAg'] },
                    { category: 'Pemeriksaan Urine', items: ['Urine Lengkap'] },
                    { category: 'Kolesterol', items: ['Total Kolesterol', 'Trigliserida'] },
                    { category: 'Fungsi Ginjal', items: ['Ureum', 'Creatine', 'Asam Urat'] },
                    { category: 'Pemeriksaan Diabetes', items: ['Gula Darah Puasa'] },
                    { category: 'Fungsi Hati', items: ['SGOT', 'SGPT'] },
                    { category: 'Pemeriksaan Alat', items: ['EKG', 'Audiometri', 'Thorax AP/PA'] },
                    { category: 'Sertifikat', items: ['Sertifikat Kesehatan Pelaut'] }
                ],
                addons: [
                    { id: 'golongan_darah', label: 'Golongan Darah', price: 50000 },
                    { id: 'IGM', label: 'IGM Anti HAV', price: 300000 }
                ]
            },
            {
                package_id: 'basic',
                name: 'MCU Basic',
                price: 1100000,
                image_url: '/asset/webp/1.webp',
                is_pelaut: false,
                is_recommended: false,
                display_order: 2,
                items: [
                    { category: 'Pemeriksaan Fisik', items: ['Pemeriksaan Fisik Dokter Umum'] },
                    { category: 'Pemeriksaan Darah', items: ['Darah Lengkap'] },
                    { category: 'Kolesterol', items: ['Total Cholesterol', 'HDL', 'LDL', 'Trigliserida'] },
                    { category: 'Pemeriksaan Urine', items: ['Urine Lengkap'] },
                    { category: 'Fungsi Ginjal', items: ['Ureum & Creatine', 'Uric Acid'], hidden: true },
                    { category: 'Fungsi Hati', items: ['SGOT', 'SGPT'], hidden: true },
                    { category: 'Pemeriksaan Diabetes', items: ['Gula Darah Puasa'], hidden: true },
                    { category: 'Pemeriksaan Alat', items: ['Thorax AP/PA'], hidden: true }
                ]
            },
            {
                package_id: 'silver',
                name: 'MCU Silver',
                price: 1500000,
                image_url: '/asset/webp/2.webp',
                is_pelaut: false,
                is_recommended: false,
                display_order: 3,
                items: [
                    { category: 'Pemeriksaan Fisik', items: ['Pemeriksaan Fisik Dokter Umum'] },
                    { category: 'Pemeriksaan Darah', items: ['Darah Lengkap'] },
                    { category: 'Kolesterol', items: ['Total Cholesterol', 'HDL', 'LDL', 'Trigliserida'] },
                    { category: 'Pemeriksaan Urine', items: ['Urine Lengkap'] },
                    { category: 'Fungsi Ginjal', items: ['Ureum & Creatine', 'Uric Acid'], hidden: true },
                    { category: 'Fungsi Hati', items: ['SGOT', 'SGPT'], hidden: true },
                    { category: 'Pemeriksaan Diabetes', items: ['Gula Darah Puasa', 'HbA1C'], hidden: true },
                    { category: 'Pemeriksaan Alat', items: ['Thorax AP/PA'], hidden: true }
                ]
            },
            {
                package_id: 'gold',
                name: 'MCU Gold',
                price: 2450000,
                image_url: '/asset/webp/3.webp',
                is_pelaut: false,
                is_recommended: false,
                display_order: 4,
                items: [
                    { category: 'Pemeriksaan Fisik', items: ['Pemeriksaan Fisik Dokter Umum'] },
                    { category: 'Pemeriksaan Darah', items: ['Darah Lengkap'] },
                    { category: 'Kolesterol', items: ['Total Cholesterol', 'HDL', 'LDL', 'Trigliserida'] },
                    { category: 'Pemeriksaan Urine', items: ['Urine Lengkap'] },
                    { category: 'Fungsi Ginjal', items: ['Ureum & Creatine', 'Uric Acid'], hidden: true },
                    { category: 'Fungsi Hati', items: ['SGOT', 'SGPT'], hidden: true },
                    { category: 'Pemeriksaan Diabetes', items: ['Gula Darah Puasa', 'HbA1C'], hidden: true },
                    { category: 'Pemeriksaan Alat', items: ['Thorax AP/PA', 'ECG', 'Treadmill', 'USG Abdomen'], hidden: true }
                ]
            },
            {
                package_id: 'platinum_wanita',
                name: 'MCU Platinum Wanita',
                price: 3600000,
                image_url: '/asset/webp/4.webp',
                is_pelaut: false,
                is_recommended: false,
                display_order: 5,
                items: [
                    { category: 'Pemeriksaan Fisik', items: ['Pemeriksaan Fisik Dokter Umum'] },
                    { category: 'Pemeriksaan Darah', items: ['Darah Lengkap'] },
                    { category: 'Kolesterol', items: ['Total Cholesterol', 'HDL', 'LDL', 'Trigliserida'] },
                    { category: 'Pemeriksaan Urine', items: ['Urine Lengkap'] },
                    { category: 'Fungsi Ginjal', items: ['Ureum & Creatine', 'Uric Acid'], hidden: true },
                    { category: 'Fungsi Hati', items: ['SGOT', 'SGPT', 'Alkali'], hidden: true },
                    { category: 'Pemeriksaan Tumor Marker', items: ['AFP', 'CEA'], hidden: true },
                    { category: 'Pemeriksaan Hepatitis', items: ['HBsAg Qualitative'], hidden: true },
                    { category: 'Pemeriksaan Diabetes', items: ['Gula Darah Puasa', 'HbA1C'], hidden: true },
                    { category: 'Pemeriksaan Alat', items: ['Thorax AP/PA', 'ECG', 'Treadmill', 'USG Abdomen'], hidden: true }
                ]
            },
            {
                package_id: 'platinum_pria',
                name: 'MCU Platinum Pria',
                price: 3900000,
                image_url: '/asset/webp/5.webp',
                is_pelaut: false,
                is_recommended: false,
                display_order: 6,
                items: [
                    { category: 'Pemeriksaan Fisik', items: ['Pemeriksaan Fisik Dokter Umum'] },
                    { category: 'Pemeriksaan Darah', items: ['Darah Lengkap'] },
                    { category: 'Kolesterol', items: ['Total Cholesterol', 'HDL', 'LDL', 'Trigliserida'] },
                    { category: 'Pemeriksaan Urine', items: ['Urine Lengkap'] },
                    { category: 'Fungsi Ginjal', items: ['Ureum & Creatine', 'Uric Acid'], hidden: true },
                    { category: 'Fungsi Hati', items: ['SGOT', 'SGPT', 'Alkali'], hidden: true },
                    { category: 'Pemeriksaan Tumor Marker', items: ['AFP', 'PSA'], hidden: true },
                    { category: 'Pemeriksaan Hepatitis', items: ['HBsAg Qualitative'], hidden: true },
                    { category: 'Pemeriksaan Diabetes', items: ['Gula Darah Puasa', 'HbA1C'], hidden: true },
                    { category: 'Pemeriksaan Alat', items: ['Thorax AP/PA', 'ECG', 'Treadmill', 'USG Abdomen'], hidden: true }
                ]
            }
        ];

        // Insert seed data
        for (const pkg of seedData) {
            await sql`
                INSERT INTO mcu_packages (
                    package_id, name, price, base_price, image_url, 
                    is_pelaut, is_recommended, items, addons, display_order
                ) VALUES (
                    ${pkg.package_id}, ${pkg.name}, ${pkg.price}, ${pkg.base_price || null},
                    ${pkg.image_url}, ${pkg.is_pelaut}, ${pkg.is_recommended},
                    ${JSON.stringify(pkg.items)}, ${pkg.addons ? JSON.stringify(pkg.addons) : null},
                    ${pkg.display_order}
                )
                ON CONFLICT (package_id) DO NOTHING
            `;
        }

        console.log('Seed data inserted successfully');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'MCU packages table created and seeded successfully' })
        };
    } catch (error) {
        console.error('Migration error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Migration failed', error: error.message })
        };
    }
};
