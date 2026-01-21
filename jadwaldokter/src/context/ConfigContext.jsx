import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiBaseUrl } from '../utils/apiConfig';

const ConfigContext = createContext();

export const useConfig = () => {
    return useContext(ConfigContext);
};

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState({
        logoUrl: '/asset/logo/logo.png', // Default
        themeColor: '#01007f', // Default Blue
        // Identity
        hospitalName: 'RSU Siloam Ambon',
        hospitalShortName: 'Siloam Ambon',
        hospitalTagline: 'Kesehatan Anda, Prioritas Kami',
        hospitalPhone: '1-500-911',
        hospitalAddress: 'Jl. Sultan Hasanudin, Tantui, Ambon',
        hospitalEmail: 'info@siloamhospitals.com',

        headerSlides: [ // Default static slides
            {
                type: 'text',
                title: 'Jadwal Poliklinik',
                subtitle: 'RSU Siloam Ambon',
                color: '#01007f'
            },
            {
                type: 'text',
                title: '1-500-911',
                subtitle: '24/7 Emergency & Contact Center',
                color: '#D92D20'
            }
        ],
        menu: [ // Default menu
            { id: 1, label: 'Home', url: '/home', icon: 'home' },
            { id: 2, label: 'MCU', url: '/mcu', icon: 'clipboard' },
            { id: 3, label: 'Home Care', url: '/homecare', icon: 'heart' },
            { id: 4, label: 'Article', url: '/article', icon: 'file-text' }
        ],
        doctorPriority: {}, // Default empty
        features: {
            polyclinicToday: true,
            doctorLeave: true,
            googleReview: true
        },
        whatsappNumber: '6285158441599', // Default fallback
        whatsappEnabled: true,
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // Use API config utility for flexible URL
                const apiBase = getApiBaseUrl();

                // Try cache first
                const cacheKey = 'cache_settings';
                const cacheTTL = 0; // Disabled cache for debugging
                const cachedSettings = null; // Force fetch
                // const cachedSettings = localStorage.getItem(cacheKey);

                if (cachedSettings) {
                    try {
                        const { data, timestamp } = JSON.parse(cachedSettings);
                        if (Date.now() - timestamp < cacheTTL) {
                            console.log('✅ Using cached settings');
                            // Use cached data
                            processSettings(data);
                            return data;
                        }
                    } catch (e) {
                        console.warn('Cache parse error, fetching fresh data');
                    }
                }

                // Fetch from API (cache miss or expired)
                console.log('❌ Cache miss, fetching settings from API');
                const response = await fetch(`${apiBase}/settings`);

                if (!response.ok) {
                    throw new Error('Failed to fetch settings');
                }

                const data = await response.json();

                // Store in cache
                localStorage.setItem(cacheKey, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));

                processSettings(data);
                return data;

            } catch (err) {
                console.error("Config Fetch Error:", err);
                setConfig(prev => ({ ...prev, loading: false, error: err.message }));
                return null;
            }
        };

        const fetchUpdates = async (manualIds = []) => {
            try {
                const apiBase = getApiBaseUrl();
                const response = await fetch(`${apiBase}/doctors/grouped`);
                if (!response.ok) return null;
                const data = await response.json();

                const updatedDoctors = [];
                const addedIds = new Set();
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

                let maxTimestamp = 0;

                const hasManualUpdates = manualIds && manualIds.length > 0;
                console.log("[ConfigContext] Fetching updates. Manual Mode:", hasManualUpdates, "IDs:", manualIds);

                Object.entries(data).forEach(([key, cat]) => {
                    cat.doctors.forEach(doc => {
                        const t = doc.updated_at ? new Date(doc.updated_at).getTime() : 0;
                        if (t > maxTimestamp) maxTimestamp = t;

                        let isMatch = false;

                        if (hasManualUpdates) {
                            // CASE 1: Manual Mode - strict match only
                            isMatch = manualIds.includes(doc.id) || manualIds.includes(String(doc.id));
                        } else {
                            // CASE 2: Auto Mode - recent updates
                            isMatch = doc.updated_at && new Date(doc.updated_at) > threeDaysAgo;
                        }

                        if (isMatch && !addedIds.has(doc.id)) {
                            updatedDoctors.push({
                                name: doc.name,
                                image: doc.image_url,
                                specialty: cat.title || 'Spesialis',
                                specialtyKey: key // Add Key for routing
                            });
                            addedIds.add(doc.id);
                        }
                    });
                });

                if (updatedDoctors.length > 0) {
                    return updatedDoctors;
                } else if (maxTimestamp > 0 && manualIds.length === 0) {
                    // Only fallback to timestamp if NO manual updates either
                    // Return latest timestamp object if no recent updates
                    return { latestTimestamp: maxTimestamp };
                }

                return null;
            } catch (e) {
                console.warn('Failed to fetch updates', e);
                return null;
            }
        };

        fetchConfig().then(async (settingsData) => {
            // Parse manual_update_list from settingsData if available
            let manualIds = [];
            if (settingsData && settingsData.manual_update_list) {
                try {
                    manualIds = JSON.parse(settingsData.manual_update_list.value);
                } catch (e) {
                    console.warn("Error parsing manual_update_list", e);
                }
            }

            const updates = await fetchUpdates(manualIds);
            // Check if updates has list or is a special "latest" object
            if (updates && (Array.isArray(updates) && updates.length > 0)) {
                // CASE 1: Recent updates found
                setConfig(prev => {
                    // Check if feature is enabled
                    if (!prev.features.scheduleUpdate) return prev;

                    // Chunk updates into groups of 2
                    const chunkSize = 2;
                    const updateSlides = [];

                    for (let i = 0; i < updates.length; i += chunkSize) {
                        const chunk = updates.slice(i, i + chunkSize);
                        updateSlides.push({
                            type: 'doctor-updates',
                            title: 'UPDATE JADWAL',
                            data: chunk, // Array of {name, image, specialty}
                            color: '#16a34a',
                            marquee: false,
                            isNotification: true
                        });
                    }

                    // Filter out existing notification slides to avoid duplicates if re-running
                    const existingSlides = prev.headerSlides.filter(s => !s.isNotification);

                    // Add new update slides at the beginning (or end, depending on preference. User said "finished... then main slider", implying updates first)
                    // Let's put them first.
                    return { ...prev, headerSlides: [...updateSlides, ...existingSlides] };
                });
            } else if (updates && updates.latestTimestamp) {
                // CASE 2: No recent updates, show last timestamp (User Request)
                // "jika tidak ada update.. tulis saja update di tanggal timestamp terakhir.."
                const dateStr = new Date(updates.latestTimestamp).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                setConfig(prev => {
                    // Check if feature is enabled (same flag for both update types)
                    if (!prev.features.scheduleUpdate) return prev;

                    const newSlides = [...prev.headerSlides];
                    if (!newSlides.find(s => s.isNotification)) {
                        newSlides.push({
                            type: 'text',
                            title: 'INFO UPDATE',
                            subtitle: `Update Terakhir: ${dateStr}`,
                            color: '#01007f', // Blue instead of Red
                            marquee: false,
                            isNotification: true // Still marked as notification for header logic
                        });
                    }
                    return { ...prev, headerSlides: newSlides };
                });
            }
        });

        function processSettings(data) {
            // Helper to safely parse JSON
            const safeParse = (val, fallback) => {
                if (!val) return fallback;
                if (typeof val === 'object') return val;
                try {
                    return JSON.parse(val);
                } catch {
                    return fallback;
                }
            };

            // Extract all settings
            const logoUrl = data.logo_url?.value || config.logoUrl;
            const themeColor = data.theme_color?.value || config.themeColor;
            const hospitalName = data.hospital_name?.value || config.hospitalName;
            const hospitalShortName = data.hospital_short_name?.value || config.hospitalShortName;
            const hospitalTagline = data.hospital_tagline?.value || config.hospitalTagline;
            const hospitalPhone = data.hospital_phone?.value || config.hospitalPhone;
            const hospitalAddress = data.hospital_address?.value || config.hospitalAddress;
            const hospitalEmail = data.hospital_email?.value || config.hospitalEmail;
            const headerSlides = safeParse(data.header_slides?.value, []);
            const menu = safeParse(data.menu?.value, []);
            const doctorPriority = safeParse(data.doctor_priority?.value, {});
            const whatsappNumber = data.whatsapp_number?.value || config.whatsappNumber;
            const whatsappEnabled = data.whatsapp_enabled?.is_enabled ?? true;
            const slideshowRefreshInterval = parseInt(data.slideshow_refresh_interval?.value || '24', 10);

            // Parse manual update IDs for global usage (e.g. yellow dots)
            let manualUpdateIds = [];
            if (data.manual_update_list?.value) {
                try {
                    manualUpdateIds = JSON.parse(data.manual_update_list.value);
                } catch (e) { console.warn("Error parsing manual IDs in processSettings", e); }
            }

            const features = {
                polyclinicToday: (data.feature_polyclinic_today?.is_enabled ?? data.feature_polyclinic_today?.enabled) ?? true,
                doctorLeave: (data.feature_doctor_leave?.is_enabled ?? data.feature_doctor_leave?.enabled) ?? true,
                googleReview: (data.feature_google_review?.is_enabled ?? data.feature_google_review?.enabled) ?? true,
                headerSlider: (data.feature_header_slider?.is_enabled ?? data.feature_header_slider?.enabled) ?? true,
                scheduleUpdate: (data.feature_schedule_update?.is_enabled ?? data.feature_schedule_update?.enabled) ?? true
            };
            console.log("DEBUG FEATURES:", { raw: data, parsed: features });

            setConfig(prev => ({
                ...prev,
                logoUrl,
                themeColor,
                hospitalName,
                hospitalShortName,
                hospitalTagline,
                hospitalPhone,
                hospitalAddress,
                hospitalEmail,
                headerSlides: (headerSlides && headerSlides.length > 0) ? headerSlides : prev.headerSlides,
                menu: (menu && menu.length > 0) ? menu : prev.menu,
                doctorPriority,
                features,
                whatsappNumber,
                whatsappEnabled,
                slideshowRefreshInterval,
                manualUpdateIds, // New State
                loading: false
            }));
        }
    }, []);



    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
};
