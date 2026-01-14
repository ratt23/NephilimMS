// Seed initial catalog data (Tarif Kamar from eCatalog)
const postgres = require('postgres');

exports.handler = async (event, context) => {
    const sql = postgres(process.env.NEON_DATABASE_URL, {
        ssl: 'require',
        connection: {
            application_name: 'catalog_seeder'
        }
    });

    try {
        // Check if data already exists
        const existing = await sql`SELECT COUNT(*) FROM catalog_items WHERE category = 'tarif-kamar'`;
        const count = parseInt(existing[0].count);

        if (count > 0) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Skipped: Already have ${count} items in tarif-kamar category`,
                    existing: count
                })
            };
        }

        // Seed data from eCataLog hardcoded content
        const CATEGORIES = [
            { id: 'tarif-kamar', label: 'Tarif Kamar', image: '/asset/categories/placeholder.svg' },
            { id: 'fasilitas', label: 'Fasilitas', image: '/asset/categories/placeholder.svg' },
            { id: 'layanan-unggulan', label: 'Layanan Unggulan', image: '/asset/categories/placeholder.svg' },
            { id: 'contact-person', label: 'Contact Person', image: '/asset/categories/placeholder.svg' }
        ];
        const seedData = [
            {
                category: 'tarif-kamar',
                title: 'KELAS 3',
                price: 'Rp 150.000',
                description: 'Kamar rawat inap kelas 3 dengan fasilitas standar',
                image_url: '/asset/categories/placeholder.svg',
                features: [
                    '8 Tempat tidur single / 8 Single bed',
                    '8 Kursi / 8 Chairs',
                    '8 Lemari pakaian / 8 Wardrobes',
                    '2 kamar mandi terpisah pria dan wanita',
                    '1 dispenser air / 1 Water dispenser'
                ],
                sort_order: 1,
                is_active: true
            },
            {
                category: 'tarif-kamar',
                title: 'KELAS 2',
                price: 'Rp 250.000',
                description: 'Kamar rawat inap kelas 2 dengan fasilitas yang lebih nyaman',
                image_url: '/asset/categories/placeholder.svg',
                features: [
                    '4 Tempat tidur / 4 Beds',
                    '4 Kursi / 4 Chairs',
                    '4 Lemari pakaian / 4 Wardrobes',
                    '1 kamar mandi dalam',
                    'TV dan AC'
                ],
                sort_order: 2,
                is_active: true
            },
            {
                category: 'tarif-kamar',
                title: 'KELAS 1',
                price: 'Rp 400.000',
                description: 'Kamar rawat inap kelas 1 dengan fasilitas premium',
                image_url: '/asset/categories/placeholder.svg',
                features: [
                    '2 Tempat tidur / 2 Beds',
                    'Kamar mandi dalam',
                    'TV, AC, Kulkas',
                    'Sofa',
                    'Lemari pakaian'
                ],
                sort_order: 3,
                is_active: true
            },
            {
                category: 'tarif-kamar',
                title: 'VIP',
                price: 'Rp 600.000',
                description: 'Kamar VIP dengan fasilitas mewah dan nyaman',
                image_url: '/asset/categories/placeholder.svg',
                features: [
                    '1 Tempat tidur queen / Queen bed',
                    'Kamar mandi dalam dengan water heater',
                    'TV, AC, Kulkas, Microwave',
                    'Sofa dan meja kerja',
                    'Lemari pakaian besar'
                ],
                sort_order: 4,
                is_active: true
            },
            {
                category: 'tarif-kamar',
                title: 'VVIP',
                price: 'Rp 1.000.000',
                description: 'Kamar VVIP dengan fasilitas super premium',
                image_url: '/asset/categories/placeholder.svg',
                features: [
                    '1 Tempat tidur king / King bed',
                    'Kamar mandi premium dengan bathtub',
                    'Smart TV, AC Central, Kulkas, Microwave',
                    'Ruang tamu terpisah',
                    'Pantry kecil'
                ],
                sort_order: 5,
                is_active: true
            }
        ];

        // Insert all seed data
        const inserted = [];
        for (const item of seedData) {
            const result = await sql`
                INSERT INTO catalog_items (
                    category, title, description, price, image_url,
                    features, sort_order, is_active
                ) VALUES (
                    ${item.category},
                    ${item.title},
                    ${item.description},
                    ${item.price},
                    ${item.image_url},
                    ${JSON.stringify(item.features)},
                    ${item.sort_order},
                    ${item.is_active}
                )
                RETURNING id, title, price
            `;
            inserted.push(result[0]);
        }

        await sql.end();

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Successfully seeded catalog data',
                inserted: inserted.length,
                items: inserted
            })
        };

    } catch (error) {
        console.error('Seed error:', error);
        await sql.end();

        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Failed to seed data',
                details: error.message
            })
        };
    }
};
