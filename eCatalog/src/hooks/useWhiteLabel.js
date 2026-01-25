// Custom hook to fetch white label settings from Dashboard
import { useState, useEffect } from 'react';

import { getApiBaseUrl } from '../utils/apiConfig';

export function useWhiteLabel() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchSettings() {
            try {
                setLoading(true);
                const apiBase = getApiBaseUrl();
                const response = await fetch(`${apiBase}/settings`);

                if (!response.ok) {
                    throw new Error('Failed to fetch settings');
                }

                const data = await response.json();

                // Transform API response to usable format
                if (data['theme_color']?.value) {
                    // Assuming applyTheme is defined elsewhere or imported
                    // For this example, we'll just acknowledge its presence
                    // applyTheme(data['theme_color'].value);
                }

                // Prepare Category Covers with defaults
                const defaultCovers = {
                    'tarif-kamar': '/asset/categories/placeholder.svg',
                    'fasilitas': '/asset/categories/placeholder.svg',
                    'radiology': '/asset/categories/placeholder.svg',
                    'layanan-unggulan': '/asset/categories/placeholder.svg',
                    'contact-person': '/asset/categories/placeholder.svg'
                };
                const dbCovers = data['category_covers']?.value ? JSON.parse(data['category_covers'].value) : {};
                const mergedCovers = { ...defaultCovers, ...dbCovers };

                const transformed = {
                    logoUrl: data['logo_url']?.value || '',
                    hospitalName: data['hospital_name']?.value || 'RSU Siloam Ambon',
                    hospitalPhone: data['hospital_phone']?.value || '1-500-911',
                    hospitalAddress: data['hospital_address']?.value || 'Jl. Sultan Hasanudin, Tantui, Ambon',
                    hospitalEmail: data['hospital_email']?.value || 'info@siloamhospitals.com',
                    categoryCovers: mergedCovers,
                    contactEmergency: data['hospital_phone']?.value || '(0911) 344 8888',
                    contactCs: data['hospital_phone']?.value || '(0911) 351 000', // fallback to same number
                    ecatalogEnabled: data['ecatalog_enabled']?.value === 'true' || data['ecatalog_enabled']?.value === true || true, // default to enabled
                    categoryVisibility: data['category_visibility']?.value
                        ? (typeof data['category_visibility']?.value === 'string' ? JSON.parse(data['category_visibility']?.value) : data['category_visibility']?.value)
                        : {
                            'tarif-kamar': true,
                            'fasilitas': true,
                            'radiology': true,
                            'layanan-unggulan': true,
                            'contact-person': true
                        },
                    // Dynamic Categories
                    ecatalogCategories: data['ecatalog_categories']?.value
                        ? (typeof data['ecatalog_categories']?.value === 'string' ? JSON.parse(data['ecatalog_categories']?.value) : data['ecatalog_categories']?.value)
                        : [
                            { id: 'tarif-kamar', label: 'Tarif Kamar' },
                            { id: 'fasilitas', label: 'Fasilitas' },
                            { id: 'radiology', label: 'Cek Harga Radiologi' },
                            { id: 'layanan-unggulan', label: 'Layanan Unggulan' },
                            { id: 'contact-person', label: 'Contact Person' }
                        ]
                };

                setSettings(transformed);
                setError(null);
            } catch (err) {
                console.error('Error fetching white label settings:', err);
                setError(err.message);
                // Set defaults on error
                setSettings({
                    hospitalName: 'RSU Siloam Ambon',
                    hospitalShortName: 'Siloam Ambon',
                    hospitalTagline: 'Emergency & Contact Center',
                    hospitalPhone: '1-500-911',
                    hospitalAddress: 'Jl. Sultan Hasanudin, Tantui, Ambon',
                    hospitalEmail: 'info@siloamhospitals.com',
                    logoUrl: '/asset/logo/logo.png',
                    themeColor: '#0047AB',
                    categoryCovers: {
                        'tarif-kamar': '/asset/categories/tarif_kamar.png',
                        'fasilitas': '/asset/categories/fasilitas.png',
                        'radiology': '/asset/categories/radiology.png',
                        'layanan-unggulan': '/asset/categories/layanan_unggulan.png',
                        'contact-person': '/asset/categories/contact_person.png'
                    },
                    contactEmergency: '(0911) 344 8888',
                    contactCs: '(0911) 351 000',
                    ecatalogEnabled: true, // default to enabled on error
                    categoryVisibility: {
                        'tarif-kamar': true,
                        'fasilitas': true,
                        'radiology': true,
                        'layanan-unggulan': true,
                        'contact-person': true,
                        ...data['category_visibility']
                    },
                });
            } finally {
                setLoading(false);
            }
        }

        fetchSettings();
    }, []);

    return { settings, loading, error };
}
