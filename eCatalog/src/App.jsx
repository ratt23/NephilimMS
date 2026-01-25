import React, { useState, useEffect } from 'react'
import CategoryAccordion from './components/CategoryAccordion'
import RoomCard from './components/RoomCard'
import FacilityCard from './components/FacilityCard'
import FacilityModal from './components/FacilityModal'
import ContactCard from './components/ContactCard'
import { useWhiteLabel } from './hooks/useWhiteLabel'
import { useCatalogItems } from './hooks/useCatalogItems'
import { getProxiedImageUrl } from './utils/imageUtils'
import RadiologySearch from './components/RadiologySearch'
import { Phone, MapPin, Mail, Clock, Bed, Shield, Star, PhoneCall } from 'lucide-react'
import './App.css'

function App() {
    // Get hash from URL or default to null
    const getHashCategory = () => {
        const hash = window.location.hash.slice(2); // Remove '#/' prefix
        return hash || null;
    };

    const [activeCategory, setActiveCategory] = useState(getHashCategory);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedFacility, setSelectedFacility] = useState(null);

    // White label settings from Dashboard
    const { settings: whiteLabel, loading: settingsLoading } = useWhiteLabel();

    // Catalog items for active category
    const { items: catalogItems, loading: itemsLoading } = useCatalogItems(activeCategory);

    // Sync activeCategory with URL hash
    useEffect(() => {
        const handleHashChange = () => {
            setActiveCategory(getHashCategory());
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Update URL when activeCategory changes
    const handleCategoryChange = (categoryId) => {
        if (categoryId) {
            window.location.hash = `#/${categoryId}`;
        } else {
            window.location.hash = '';
        }
        setActiveCategory(categoryId);
    };

    // Apply theme color dynamically
    useEffect(() => {
        if (whiteLabel?.themeColor) {
            document.documentElement.style.setProperty('--primary-color', whiteLabel.themeColor);
        }
    }, [whiteLabel]);

    // Loading state
    if (settingsLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    // Maintenance mode
    if (!whiteLabel?.ecatalogEnabled) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
                <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-blue-900 p-8 text-center">
                        <img src={getProxiedImageUrl(whiteLabel?.logoUrl || '/asset/logo/logo.png')} alt="Logo" className="h-20 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-white">{whiteLabel?.hospitalName || 'RSU Siloam Ambon'}</h1>
                    </div>
                    <div className="p-12 text-center">
                        <div className="bg-orange-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <Shield size={48} className="text-orange-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Sedang dalam Perbaikan</h2>
                        <p className="text-lg text-gray-600 mb-8">Mohon maaf, E-Catalog sedang dalam pemeliharaan. Silakan coba lagi nanti.</p>
                        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                            <p className="text-sm font-semibold text-gray-700 uppercase">Hubungi Kami:</p>
                            <div className="flex items-center justify-center gap-3">
                                <Phone size={20} className="text-blue-600" />
                                <span className="font-medium">{whiteLabel?.hospitalPhone || '1-500-911'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Prepare Categories
    let displayCategories = whiteLabel?.ecatalogCategories || [];

    // Fallback: Ensure Radiology is in the list IF not present AND visibility is true (or undefined)
    // But since we added it to defaults, we might not need this.
    // However, for existing deployments or cached settings, let's play safe:
    const isRadiologyVisible = whiteLabel?.categoryVisibility?.['radiology'] !== false;

    // Validate if 'radiology' is in displayCategories
    const radiologyExists = displayCategories.find(c => c.id === 'radiology');

    if (!radiologyExists && isRadiologyVisible) {
        // Inject if missing and visible
        const contactIndex = displayCategories.findIndex(c => c.id === 'contact-person');
        const radiologyCat = { id: 'radiology', label: 'Cek Harga Radiologi' };

        if (contactIndex !== -1) {
            displayCategories = [...displayCategories.slice(0, contactIndex), radiologyCat, ...displayCategories.slice(contactIndex)];
        } else {
            displayCategories = [...displayCategories, radiologyCat];
        }
    }

    // Also inject cover image if needed (locally, since we can't edit DB easily)
    const categoryCovers = {
        ...whiteLabel?.categoryCovers,
        'radiology': whiteLabel?.categoryCovers?.['radiology'] || '/asset/categories/radiology.jpg' // You might need to add this asset or use a placeholder
    };

    return (
        <div className="app-wrapper">
            {/* Header */}
            <header className="app-header">
                <div className="header-container">
                    <div className="header-logo">
                        <img src={getProxiedImageUrl(whiteLabel?.logoUrl || '/asset/logo/logo.png')} alt={whiteLabel?.hospitalName || 'RSU Siloam Ambon'} className="h-12" />
                    </div>
                    <div className="text-right">
                        <h1 className="text-xl font-bold leading-none mb-1" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: whiteLabel?.themeColor || '#0047AB' }}>eCatalog</h1>
                        <p className="text-[10px] font-semibold text-gray-400 tracking-[0.25em] uppercase">{whiteLabel?.hospitalName || 'RSU SILOAM AMBON'}</p>
                    </div>
                </div>
            </header>

            <main className="main-content">
                {/* Hero / Navigation Section */}
                <CategoryAccordion
                    activeCategory={activeCategory}
                    setActiveCategory={handleCategoryChange}
                    categoryCovers={categoryCovers}
                    categoryVisibility={whiteLabel?.categoryVisibility}
                    categories={displayCategories}
                />

                {/* Content Sections - Dynamic */}
                {activeCategory && (() => {
                    if (activeCategory === 'radiology') {
                        return (
                            <section id="radiology" className="content-section fade-in">
                                <RadiologySearch />
                            </section>
                        )
                    }

                    const currentCategory = displayCategories.find(c => c.id === activeCategory);
                    const CardComponent = activeCategory === 'fasilitas' ? FacilityCard :
                        activeCategory === 'contact-person' ? ContactCard :
                            RoomCard;

                    const isContact = activeCategory === 'contact-person';
                    const isFacility = activeCategory === 'fasilitas';

                    // Determine grid class
                    const gridClass = isContact
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        : isFacility
                            ? "facilities-grid mt-8" // Assuming FacilityCard handles its own internal layout or grid wrap
                            : "room-classes-grid mt-8";

                    // Specific empty message
                    const emptyMsg = isContact ? "Belum ada kontak yang tersedia." : "Belum ada item di kategori ini.";

                    return (
                        <section id={activeCategory} className="content-section fade-in">
                            {itemsLoading ? (
                                <div className="text-center py-8 text-gray-400">Memuat data...</div>
                            ) : catalogItems.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 max-w-md mx-auto">
                                    {isContact ? (
                                        <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 text-center">
                                            <Phone size={48} className="text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-400">{emptyMsg}</p>
                                        </div>
                                    ) : (
                                        <p>{emptyMsg}</p>
                                    )}
                                </div>
                            ) : (
                                <div className={gridClass}>
                                    {catalogItems.map(item => (
                                        <CardComponent
                                            key={item.id}
                                            item={item}
                                            // Props for specific cards
                                            onClick={isFacility ? setSelectedFacility : undefined}
                                            onImageClick={!isContact && !isFacility ? setSelectedImage : undefined}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    );
                })()}

                {/* Lightbox Modal */}
                {
                    selectedImage && (
                        <div
                            className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
                            onClick={() => setSelectedImage(null)}
                        >
                            <div className="relative max-w-4xl w-full max-h-[90vh]">
                                <img
                                    src={selectedImage}
                                    alt="Full Preview"
                                    className="w-full h-full object-contain rounded-lg shadow-2xl"
                                />
                                <button
                                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                                    onClick={() => setSelectedImage(null)}
                                >
                                    <span className="text-xl font-bold">Tutup [Esc]</span>
                                </button>
                            </div>
                        </div>
                    )
                }

                {/* Facility Detail Modal */}
                <FacilityModal
                    facility={selectedFacility}
                    onClose={() => setSelectedFacility(null)}
                />
            </main>

            <footer className="fixed bottom-0 left-0 w-full bg-[#0f1d3d] text-white z-40 py-2.5 font-['Poppins'] text-xs shadow-[0_-2px_10px_rgba(0,0,0,0.1)] border-t border-white/10">
                <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center flex-wrap gap-2.5 sm:flex-row flex-col text-center sm:text-left">
                    <div className="opacity-90">
                        <p>&copy; {new Date().getFullYear()} <b>{whiteLabel?.hospitalName || 'RSU Siloam Ambon'}</b>. All Rights Reserved.</p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                        <span>Designed & Developed by <b>Marcomm SHAB</b></span>
                        <a href="https://www.linkedin.com/in/raditya-putra-titapasanea-a250a616a/" target="_blank" rel="noopener noreferrer" className="text-white flex items-center transition-transform hover:text-[#a7c5ff] hover:scale-110">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.761-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </footer>
        </div >
    )
}

export default App
