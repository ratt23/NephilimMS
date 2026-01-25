import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { Plus, Trash2 } from 'lucide-react';
import { getApiBaseUrl } from '../utils/apiConfig';

// --- LIVE PREVIEW MOCK COMPONENT ---
// Replicates the simplified look of shab.web.id based on the analysis
// Helper for the slider animation in preview
const HeaderSliderPreview = ({ slides }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!slides || slides.length === 0) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % slides.length);
        }, 3000); // 3 seconds per slide
        return () => clearInterval(interval);
    }, [slides]);

    if (!slides || slides.length === 0) return null;
    const current = slides[index];

    return (
        <div key={index} className="flex flex-col items-end animate-fade-in-up">
            {current.image ? (
                <img src={current.image} alt={current.title} className="h-8 w-auto object-contain my-1" />
            ) : (
                <>
                    <span className="font-bold text-[0.8rem] leading-none" style={{ color: current.color || '#000' }}>{current.title}</span>
                    <span className="text-[0.5rem] font-semibold opacity-80" style={{ color: current.color || '#000' }}>{current.subtitle}</span>
                </>
            )}
        </div>
    );
};

const LivePreview = ({ logoUrl, themeColor, siteName = "RSU Siloam Ambon", features = {}, headerSlides = [], categoryCovers = {}, categories = [] }) => {
    // Default features to true if undefined
    const showLeaves = features.feature_doctor_leave !== false;
    const showPolyclinic = features.feature_polyclinic_today !== false;

    const showPopup = features.feature_google_review !== false;
    const vis = features.category_visibility || {};


    // eCatalog Categories Mock (Use props or fallback)
    const PREVIEW_CATEGORIES = (categories && categories.length > 0) ? categories : [
        { id: 'tarif-kamar', label: 'Tarif Kamar' },
        { id: 'fasilitas', label: 'Fasilitas' },
        { id: 'layanan-unggulan', label: 'Layanan' },
        { id: 'contact-person', label: 'Contact' }
    ];

    return (
        <div className="border border-sanctum-border rounded-lg overflow-hidden shadow-2xl-lg bg-sanctum-bg max-w-sm mx-auto transform scale-95 origin-top">
            {/* Header Mock (RSU Siloam Style) */}
            <div className="bg-sanctum-sidebar p-3 pb-0 sticky top-0 z-10">
                {/* Top Row: Logo & Emergency */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Site Logo" className="object-contain h-8 w-auto" />
                        ) : (
                            <div className="text-xl font-bold text-sanctum-accent leading-none tracking-tight font-sans">RSU Siloam</div>
                        )}
                    </div>
                    <div className="text-right overflow-hidden h-10 flex items-center justify-end relative w-48">
                        {headerSlides.length > 0 ? (
                            <HeaderSliderPreview slides={headerSlides} />
                        ) : (
                            // Fallback if empty
                            <div className="text-right">
                                <div className="text-lg font-bold text-red-600 leading-none">1-500-911</div>
                                <div className="text-[8px] text-red-500 font-semibold mt-0.5">24/7 Emergency & Contact Center</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-4 border-b border-sanctum-border mb-3 overflow-x-auto">
                    {['Home', 'MCU', 'Home Care', 'Article'].map((tab, idx) => (
                        <div key={tab} className={`text-[10px] font-bold pb-2 ${idx === 0 ? 'text-sanctum-accent border-b-2 border-sanctum-accent' : 'text-sanctum-text-muted'}`}>
                            {tab}
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid Content Mock */}
            <div className="p-4 space-y-4">
                <div className="h-8 w-full bg-sanctum-surface rounded-full shadow-2xl-sm border border-sanctum-border flex items-center px-3">
                    <span className="text-xs text-sanctum-text-muted/60">Cari Dokter...</span>
                </div>

                {/* Dynamic Content Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Poliklinik Hari Ini (Left, Blue) */}
                    {showPolyclinic && (
                        <div className="rounded overflow-hidden shadow-2xl-sm border border-[#8C7A3E]/20 h-full">
                            <div className="bg-blue-800 px-2 py-2 flex justify-between items-center text-white">
                                <span className="text-[9px] font-bold uppercase tracking-wider truncate">Poliklinik Hari Ini</span>
                                <div className="w-3 h-3 bg-[#1a1d21]/30 rounded-sm flex-shrink-0"></div>
                            </div>
                            <div className="bg-[#1a1d21] p-2 space-y-2 h-24 overflow-hidden relative">
                                <div className="flex gap-2 items-center text-left">
                                    <div className="w-6 h-6 bg-[#0B0B0C] rounded-full flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="h-1.5 w-16 bg-gray-200 rounded mb-1"></div>
                                        <div className="h-1 w-12 bg-blue-100 rounded"></div>
                                        <div className="h-1 w-8 bg-[#0B0B0C] rounded mt-1"></div>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center text-left">
                                    <div className="w-6 h-6 bg-[#0B0B0C] rounded-full flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="h-1.5 w-14 bg-gray-200 rounded mb-1"></div>
                                        <div className="h-1 w-10 bg-blue-100 rounded"></div>
                                        <div className="h-1 w-8 bg-[#0B0B0C] rounded mt-1"></div>
                                    </div>
                                </div>
                                {/* Fade overlay for overflow effect */}
                                <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white to-transparent"></div>
                            </div>
                        </div>
                    )}

                    {/* Dokter Cuti (Right, Red) */}
                    {showLeaves && (
                        <div className="rounded overflow-hidden shadow-2xl-sm border border-[#8C7A3E]/20 h-full">
                            <div className="bg-red-600 px-2 py-2 flex justify-between items-center text-white">
                                <span className="text-[9px] font-bold uppercase tracking-wider truncate">Dokter Cuti</span>
                                <div className="w-3 h-3 bg-[#1a1d21]/30 rounded-full flex-shrink-0"></div>
                            </div>
                            <div className="bg-[#1a1d21] p-2 space-y-2 h-24 overflow-hidden relative">
                                <div className="flex gap-2 items-center text-left">
                                    <div className="w-6 h-6 bg-[#0B0B0C] rounded-full flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="h-1.5 w-14 bg-gray-200 rounded mb-1"></div>
                                        <div className="h-1 w-20 bg-red-900/20 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center text-left">
                                    <div className="w-6 h-6 bg-[#0B0B0C] rounded-full flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="h-1.5 w-16 bg-gray-200 rounded mb-1"></div>
                                        <div className="h-1 w-16 bg-red-900/20 rounded"></div>
                                    </div>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white to-transparent"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* eCatalog Preview (Accordion Mock) */}
                <div className="space-y-1">
                    {PREVIEW_CATEGORIES.map(cat => {
                        // Check visibility
                        if (vis[cat.id] === false) return null;

                        return (
                            <div key={cat.id} className="relative h-10 rounded overflow-hidden shadow-2xl-sm group">
                                {/* Background Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{
                                        backgroundImage: `url(${categoryCovers[cat.id] || '/asset/categories/placeholder.svg'})`,
                                        filter: 'brightness(0.7)'
                                    }}
                                />
                                {/* Content */}
                                <div className="absolute inset-0 flex items-center justify-between px-3">
                                    <span className="text-white text-[10px] font-bold uppercase tracking-wider">{cat.label}</span>
                                    <svg className="w-3 h-3 text-white opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={`h-10 rounded shadow-2xl-sm text-white flex items-center justify-center text-xs font-semibold`} style={{ backgroundColor: themeColor }}>
                            Specialty {i}
                        </div>
                    ))}
                </div>
            </div>

            {/* Popup Simulator */}
            {
                showPopup && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none z-20">
                        <div className="bg-[#1a1d21] p-4 rounded-lg shadow-2xl-lg max-w-[180px] text-center transform scale-90">
                            <div className="text-xs font-bold text-[#E6E6E3] mb-2">Beri Ulasan Kami!</div>
                            <div className="flex justify-center space-x-1 mb-2">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <svg key={s} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.603 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>
                            <div className="h-6 bg-[#8C7A3E] rounded text-white text-[10px] flex items-center justify-center font-bold">RATE NOW</div>
                        </div>
                    </div>
                )
            }

            {/* Bottom Nav / Footer Mock */}
            <div className="bg-[#1a1d21] p-2 border-t flex justify-around">
                <div className="w-8 h-8 rounded bg-[#0B0B0C]"></div>
                <div className="w-8 h-8 rounded" style={{ backgroundColor: themeColor }}></div>
                <div className="w-8 h-8 rounded bg-[#0B0B0C]"></div>
            </div>
        </div >
    );
};

// Accordion Section Component (Reused)
const AccordionSection = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-sanctum-surface border border-sanctum-border shadow-2xl-sm rounded-md overflow-hidden mb-4 transition-all duration-200 hover:shadow-2xl-md">
            <button
                type="button" // Important in form
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-sanctum-sidebar border-b border-sanctum-border hover:bg-sanctum-bg transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-sanctum-text-curr uppercase tracking-wide flex items-center gap-2">
                        {title}
                    </h2>
                </div>
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
            </button>

            <div className={`transition-all duration-300 ease-in-out origin-top ${isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="p-4 bg-sanctum-surface">
                    {children}
                </div>
            </div>
        </div>
    );
};

const DEFAULT_CATEGORIES = [
    { id: 'tarif-kamar', label: 'Tarif Kamar' },
    { id: 'fasilitas', label: 'Fasilitas' },
    { id: 'radiology', label: 'Cek Harga Radiologi' },
    { id: 'layanan-unggulan', label: 'Layanan Unggulan' },
    { id: 'contact-person', label: 'Contact Person' }
];

export default function SettingsManager() {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false); // Can be boolean or string ID of active upload
    const [config, setConfig] = useState({
        // API Config
        oneSignalAppId: '',
        oneSignalApiKey: '',

        // Site Identity
        hospital_name: 'RSU Siloam Ambon',
        hospital_short_name: 'Siloam Ambon',
        hospital_tagline: 'Emergency & Contact Center',
        hospital_phone: '1-500-911',
        hospital_address: 'Jl. Sultan Hasanudin, Tantui, Ambon',
        hospital_email: 'info@siloamhospitals.com',
        site_logo_url: '',
        site_theme_color: '#01007f', // Default shab.web.id color

        // Features
        feature_polyclinic_today: true,
        feature_doctor_leave: true,
        feature_google_review: true,
        feature_schedule_update: true,
        feature_header_slider: true,



        // Header Slides
        header_slides: [],

        // Doctor Priority
        doctor_priority: {},

        // WhatsApp Contact
        whatsapp_number: '6285158441599',
        whatsapp_enabled: true,

        // eCatalog Category Cover Images
        category_covers: {
            'tarif-kamar': '/asset/categories/placeholder.svg',
            'fasilitas': '/asset/categories/placeholder.svg',
            'radiology': '/asset/categories/placeholder.svg',
            'layanan-unggulan': '/asset/categories/placeholder.svg',
            'contact-person': '/asset/categories/placeholder.svg'
        },

        // Category Visibility
        category_visibility: {
            'tarif-kamar': true,
            'fasilitas': true,
            'radiology': true,
            'layanan-unggulan': true,
            'contact-person': true
        },

        // Dynamic Menu Categories
        ecatalog_categories: DEFAULT_CATEGORIES,

        // Technical
        cors_allowed_origins: '*'
    });
    const [message, setMessage] = useState(null);
    const [availableDoctors, setAvailableDoctors] = useState([]); // List of all doctors from DB

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            // Load settings
            const response = await fetch(`${getApiBaseUrl()}/settings`, { credentials: 'include' });
            const data = await response.json();

            // Load doctors for priority
            const doctorsRes = await fetch(`${getApiBaseUrl()}/doctors/all`, { credentials: 'include' }); // Changed from /doctors to /doctors/all based on original code
            const doctorsData = await doctorsRes.json();
            setAvailableDoctors(doctorsData);

            // Parse settings
            const settings = {};

            // Helper to safe parse JSON
            const safeParse = (key, val, defaultVal) => {
                if (!val) return defaultVal;
                try {
                    return typeof val === 'string' ? JSON.parse(val) : val;
                } catch (e) {
                    console.error(`Error parsing ${key}:`, e);
                    return defaultVal;
                }
            };

            const getVal = (key) => {
                if (key.startsWith('feature_')) {
                    // If the key exists in data, return its 'enabled' status (mapped from is_enabled by API)
                    // The API returns: { key: { value: "...", enabled: true/false } }
                    if (data[key] && typeof data[key].enabled !== 'undefined') {
                        return data[key].enabled;
                    }
                    // Fallback for legacy or defaults
                    return true;
                }
                return data[key]?.value;
            };

            setConfig({
                oneSignalAppId: getVal('oneSignalAppId') || '',
                oneSignalApiKey: getVal('oneSignalApiKey') || '',
                hospital_name: getVal('hospital_name') || 'RSU Siloam Ambon',
                hospital_short_name: getVal('hospital_short_name') || 'Siloam Ambon',
                hospital_tagline: getVal('hospital_tagline') || 'Emergency & Contact Center',
                hospital_phone: getVal('hospital_phone') || '1-500-911',
                hospital_address: getVal('hospital_address') || 'Jl. Sultan Hasanudin, Tantui, Ambon',
                hospital_email: getVal('hospital_email') || 'info@siloamhospitals.com',
                site_logo_url: getVal('site_logo_url') || '',
                site_theme_color: getVal('site_theme_color') || '#0047AB',
                whatsapp_number: getVal('whatsapp_number') || '6285158441599',
                whatsapp_enabled: getVal('whatsapp_enabled') !== 'false',
                feature_polyclinic_today: getVal('feature_polyclinic_today') === 'true',
                feature_doctor_leave: getVal('feature_doctor_leave') !== 'false', // Default true
                feature_header_slider: getVal('feature_header_slider') !== 'false',
                feature_schedule_update: getVal('feature_schedule_update') !== 'false',
                header_slides: safeParse('header_slides', getVal('header_slides'), []),
                feature_google_review: getVal('feature_google_review') !== 'false', // Default true

                doctor_priority: safeParse('doctor_priority', getVal('doctor_priority'), { 'umum': [] }),
                cors_allowed_origins: getVal('cors_allowed_origins') || '*'
            });
        } catch (err) {
            console.error("Failed to load settings", err);
        }
        setIsLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleReset = () => {
        if (window.confirm("Apakah Anda yakin ingin mengembalikan pengaturan ke default?")) {
            setConfig({
                oneSignalAppId: '',
                oneSignalApiKey: '',
                site_logo_url: 'https://shab.web.id/asset/logo/logo.png',
                site_theme_color: '#01007f',
                header_slides: [
                    { id: 1, title: 'Jadwal Poliklinik', subtitle: 'RSU Siloam Ambon', color: '#01007f' },
                    { id: 2, title: '1-500-911', subtitle: '24/7 Emergency & Contact Center', color: '#D92D20' }
                ],
                feature_polyclinic_today: true,
                feature_doctor_leave: true,
                feature_header_slider: true,
                feature_schedule_update: true,
                feature_google_review: true,
                cors_allowed_origins: '*'
            });
            setMessage({ type: 'info', text: 'Settings reset to defaults. Click Save to apply.' });
        }
    };

    const handleImageUpload = async (e, target, index = null) => {
        const file = e.target.files[0];
        if (!file) return;

        // Use same env vars as DoctorManager
        const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            alert("Cloudinary configuration missing in .env");
            return;
        }

        setIsUploading(target); // Set active upload target

        const formDataApi = new FormData();
        formDataApi.append('file', file);
        formDataApi.append('upload_preset', UPLOAD_PRESET);
        formDataApi.append('cloud_name', CLOUD_NAME);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formDataApi,
            });
            const data = await response.json();

            if (response.ok) {
                const secureUrl = data.secure_url;
                if (target === 'logo') {
                    setConfig(prev => ({ ...prev, site_logo_url: secureUrl }));
                } else if (target === 'slide' && index !== null) {
                    const newSlides = [...config.header_slides];
                    newSlides[index].image = secureUrl; // Add image field to slide
                    // If uploading image, maybe we don't need title? Or keep both. Let's keep flexibility.
                    setConfig(prev => ({ ...prev, header_slides: newSlides }));
                } else if (target.startsWith('category-')) {
                    // Handle category cover uploads
                    const categoryId = target.replace('category-', '');
                    setConfig(prev => ({
                        ...prev,
                        category_covers: {
                            ...prev.category_covers,
                            [categoryId]: secureUrl
                        }
                    }));
                }
            } else {
                throw new Error(data.error.message || 'Upload failed');
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    // Category Management Handlers
    const updateCategoryLabel = (index, newLabel) => {
        const newCats = [...config.ecatalog_categories];
        newCats[index].label = newLabel;
        setConfig(prev => ({ ...prev, ecatalog_categories: newCats }));
    };

    const addCategory = () => {
        const newLabel = prompt("Nama Kategori Baru:");
        if (newLabel) {
            const id = newLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const newCats = [...config.ecatalog_categories, { id, label: newLabel }];
            setConfig(prev => ({ ...prev, ecatalog_categories: newCats }));
        }
    };

    const removeCategory = (index) => {
        if (window.confirm("Hapus kategori ini? (Pastikan tidak ada item penting di dalamnya)")) {
            const newCats = config.ecatalog_categories.filter((_, i) => i !== index);
            setConfig(prev => ({ ...prev, ecatalog_categories: newCats }));
        }
    };

    const moveCategory = (index, direction) => {
        const newCats = [...config.ecatalog_categories];
        if (direction === 'up' && index > 0) {
            [newCats[index], newCats[index - 1]] = [newCats[index - 1], newCats[index]];
        } else if (direction === 'down' && index < newCats.length - 1) {
            [newCats[index], newCats[index + 1]] = [newCats[index + 1], newCats[index]];
        }
        setConfig(prev => ({ ...prev, ecatalog_categories: newCats }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            oneSignalAppId: { value: config.oneSignalAppId, enabled: true },
            oneSignalApiKey: { value: config.oneSignalApiKey, enabled: true },
            site_logo_url: { value: config.site_logo_url, enabled: true },
            site_theme_color: { value: config.site_theme_color, enabled: true },
            feature_polyclinic_today: { value: "true", enabled: config.feature_polyclinic_today },
            feature_doctor_leave: { value: "true", enabled: config.feature_doctor_leave },
            feature_header_slider: { value: "true", enabled: config.feature_header_slider },
            feature_schedule_update: { value: "true", enabled: config.feature_schedule_update },
            header_slides: { value: JSON.stringify(config.header_slides), enabled: true },
            feature_google_review: { value: "true", enabled: config.feature_google_review },

            doctor_priority: { value: JSON.stringify(config.doctor_priority), enabled: true },
            cors_allowed_origins: { value: config.cors_allowed_origins, enabled: true }
        };

        try {
            // Save setting to DB
            const res = await fetch(`${getApiBaseUrl()}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Settings saved successfully! Updating preview...' });
                // Implicitly updated via state, but re-fetch ensures consistency
                setTimeout(() => setMessage(null), 3000);
            } else {
                throw new Error('Save failed');
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error saving settings. Please try again.' });
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 animate-fade-in font-sans pb-10">
            {/* LEFT COLUMN: EDITOR */}
            <div className="flex-1 space-y-6">
                <div className="bg-sanctum-surface border border-sanctum-border shadow-2xl-sm rounded-none">
                    {/* TOOLBAR */}
                    <div className="bg-sanctum-surface p-4 border-b border-sanctum-border flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="text-lg font-bold text-sanctum-text-curr uppercase tracking-wide flex items-center gap-2">
                            <span>System Settings</span>
                            <span className="bg-sanctum-bg text-sanctum-text-muted text-xs font-semibold px-2 py-0.5 rounded-full">Global Configuration</span>
                        </h2>
                    </div>

                    <div className="p-8">
                        {message && (
                            <div className={`mb-6 p-4 rounded text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-4"> {/* Space y reduced, handle spacing in Accordion */}

                            {/* SECTION 1: VISUAL IDENTITY */}
                            <AccordionSection title="Site Identity (White Label)" defaultOpen={true}>
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Identity Basics */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-sanctum-text-curr mb-2">Hospital Full Name</label>
                                            <input
                                                type="text"
                                                name="hospital_name"
                                                value={config.hospital_name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-sanctum-border bg-sanctum-bg rounded-sm focus:ring-sanctum-accent focus:border-sanctum-accent text-sm font-bold text-sanctum-text-curr"
                                                placeholder="e.g. RSU Siloam Ambon"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#E6E6E3] mb-2">Short Display Name</label>
                                            <input
                                                type="text"
                                                name="hospital_short_name"
                                                value={config.hospital_short_name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-[#8C7A3E]/30 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                placeholder="e.g. Siloam Ambon"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-[#E6E6E3] mb-2">Tagline / Slogan</label>
                                        <input
                                            type="text"
                                            name="hospital_tagline"
                                            value={config.hospital_tagline}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-[#8C7A3E]/30 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm italic text-[#a0a4ab]"
                                            placeholder="e.g. Emergency & Contact Center"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-[#E6E6E3] mb-2">Main Phone Number</label>
                                            <input
                                                type="text"
                                                name="hospital_phone"
                                                value={config.hospital_phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-[#8C7A3E]/30 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                                                placeholder="e.g. 1-500-911"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#E6E6E3] mb-2">Contact Email</label>
                                            <input
                                                type="email"
                                                name="hospital_email"
                                                value={config.hospital_email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-[#8C7A3E]/30 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                                                placeholder="info@hospital.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-[#E6E6E3] mb-2">Physical Address</label>
                                        <textarea
                                            name="hospital_address"
                                            value={config.hospital_address}
                                            onChange={handleChange}
                                            rows="2"
                                            className="w-full px-4 py-2 border border-[#8C7A3E]/30 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Full hospital address"
                                        />
                                    </div>

                                    <hr className="border-[#8C7A3E]/10" />

                                    {/* Logo Upload */}
                                    <div>
                                        <label className="block text-sm font-bold text-[#E6E6E3] mb-2">Logo URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                name="site_logo_url"
                                                value={config.site_logo_url}
                                                onChange={handleChange}
                                                className="flex-1 px-4 py-2 border border-[#8C7A3E]/30 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                                                placeholder="https://example.com/logo.png"
                                            />
                                            <label className="cursor-pointer bg-[#0B0B0C] hover:bg-gray-200 border border-[#8C7A3E]/30 rounded px-3 py-2 flex items-center justify-center transition-colors">
                                                {isUploading === 'logo' ? <LoadingSpinner size="sm" /> : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleImageUpload(e, 'logo')}
                                                    disabled={!!isUploading}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-[#a0a4ab]/60 mt-1">Full URL to your site's logo (PNG/SVG recommended).</p>
                                    </div>

                                    {/* Theme Color */}
                                    <div>
                                        <label className="block text-sm font-bold text-[#E6E6E3] mb-2">Theme Color</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                name="site_theme_color"
                                                value={config.site_theme_color}
                                                onChange={handleChange}
                                                className="w-12 h-12 p-1 border border-[#8C7A3E]/30 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                name="site_theme_color"
                                                value={config.site_theme_color}
                                                onChange={handleChange}
                                                className="flex-1 px-4 py-2 border border-[#8C7A3E]/30 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono uppercase"
                                                placeholder="#000000"
                                            />
                                        </div>
                                        <p className="text-xs text-[#a0a4ab]/60 mt-1">Primary color for buttons, headers, and highlights.</p>
                                    </div>

                                    {/* WhatsApp Contact */}
                                    <div>
                                        <label className="block text-sm font-bold text-[#E6E6E3] mb-2">WhatsApp Contact (MCU Booking)</label>
                                        <div className="space-y-3">
                                            <input
                                                type="tel"
                                                name="whatsapp_number"
                                                value={config.whatsapp_number}
                                                onChange={handleChange}
                                                placeholder="628XXXXXXXXXX"
                                                className="w-full px-4 py-2 border border-[#8C7A3E]/30 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                                            />
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="whatsapp_enabled"
                                                    checked={config.whatsapp_enabled}
                                                    onChange={(e) => setConfig({ ...config, whatsapp_enabled: e.target.checked })}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-[#E6E6E3]">Enable WhatsApp button on MCU form</span>
                                            </label>
                                        </div>
                                        <p className="text-xs text-[#a0a4ab]/60 mt-1">Phone number without '+' (e.g., 6285158441599). Used for MCU package booking.</p>
                                    </div>
                                </div>
                            </AccordionSection>

                            {/* SECTION: Header Info Slider */}
                            <AccordionSection title="Header Info Slider">
                                <div className="space-y-4">
                                    <p className="text-xs text-[#a0a4ab]">Atur teks berjalan (slider) di bagian header kanan (misal: No Telp, Jadwal).</p>
                                    {config.header_slides.map((slide, idx) => (
                                        <div key={slide.id || idx} className="flex gap-2 items-start border p-3 rounded bg-[#0B0B0C]">
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="text"
                                                    placeholder="Judul Utama (e.g 1-500-911)"
                                                    className="w-full text-sm font-bold border rounded px-2 py-1"
                                                    value={slide.title}
                                                    onChange={(e) => {
                                                        const newSlides = [...config.header_slides];
                                                        newSlides[idx].title = e.target.value;
                                                        setConfig({ ...config, header_slides: newSlides });
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Sub-judul (e.g Emergency)"
                                                    className="w-full text-xs border rounded px-2 py-1"
                                                    value={slide.subtitle}
                                                    onChange={(e) => {
                                                        const newSlides = [...config.header_slides];
                                                        newSlides[idx].subtitle = e.target.value;
                                                        setConfig({ ...config, header_slides: newSlides });
                                                    }}
                                                />
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-[#a0a4ab]">Warna Teks:</span>
                                                    <input
                                                        type="color"
                                                        className="w-6 h-6 p-0 border rounded cursor-pointer"
                                                        value={slide.color}
                                                        onChange={(e) => {
                                                            const newSlides = [...config.header_slides];
                                                            newSlides[idx].color = e.target.value;
                                                            setConfig({ ...config, header_slides: newSlides });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newSlides = config.header_slides.filter((_, i) => i !== idx);
                                                    setConfig(prev => ({ ...prev, header_slides: newSlides }));
                                                }}
                                                className="text-red-500 hover:text-red-700 bg-[#1a1d21] p-1 rounded border border-[#8C7A3E]/20 h-fit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2" /></svg>
                                            </button>
                                            {/* Slide Image Upload */}
                                            <label className="cursor-pointer bg-[#0B0B0C] hover:bg-[#0B0B0C] border border-[#8C7A3E]/20 rounded p-1 h-fit flex items-center justify-center">
                                                {isUploading === 'slide' ? <LoadingSpinner size="sm" /> : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleImageUpload(e, 'slide', idx)}
                                                    disabled={!!isUploading}
                                                />
                                            </label>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newSlides = [...config.header_slides, { id: Date.now(), title: 'New Slide', subtitle: 'Description', color: '#01007f' }];
                                            setConfig({ ...config, header_slides: newSlides });
                                        }}
                                        className="w-full py-2 bg-purple-50 text-purple-600 text-xs font-bold rounded border border-purple-100 hover:bg-purple-100 transition-colors"
                                    >
                                        + Tambah Slide Baru
                                    </button>
                                </div>
                            </AccordionSection>


                            {/* SECTION: FEATURE TOGGLES */}
                            <AccordionSection title="Feature Management">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 border border-[#8C7A3E]/10 rounded hover:bg-[#0B0B0C] transition-colors">
                                        <div>
                                            <div className="font-bold text-[#E6E6E3] text-sm">Poliklinik Hari Ini</div>
                                            <div className="text-xs text-[#a0a4ab]">Tampilkan tabel/daftar dokter praktek hari ini. Jika mati, seluruh section disembunyikan.</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="feature_polyclinic_today" checked={config.feature_polyclinic_today} onChange={handleChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#1a1d21] after:border-[#8C7A3E]/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8C7A3E]"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-3 border border-[#8C7A3E]/10 rounded hover:bg-[#0B0B0C] transition-colors">
                                        <div>
                                            <div className="font-bold text-[#E6E6E3] text-sm">Info Dokter Cuti</div>
                                            <div className="text-xs text-[#a0a4ab]">Tampilkan tabel/daftar dokter cuti. Jika mati, panel dokter cuti tidak ditampilkan.</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="feature_doctor_leave" checked={config.feature_doctor_leave} onChange={handleChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#1a1d21] after:border-[#8C7A3E]/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8C7A3E]"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-3 border border-[#8C7A3E]/10 rounded hover:bg-[#0B0B0C] transition-colors">
                                        <div>
                                            <div className="font-bold text-[#E6E6E3] text-sm">Pop Up Ulasan Google (GMB)</div>
                                            <div className="text-xs text-[#a0a4ab]">Tampilkan pop-up ajakan memberi ulasan Bintang 5 di Google.</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="feature_google_review" checked={config.feature_google_review} onChange={handleChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#1a1d21] after:border-[#8C7A3E]/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8C7A3E]"></div>
                                        </label>
                                    </div>

                                    {/* NEW: Header Slider Toggle */}
                                    <div className="flex items-center justify-between p-3 border border-[#8C7A3E]/10 rounded hover:bg-[#0B0B0C] transition-colors">
                                        <div>
                                            <div className="font-bold text-[#E6E6E3] text-sm">Header Info Slider</div>
                                            <div className="text-xs text-[#a0a4ab]">Tampilkan slider informasi di header (kanan atas).</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="feature_header_slider" checked={config.feature_header_slider} onChange={handleChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#1a1d21] after:border-[#8C7A3E]/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8C7A3E]"></div>
                                        </label>
                                    </div>

                                    {/* NEW: Schedule Update Ticker Toggle */}
                                    <div className="flex items-center justify-between p-3 border border-[#8C7A3E]/10 rounded hover:bg-[#0B0B0C] transition-colors">
                                        <div>
                                            <div className="font-bold text-[#E6E6E3] text-sm">Running Text: Jadwal Update</div>
                                            <div className="text-xs text-[#a0a4ab]">Tampilkan notifikasi teks berjalan untuk dokter yang baru update jadwal.</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="feature_schedule_update" checked={config.feature_schedule_update} onChange={handleChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#1a1d21] after:border-[#8C7A3E]/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8C7A3E]"></div>
                                        </label>
                                    </div>
                                </div>
                            </AccordionSection>

                            {/* SECTION: TECHNICAL & SECURITY */}
                            <AccordionSection title="Technical & Security (CORS)">
                                {/* Database Connection - CRITICAL */}
                                <div className="mb-8 pb-6 border-b border-[#8C7A3E]/20">
                                    <div className="bg-red-900/20 border-2 border-red-300 rounded-lg p-4 mb-4">
                                        <div className="flex items-start gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-red-600 mt-0.5">
                                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                                <line x1="12" x2="12" y1="9" y2="13" />
                                                <line x1="12" x2="12.01" y1="17" y2="17" />
                                            </svg>
                                            <div className="flex-1">
                                                <h4 className="text-red-800 font-bold text-sm mb-1">CRITICAL: Database Connection String</h4>
                                                <p className="text-red-700 text-xs">
                                                    Mengubah koneksi database akan memutus akses aplikasi ke data. Hanya ubah jika Anda migrasi database untuk white-labeling.
                                                    <strong className="block mt-1">Pastikan koneksi baru sudah diverifikasi sebelum menyimpan!</strong>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <label className="block text-sm font-bold text-[#E6E6E3] mb-2">
                                        Database Connection URL (Neon / PostgreSQL)
                                    </label>
                                    <input
                                        type="password"
                                        name="database_url"
                                        value={config.database_url || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-red-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-2xl-sm font-mono text-xs bg-red-900/20"
                                        placeholder="postgres://user:password@host/database"
                                    />
                                    <p className="text-xs text-[#a0a4ab] mt-2">
                                        Format: <code className="bg-[#0B0B0C] px-1 py-0.5 rounded text-[10px]">postgres://username:password@hostname.neon.tech/dbname?sslmode=require</code>
                                    </p>
                                </div>

                                <h3 className="text-lg font-bold text-[#E6E6E3] mb-1">URL Dasar Aplikasi Client (CORS)</h3>
                                <p className="text-[#a0a4ab] text-sm mb-4">
                                    Masukkan URL lengkap domain yang diizinkan mengakses API (misal: frontend React/Vue). Gunakan koma untuk lebih dari satu.
                                </p>

                                <div className="flex gap-4 mb-4">
                                    <input
                                        type="text"
                                        name="cors_allowed_origins"
                                        value={config.cors_allowed_origins}
                                        onChange={handleChange}
                                        className="flex-1 px-4 py-2 border border-[#8C7A3E]/30 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all shadow-2xl-sm"
                                        placeholder="https://shab.web.id, http://localhost:3000"
                                    />
                                </div>

                                <div className="bg-yellow-900/20 border border-yellow-200 text-yellow-800 px-4 py-3 rounded flex items-start gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>
                                    <span className="text-sm">
                                        Mengubah URL ini akan memengaruhi izin akses dari domain lain ke API ini (CORS policy). Pastikan URL ditulis dengan protokol (https://).
                                    </span>
                                </div>
                            </AccordionSection>

                            {/* SECTION: MENU MANAGER */}
                            <AccordionSection title="Menu E-Catalog (Kategori)">
                                <p className="text-xs text-[#a0a4ab] mb-4">
                                    Atur item menu, urutan, dan label kategori di E-Catalog.
                                </p>
                                <div className="space-y-3">
                                    {(config.ecatalog_categories || []).map((cat, idx) => (
                                        <div key={cat.id} className="flex gap-2 items-center bg-[#0B0B0C] p-3 rounded border border-[#8C7A3E]/20 shadow-2xl-sm">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => moveCategory(idx, 'up')}
                                                    disabled={idx === 0}
                                                    className="text-[#a0a4ab] hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m18 15-6-6-6 6" /></svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveCategory(idx, 'down')}
                                                    disabled={idx === (config.ecatalog_categories || []).length - 1}
                                                    className="text-[#a0a4ab] hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6" /></svg>
                                                </button>
                                            </div>

                                            <div className="flex-1">
                                                <label className="text-[10px] text-[#a0a4ab]/60 font-mono block mb-0.5">ID: {cat.id}</label>
                                                <input
                                                    type="text"
                                                    value={cat.label}
                                                    onChange={(e) => updateCategoryLabel(idx, e.target.value)}
                                                    className="w-full px-2 py-1 text-sm border border-[#8C7A3E]/30 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeCategory(idx)}
                                                className="p-2 text-red-400 hover:bg-red-900/20 hover:text-red-600 rounded transition-colors"
                                                title="Hapus Kategori"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addCategory}
                                        className="w-full py-2 bg-blue-900/20 hover:bg-blue-100 text-blue-600 rounded border border-dashed border-blue-200 flex items-center justify-center gap-2 font-medium transition-colors"
                                    >
                                        <Plus size={16} />
                                        Tambah Kategori Baru
                                    </button>
                                </div>
                            </AccordionSection>

                            {/* SECTION: INTEGRATIONS */}
                            <AccordionSection title="Integrations & API Keys">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-[#E6E6E3] mb-2">OneSignal App ID</label>
                                        <input
                                            type="text"
                                            name="oneSignalAppId"
                                            value={config.oneSignalAppId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-[#8C7A3E]/30 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                                            placeholder="Enter OneSignal App ID"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[#E6E6E3] mb-2">OneSignal Rest API Key</label>
                                        <input
                                            type="password"
                                            name="oneSignalApiKey"
                                            value={config.oneSignalApiKey}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-[#8C7A3E]/30 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                                            placeholder="Enter OneSignal REST API Key"
                                        />
                                    </div>
                                </div>
                            </AccordionSection>



                            {/* SECTION: DOCTOR PRIORITY */}
                            <AccordionSection title="Doctor Display Priority">
                                <p className="text-xs text-[#a0a4ab] mb-4">
                                    Atur urutan prioritas dokter. Pilih dari database untuk menghindari kesalahan penulisan.
                                </p>

                                <div className="space-y-6">
                                    {(config.doctor_priority && typeof config.doctor_priority === 'object' ? Object.entries(config.doctor_priority) : []).map(([specialty, doctors]) => {
                                        const categoryKey = specialty.toLowerCase().replace(/-/g, ' ');
                                        const candidateDoctors = availableDoctors.filter(doc =>
                                            (doc.specialty || '').toLowerCase().includes(categoryKey) ||
                                            (categoryKey === 'umum' && (doc.specialty || '').toLowerCase().includes('umum'))
                                        ).filter(doc => !doctors.includes(doc.name));

                                        return (
                                            <div key={specialty} className="bg-[#0B0B0C] p-4 rounded border border-[#8C7A3E]/20">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="font-bold text-sm text-[#E6E6E3] capitalize">{specialty.replace(/-/g, ' ')}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (window.confirm(`Hapus kategori ${specialty}?`)) {
                                                                const newPrio = { ...config.doctor_priority };
                                                                delete newPrio[specialty];
                                                                setConfig({ ...config, doctor_priority: newPrio });
                                                            }
                                                        }}
                                                        className="text-red-400 hover:text-red-600"
                                                        title="Hapus Kategori"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h2"></path></svg>
                                                    </button>
                                                </div>

                                                {/* List Existing Doctors */}
                                                <div className="space-y-2 mb-3">
                                                    {Array.isArray(doctors) && doctors.map((docName, idx) => (
                                                        <div key={idx} className="flex gap-2 items-center bg-[#1a1d21] p-2 rounded border border-[#8C7A3E]/10 shadow-2xl-sm animate-fade-in">
                                                            <span className="text-xs font-mono bg-[#0B0B0C] px-2 py-1 rounded text-[#a0a4ab] w-6 text-center">{idx + 1}</span>
                                                            <div className="flex-1 text-sm text-[#E6E6E3] truncate">{docName}</div>

                                                            {/* Reorder Controls */}
                                                            <div className="flex gap-1">
                                                                <button type="button"
                                                                    onClick={() => {
                                                                        if (idx === 0) return;
                                                                        const newPrio = { ...config.doctor_priority };
                                                                        const list = [...newPrio[specialty]];
                                                                        [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
                                                                        newPrio[specialty] = list;
                                                                        setConfig({ ...config, doctor_priority: newPrio });
                                                                    }}
                                                                    disabled={idx === 0}
                                                                    className={`p-1 hover:bg-[#0B0B0C] rounded transition-colors ${idx === 0 ? 'text-gray-300' : 'text-[#a0a4ab]'}`}
                                                                >↑</button>
                                                                <button type="button"
                                                                    onClick={() => {
                                                                        if (idx === doctors.length - 1) return;
                                                                        const newPrio = { ...config.doctor_priority };
                                                                        const list = [...newPrio[specialty]];
                                                                        [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]];
                                                                        newPrio[specialty] = list;
                                                                        setConfig({ ...config, doctor_priority: newPrio });
                                                                    }}
                                                                    disabled={idx === doctors.length - 1}
                                                                    className={`p-1 hover:bg-[#0B0B0C] rounded transition-colors ${idx === doctors.length - 1 ? 'text-gray-300' : 'text-[#a0a4ab]'}`}
                                                                >↓</button>
                                                                <button type="button"
                                                                    onClick={() => {
                                                                        const newPrio = { ...config.doctor_priority };
                                                                        newPrio[specialty] = newPrio[specialty].filter((_, i) => i !== idx);
                                                                        setConfig({ ...config, doctor_priority: newPrio });
                                                                    }}
                                                                    className="p-1 hover:bg-red-900/20 text-red-500 rounded transition-colors"
                                                                >×</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!doctors || doctors.length === 0) && <p className="text-xs text-[#a0a4ab]/60 italic">Belum ada dokter diatur.</p>}
                                                </div>

                                                {/* Add Doctor Dropdown */}
                                                <div className="flex gap-2">
                                                    <select
                                                        className="flex-1 text-xs border border-[#8C7A3E]/30 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                const newPrio = { ...config.doctor_priority };
                                                                newPrio[specialty] = [...(newPrio[specialty] || []), e.target.value];
                                                                setConfig({ ...config, doctor_priority: newPrio });
                                                                e.target.value = ""; // Reset
                                                            }
                                                        }}
                                                    >
                                                        <option value="">+ Pilih Dokter dari Database...</option>
                                                        {candidateDoctors.map(doc => (
                                                            <option key={doc.id} value={doc.name}>
                                                                {doc.name} ({doc.specialty})
                                                            </option>
                                                        ))}
                                                        {availableDoctors.length > 0 && candidateDoctors.length === 0 && (
                                                            <option disabled>Tidak ada dokter tersisa untuk kategori ini</option>
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Add Category */}
                                    <div className="flex gap-2 items-center bg-[#0B0B0C] p-2 rounded border border-dashed border-[#8C7A3E]/30">
                                        <select
                                            className="flex-1 text-xs bg-transparent border-none focus:ring-0 text-[#E6E6E3]"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    const key = e.target.value;
                                                    if (config.doctor_priority && config.doctor_priority[key]) {
                                                        alert('Kategori sudah ada!');
                                                        return;
                                                    }
                                                    const newPrio = { ...(config.doctor_priority || {}), [key]: [] };
                                                    setConfig({ ...config, doctor_priority: newPrio });
                                                    e.target.value = ""; // Reset
                                                }
                                            }}
                                        >
                                            <option value="">+ Tambah Kategori Spesialis...</option>
                                            {[...new Set(availableDoctors.map(d => {
                                                const s = (d.specialty || '').toLowerCase().replace('spesialis ', '').trim();
                                                return s;
                                            }))].filter(Boolean).filter(s => !config.doctor_priority || !config.doctor_priority[s]).sort().map(s => (
                                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                            ))}
                                            <option value="custom">Input Manual...</option>
                                        </select>
                                    </div>
                                </div>
                            </AccordionSection>

                            {/* SECTION: API CONFIGURATION (New) */}
                            <AccordionSection title="API Configuration (Developer)">
                                <div className="space-y-4">
                                    <div className="bg-blue-900/20 border border-blue-200 p-3 rounded text-sm text-blue-800">
                                        <p className="font-bold mb-1">Deployment Strategy:</p>
                                        <p className="text-xs mb-2">Switch API endpoints for Netlify free tier flexibility. Reload required after switching.</p>
                                        <div className="flex gap-2">
                                            {['local', 'dashdev1', 'dashdev2', 'dashdev3'].map(env => (
                                                <button
                                                    key={env}
                                                    type="button"
                                                    onClick={() => {
                                                        localStorage.setItem('api_server_override', env);
                                                        alert(`Switched to ${env}. Please reload.`);
                                                        window.location.reload();
                                                    }}
                                                    className={`px-3 py-1 rounded border text-xs font-bold uppercase ${(localStorage.getItem('api_server_override') === env || (!localStorage.getItem('api_server_override') && env === 'local'))
                                                        ? 'bg-[#8C7A3E] text-white border-blue-700'
                                                        : 'bg-[#1a1d21] text-[#a0a4ab] hover:bg-[#0B0B0C]'
                                                        }`}
                                                >
                                                    {env}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    localStorage.removeItem('api_server_override');
                                                    alert('Reset to default env.');
                                                    window.location.reload();
                                                }}
                                                className="px-3 py-1 rounded border border-[#8C7A3E]/30 text-xs text-[#a0a4ab] hover:bg-[#0B0B0C]"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </AccordionSection>

                            {/* General Save Button */}
                            <div className="flex justify-start pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center gap-2 bg-[#8C7A3E] hover:bg-[#a89150] text-white font-bold py-3 px-8 rounded shadow-2xl-lg transform active:scale-95 transition-all text-sm uppercase tracking-wide"
                                >
                                    {isLoading ? <LoadingSpinner size="sm" color="white" /> : null}
                                    {isLoading ? 'Saving Changes...' : 'Save Configuration'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 bg-[#0B0B0C]0 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded shadow-2xl-lg transform active:scale-95 transition-all text-sm uppercase tracking-wide ml-4"
                                >
                                    Reset Default
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            </div >

            {/* RIGHT COLUMN: LIVE PREVIEW */}
            < div className="w-full lg:w-96 flex-shrink-0 space-y-4" >
                <div className="bg-[#1a1d21] border border-[#8C7A3E]/20 shadow-2xl-sm p-4 sticky top-6">
                    <h3 className="text-sm font-bold text-[#a0a4ab] uppercase tracking-wider mb-4 text-center">
                        Live Preview (Mockup)
                    </h3>
                    <p className="text-xs text-[#a0a4ab]/60 text-center mb-6">
                        This is how your settings might affect the target site layout.
                    </p>

                    <LivePreview
                        logoUrl={config.site_logo_url}
                        themeColor={config.site_theme_color}
                        headerSlides={config.header_slides}
                        features={config}
                        categoryCovers={config.category_covers}
                    />

                    <div className="mt-6 border-t pt-4">
                        <h4 className="text-xs font-bold text-[#E6E6E3] mb-2">Current Configuration Key:</h4>
                        <div className="bg-gray-800 text-gray-200 p-3 rounded text-[10px] font-mono overflow-x-auto">
                            <p><span className="text-blue-300">Theme:</span> {config.site_theme_color}</p>
                            <p><span className="text-purple-300">CORS:</span> {config.cors_allowed_origins}</p>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}
