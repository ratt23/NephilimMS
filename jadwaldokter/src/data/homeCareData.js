export const homeCareServices = {
    homeVisit: {
        id: 'homeVisit',
        title: 'Kunjungan Rumah',
        icon: '🏠',
        description: 'Layanan dokter dan perawat yang datang ke rumah Anda',
        services: [
            {
                title: 'Pemeriksaan Dokter',
                description: 'Konsultasi dan pemeriksaan kesehatan di rumah',
                icon: '👨‍⚕️',
                features: ['Pemeriksaan fisik', 'Konsultasi', 'Resep obat']
            },
            {
                title: 'Perawatan Luka',
                description: 'Perawatan dan penggantian perban luka',
                icon: '🩹',
                features: ['Ganti perban', 'Pembersihan luka', 'Monitoring']
            },
            {
                title: 'Infus di Rumah',
                description: 'Pemberian cairan infus dan obat injeksi',
                icon: '💉',
                features: ['Pasang infus', 'Suntik obat', 'Vitamin drip']
            }
        ]
    },
    medicalAssistance: {
        id: 'medicalAssistance',
        title: 'Bantuan Medis',
        icon: '⚕️',
        description: 'Layanan bantuan medis dan perawatan kesehatan',
        services: [
            {
                title: 'Fisioterapi',
                description: 'Terapi fisik dan rehabilitasi di rumah',
                icon: '🏃',
                features: ['Terapi stroke', 'Latihan motorik', 'Rehabilitasi']
            },
            {
                title: 'Keperawatan',
                description: 'Perawat profesional untuk perawatan harian',
                icon: '👩‍⚕️',
                features: ['Perawatan lansia', 'Perawatan pasca operasi', 'Monitoring vital']
            },
            {
                title: 'Laboratorium',
                description: 'Pengambilan sampel darah di rumah',
                icon: '🔬',
                features: ['Tes darah lengkap', 'Gula darah', 'Kolesterol']
            }
        ]
    },
    emergencyCare: {
        id: 'emergencyCare',
        title: 'Gawat Darurat',
        icon: '🚑',
        description: 'Layanan darurat 24 jam',
        services: [
            {
                title: 'Ambulans',
                description: 'Layanan ambulans siaga 24/7',
                icon: '🚑',
                features: ['Emergency transport', 'Paramedis', 'Peralatan lengkap']
            },
            {
                title: 'Konsultasi Darurat',
                description: 'Konsultasi medis darurat via telepon',
                icon: '📞',
                features: ['Hotline 24 jam', 'Dokter jaga', 'Triage medis']
            },
            {
                title: 'Oksigen',
                description: 'Penyediaan dan instalasi oksigen',
                icon: '🫁',
                features: ['Tabung oksigen', 'Concentrator', 'Monitoring saturasi']
            }
        ]
    },
    elderCare: {
        id: 'elderCare',
        title: 'Perawatan Lansia',
        icon: '👴',
        description: 'Layanan khusus untuk perawatan lanjut usia',
        services: [
            {
                title: 'Caregiver',
                description: 'Pendamping dan perawatan lansia',
                icon: '🤝',
                features: ['Bantuan aktivitas harian', 'Makan & minum', 'Mobilisasi']
            },
            {
                title: 'Geriatri',
                description: 'Dokter spesialis geriatri home visit',
                icon: '👨‍⚕️',
                features: ['Assessment geriatri', 'Manajemen penyakit', 'Pencegahan']
            },
            {
                title: 'Monitoring Kesehatan',
                description: 'Pemantauan kondisi kesehatan rutin',
                icon: '📊',
                features: ['Cek tekanan darah', 'Gula darah', 'Laporan berkala']
            }
        ]
    }
};

export const contactInfo = {
    phone: '0911-3800-800',
    whatsapp: '6281234567890',
    email: 'homecare@siloamambon.com',
    hours: 'Senin - Minggu: 08.00 - 20.00 WIT',
    emergencyHours: 'Layanan Darurat 24/7'
};
