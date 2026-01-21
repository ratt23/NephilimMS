import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSearchContext } from '../context/SearchContext';
import { Search } from 'lucide-react';
import IOSInstallPrompt from './IOSInstallPrompt';

import { useConfig } from '../context/ConfigContext';
import PingPongText from './PingPongText'; // Import PingPongText
import { getProxiedImageUrl } from '../utils/imageUtils'; // Import proxy util

const Header = () => {
    const { searchQuery, setSearchQuery } = useSearchContext();
    const config = useConfig();
    const location = useLocation();
    const navigate = useNavigate();

    const [isSubscribed, setIsSubscribed] = React.useState(false);
    const [showIOSPrompt, setShowIOSPrompt] = React.useState(false);

    // Slider Logic
    const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleDoctorClick = (key) => {
        if (key) {
            navigate(`/jadwal-dokter/siloam-ambon/${key}`);
        }
    };

    // Process slides for mobile: Split doctor updates into single slides
    const slides = React.useMemo(() => {
        const rawSlides = config?.headerSlides || [];
        if (!isMobile) return rawSlides;

        const newSlides = [];
        rawSlides.forEach(slide => {
            if (slide.type === 'doctor-updates' && slide.data && slide.data.length > 1) {
                // Split multiple doctors into individual slides for mobile
                slide.data.forEach(doc => {
                    newSlides.push({
                        ...slide,
                        data: [doc] // Single doctor array
                    });
                });
            } else {
                newSlides.push(slide);
            }
        });
        return newSlides;
    }, [config?.headerSlides, isMobile]);

    // Reset index if out of bounds (when switching modes)
    React.useEffect(() => {
        if (currentSlideIndex >= slides.length) {
            setCurrentSlideIndex(0);
        }
    }, [slides.length, currentSlideIndex]);

    React.useEffect(() => {
        if (slides.length <= 1) return;

        let timer;
        const nextSlide = () => {
            setCurrentSlideIndex(prev => {
                const nextIndex = (prev + 1) % slides.length;
                return nextIndex;
            });
        };

        const currentSlide = slides[currentSlideIndex];
        // If "Jadwal Update" notification (detected by type or content)
        const isUpdateSlide = currentSlide?.type === 'doctor-updates';

        // Duration (DIPERLAMBAT): 
        // Mobile (Single Doc) -> 10s
        // Desktop (Multi Doc) -> 20s
        // Others -> 7s
        let delay = 7000;
        if (isUpdateSlide) {
            delay = isMobile ? 10000 : 20000;
        }

        timer = setTimeout(nextSlide, delay);

        return () => clearTimeout(timer);
    }, [currentSlideIndex, slides.length, slides, isMobile]);

    // Helper: Detect iOS
    const isIOS = () => {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    };

    // Helper: Detect Standalone (PWA) Mode
    const isStandalone = () => {
        return ('standalone' in window.navigator) && (window.navigator.standalone);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        // If on article page, stay there for article search
        // If on other pages, navigate to home for doctor search
        if (location.pathname.startsWith('/article')) {
            // Stay on article page for article search
            return;
        }
        if (location.pathname !== '/home') {
            navigate('/home');
        }
    };

    // Determine placeholder based on current page
    const searchPlaceholder = location.pathname.startsWith('/article')
        ? 'Cari artikel...'
        : 'Cari dokter atau spesialis...';

    React.useEffect(() => {
        if (window.OneSignalDeferred) {
            window.OneSignalDeferred.push(async function (OneSignal) {
                // Cek status awal
                setIsSubscribed(OneSignal.User.PushSubscription.optedIn);

                // Listen perubahan subscription
                OneSignal.User.PushSubscription.addEventListener("change", (event) => {
                    setIsSubscribed(event.current.optedIn);
                });
            });
        }
    }, []);

    const handleBellClick = () => {
        // Logika khusus iPhone (Jika iOS & Bukan PWA)
        if (isIOS() && !isStandalone()) {
            setShowIOSPrompt(true);
            return;
        }

        if (window.OneSignalDeferred) {
            window.OneSignalDeferred.push(async function (OneSignal) {
                if (isSubscribed) {
                    const confirmUnsub = window.confirm("Apakah Anda ingin berhenti berlangganan notifikasi?");
                    if (confirmUnsub) {
                        await OneSignal.User.PushSubscription.optOut();
                        alert("Berhasil berhenti berlangganan. 🔕");
                    }
                } else {
                    await OneSignal.Slidedown.promptPush({ force: true });
                }
            });
        }
    };

    return (
        <>
            <IOSInstallPrompt isOpen={showIOSPrompt} onClose={() => setShowIOSPrompt(false)} />
            <header className="bg-white shadow-md sticky top-0 z-50">
                {/* Row 1: Brand & Info (Existing) */}
                <div className="flex items-center justify-between gap-3 md:gap-4 p-3 md:p-6 pb-2 md:pb-4 border-b border-slate-50">
                    <div className="flex-shrink-0 w-[40%] max-w-[100px] md:w-auto md:max-w-none cursor-pointer" onClick={() => navigate('/home')}>
                        {config?.logoUrl ? (
                            <img src={config.logoUrl} alt={`Logo ${config?.hospitalShortName || 'Healthcare'} `} className="w-full h-auto md:h-14 md:w-auto" />
                        ) : (
                            <img src="/asset/logo/logo.png" alt={`Logo ${config?.hospitalShortName || 'Healthcare'} `} className="w-full h-auto md:h-14 md:w-auto" />
                        )}
                    </div>

                    {/* Dynamic Slider Section */}
                    <div className="h-10 md:h-14 flex-grow overflow-hidden relative bg-transparent text-primary basis-[60%] md:basis-auto flex items-center justify-end">
                        {config?.features?.headerSlider && slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`absolute right-0 top-0 h-full w-full flex items-center justify-end transition-all duration-500 ease-in-out transform ${index === currentSlideIndex
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-4 pointer-events-none'
                                    } `}
                            >
                                {slide.image ? (
                                    <img
                                        src={slide.image}
                                        alt={slide.title || 'Header Slide'}
                                        className="h-full w-auto object-contain"
                                    />
                                ) : (
                                    <div className="flex items-center justify-end gap-2 md:gap-3 font-semibold text-[0.7rem] md:text-base p-0 text-right font-[Poppins]" style={{ color: slide.color || '#01007f' }}>
                                        {/* New Slide Type: Doctor Updates (Rich Content) */}
                                        {slide.type === 'doctor-updates' && slide.data ? (
                                            <div className="flex items-center gap-2 md:gap-3 justify-center w-full">
                                                <div className="font-bold text-green-600 text-[10px] md:text-xs uppercase tracking-wider mr-1 md:mr-2 border-r border-green-200 pr-2 md:pr-3 animate-bounce-slight flex-shrink-0">
                                                    Update
                                                </div>
                                                {slide.data.map((doc, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => handleDoctorClick(doc.specialtyKey)}
                                                        className="flex items-center gap-3 bg-white/80 backdrop-blur-sm pr-4 pl-2 py-1.5 rounded-full border border-green-200 shadow-sm animate-bounce-slight max-w-[170px] md:max-w-[220px] cursor-pointer hover:bg-white transition-colors"
                                                    >
                                                        <img
                                                            src={getProxiedImageUrl(doc.image || '/asset/logo/logo.png')}
                                                            alt={doc.name}
                                                            className="w-7 h-7 md:w-9 md:h-9 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0 bg-white"
                                                            onError={(e) => e.target.src = '/asset/logo/logo.png'}
                                                        />
                                                        <div className="flex flex-col text-left leading-none min-w-0 flex-1 overflow-hidden relative h-full justify-center">
                                                            <PingPongText text={doc.name} className="font-bold text-[0.65rem] md:text-[0.8rem] text-slate-800" />
                                                            <PingPongText text={doc.specialty} className="text-[0.6rem] md:text-[0.7rem] text-green-700 font-medium" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            /* Default Text Slide */
                                            <div className="flex flex-col items-end leading-[1.2]">
                                                <span className="font-bold text-[0.9rem] md:text-[1.1rem]">{slide.title}</span>
                                                {slide.subtitle && (
                                                    <div className={`text-[0.65rem] md:text-[0.8rem] opacity-100 font-semibold max-w-[200px] md:max-w-[300px] overflow-hidden relative ${slide.marquee ? 'text-red-600' : ''} `}>
                                                        {slide.isNotification ? (
                                                            // Use PingPongText for Infos
                                                            <PingPongText text={slide.subtitle} className="" />
                                                        ) : (
                                                            <span className={slide.marquee ? 'animate-pulse' : ''}>{slide.subtitle}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Optional Icon */}
                                        {slide.type === 'phone' && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                            </svg>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Row 2: Navigation & Search */}
                <div className="flex flex-wrap items-center justify-between px-3 md:px-6 py-2 gap-2 bg-white">
                    <nav className="flex items-center gap-1 md:gap-6 overflow-x-auto no-scrollbar mask-image-linear-to-r w-full md:w-auto">
                        {config?.menu && config.menu.map((item) => (
                            <NavLink
                                key={item.id}
                                to={item.url}
                                className={({ isActive }) => `px-3 py-1.5 text-sm md:text-base font-semibold transition-colors duration-200 whitespace-nowrap ${isActive ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'} `}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex-grow md:flex-grow-0 w-full md:w-auto min-w-[200px] flex items-center gap-2">
                        <button
                            onClick={handleBellClick}
                            className={`p-2 rounded-full transition-colors relative ${isSubscribed ? 'text-primary bg-blue-50' : 'text-slate-500 hover:text-primary hover:bg-slate-100'} `}
                            title={isSubscribed ? "Anda sudah berlangganan" : "Langganan Notifikasi"}
                        >
                            {isSubscribed ? (
                                // Solid Bell with Checkmark Badge for Subscribed
                                <div className="relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                    </svg>
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
                                    </span>
                                </div>
                            ) : (
                                // Outline Bell for Not Subscribed
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            )}
                        </button>
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-9 pr-9 py-1.5 bg-slate-100 border-none rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-slate-400"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
