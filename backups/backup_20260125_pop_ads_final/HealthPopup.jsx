import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../utils/apiConfig';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HealthPopup = () => {
    const [visible, setVisible] = useState(false);
    const [exists, setExists] = useState(true);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // API Config
    const API_BASE_URL = getApiBaseUrl();

    useEffect(() => {
        // Fetch dynamic ad image
        const fetchAd = async () => {
            try {
                if (!API_BASE_URL) return;

                // Fetch from API (Updated to support multi-images)
                const response = await fetch(`${API_BASE_URL}/popup-ad`);
                if (response.ok) {
                    const data = await response.json();

                    // Handle API V2 (Array) or V1 (String)
                    let imgs = [];
                    if (Array.isArray(data.images)) {
                        imgs = data.images;
                    } else if (data.image_url) {
                        imgs = [data.image_url];
                    }

                    if (imgs.length > 0 && data.active !== false) {
                        setImages(imgs);
                        setVisible(true);
                        setExists(true);
                    }
                }
            } catch (err) {
                console.warn("Failed to fetch popup ad", err);
            }
        };

        fetchAd();

        // Auto Close REMOVED as per request
        // Popup stays open until manual close

    }, [API_BASE_URL]);

    const handleClose = () => {
        setVisible(false);
        // Remove from DOM after transition
        setTimeout(() => setExists(false), 300);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!exists || images.length === 0) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 transition-opacity duration-500 backdrop-blur-sm ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-[85%] max-w-[380px] bg-transparent relative animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors p-2 z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                    {/* Removed bg-black to allow transparency */}
                    <img
                        src={images[currentIndex]}
                        alt={`Info Kesehatan ${currentIndex + 1}`}
                        className="w-full h-auto object-contain max-h-[60vh]"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            if (images.length === 1) handleClose();
                        }}
                    />

                    {/* Navigation Buttons (Only if > 1 image) */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 text-white p-1.5 rounded-full transition-colors backdrop-blur-[2px]"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 text-white p-1.5 rounded-full transition-colors backdrop-blur-[2px]"
                            >
                                <ChevronRight size={20} />
                            </button>

                            {/* Dots Indicator */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {images.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HealthPopup;

