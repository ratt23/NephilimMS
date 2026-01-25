import React, { useState } from 'react';
import { ChevronDown, X, Construction } from 'lucide-react';
import { getValidImageUrl, getProxiedImageUrl } from '../utils/imageUtils';

export default function CategoryAccordion({ activeCategory, setActiveCategory, categoryCovers = {}, categoryVisibility = {}, categories = [] }) {
    // Legacy descriptions for default categories
    const LEGACY_DESCRIPTIONS = {
        'tarif-kamar': 'Informasi lengkap mengenai tipe kamar, fasilitas rawat inap, dan tarif harian terbaru.',
        'fasilitas': 'Teknologi medis terkini dan fasilitas penunjang untuk kenyamanan pasien.',
        'layanan-unggulan': 'Pusat layanan kesehatan dengan tenaga medis spesialis dan peralatan modern.',
        'contact-person': 'Layanan bantuan 24 jam dan informasi pendaftaran pasien.'
    };

    // Fallback if categories is empty (should not happen if parent handles it, but safe to have)
    const displayCategories = categories.length > 0 ? categories : [
        { id: 'tarif-kamar', label: 'Tarif Kamar' },
        { id: 'fasilitas', label: 'Fasilitas' },
        { id: 'layanan-unggulan', label: 'Layanan Unggulan' },
        { id: 'contact-person', label: 'Contact Person' }
    ];

    const handleCategoryClick = (id) => {
        // Prevent navigation to disabled categories
        if (categoryVisibility[id] === false) {
            return; // Do nothing for disabled categories
        }

        if (activeCategory === id) {
            // Close: scroll back to top
            setActiveCategory(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Open: set active and scroll to content
            setActiveCategory(id);
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    const headerHeight = 180; // Fixed header height when active
                    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    };


    const activeCat = displayCategories.find(cat => cat.id === activeCategory);

    // Helper to get category details (image/desc)
    const getCatDetails = (catId) => ({
        image: getValidImageUrl(categoryCovers[catId]),
        description: LEGACY_DESCRIPTIONS[catId] || 'Informasi lengkap kategori ini.'
    });

    const activeCatDetails = activeCat ? getCatDetails(activeCat.id) : null;

    return (
        <>
            {/* Fixed Header when category is active */}
            {activeCat && activeCatDetails && (
                <div className="fixed-category-header">
                    <div className="header-background">
                        <img
                            src={activeCatDetails.image}
                            alt={activeCat.label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = getProxiedImageUrl('/asset/categories/placeholder.svg');
                            }}
                        />
                        <div className="header-overlay" />
                    </div>
                    <div className="header-content-wrapper">
                        <div className="header-info">
                            <h2 className="active-title">{activeCat.label}</h2>
                            <p className="active-description">{activeCatDetails.description}</p>
                        </div>
                        <button
                            className="close-header-btn"
                            onClick={() => handleCategoryClick(activeCat.id)}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            )}

            {/* Category Menu - Only visible when no category is active */}
            {!activeCategory && (
                <div className="category-accordion-wrapper">
                    <div className="accordion-container">
                        {displayCategories.map((cat) => {
                            const isDisabled = categoryVisibility[cat.id] === false;
                            const details = getCatDetails(cat.id);

                            return (
                                <div
                                    key={cat.id}
                                    className={`accordion-item ${isDisabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                    onClick={() => !isDisabled && handleCategoryClick(cat.id)}
                                    style={isDisabled ? { pointerEvents: 'none' } : {}}
                                >
                                    <div className="accordion-image-bg">
                                        <img
                                            src={details.image}
                                            alt={cat.label}
                                            className="w-full h-full object-cover absolute inset-0"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = getProxiedImageUrl('/asset/categories/placeholder.svg');
                                            }}
                                        />
                                        <div className="image-overlay" />
                                        {isDisabled && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                                <div className="text-center">
                                                    <Construction size={32} className="mx-auto mb-2 text-orange-400" />
                                                    <span className="text-white font-semibold text-sm">Coming Soon</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="accordion-content">
                                        <div className="accordion-header">
                                            <h3 className="cat-title">{cat.label}</h3>
                                            {isDisabled ? (
                                                <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">Coming Soon</span>
                                            ) : (
                                                <ChevronDown className="chevron-icon" size={20} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}
