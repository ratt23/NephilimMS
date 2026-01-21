export const mcuPackages = [
    {
        id: 'pelaut',
        name: 'MCU Pelaut',
        price: 1550000,
        basePrice: 1550000,
        image: '/asset/webp/6.webp',
        isPelaut: true,
        recomended: true,
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
        id: 'basic',
        name: 'MCU Basic',
        price: 1100000,
        image: '/asset/webp/1.webp',
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
        id: 'silver',
        name: 'MCU Silver',
        price: 1500000,
        image: '/asset/webp/2.webp',
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
        id: 'gold',
        name: 'MCU Gold',
        price: 2450000,
        image: '/asset/webp/3.webp',
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
        id: 'platinum_wanita',
        name: 'MCU Platinum Wanita',
        price: 3600000,
        image: '/asset/webp/4.webp',
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
        id: 'platinum_pria',
        name: 'MCU Platinum Pria',
        price: 3900000,
        image: '/asset/webp/5.webp',
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
