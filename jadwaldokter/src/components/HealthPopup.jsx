import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../utils/apiConfig';

const HealthPopup = () => {
    const [visible, setVisible] = useState(false);
    const [exists, setExists] = useState(true);
    const [imageSrc, setImageSrc] = useState(null); // Mulai dengan null

    // API Config
    const API_BASE_URL = getApiBaseUrl();

    useEffect(() => {
        // Fetch dynamic ad image
        const fetchAd = async () => {
            try {
                if (!API_BASE_URL) return;

                // Try cache first (10 min TTL for popup ad)
                const cacheKey = 'cache_popup_ad';
                const cacheTTL = 10 * 60 * 1000; // 10 minutes
                const cachedAd = localStorage.getItem(cacheKey);

                if (cachedAd) {
                    try {
                        const { data, timestamp } = JSON.parse(cachedAd);
                        if (Date.now() - timestamp < cacheTTL && data?.image_url) {
                            console.log('✅ Using cached popup ad');
                            setImageSrc(data.image_url);
                            setVisible(true);
                            return;
                        }
                    } catch (e) {
                        console.warn('Cache parse error for popup ad');
                    }
                }

                // Fetch from API
                const response = await fetch(`${API_BASE_URL}/popup-ad`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.image_url) {
                        // Store in cache
                        localStorage.setItem(cacheKey, JSON.stringify({
                            data,
                            timestamp: Date.now()
                        }));
                        setImageSrc(data.image_url);
                        setVisible(true); // Tampilkan hanya jika ada gambar
                    }
                }
            } catch (err) {
                console.warn("Failed to fetch popup ad, using default.", err);
            }
        };

        fetchAd();

        // Show after mount removed - waiting for API


        const autoClose = setTimeout(() => {
            handleClose();
        }, 10000);

        return () => clearTimeout(autoClose);
    }, [API_BASE_URL]);

    const handleClose = () => {
        setVisible(false);
        // Remove from DOM after transition
        setTimeout(() => setExists(false), 300);
    };

    if (!exists || !imageSrc) return null; // Jangan render jika tidak ada imageSrc

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-[80%] max-w-[400px] bg-transparent relative shadow-2xl">
                <div className="text-right">
                    <button
                        onClick={handleClose}
                        className="text-white text-3xl font-bold p-2 opacity-80 hover:opacity-100 leading-none"
                    >
                        &times;
                    </button>
                </div>
                <div className="bg-transparent text-center p-2">
                    <img
                        src={imageSrc}
                        alt="Info Kesehatan"
                        className="max-w-full h-auto rounded-lg mx-auto"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            handleClose(); // Tutup popup jika gambar error (misal 404)
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default HealthPopup;
