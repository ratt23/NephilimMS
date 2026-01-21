import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { formatDisplayDate } from '../utils/dateUtils';
import { getApiBaseUrl } from '../utils/apiConfig';

const CategoryNav = () => {
    const config = useConfig();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const location = useLocation();

    // Fetch leave data
    const [leaveData, setLeaveData] = useState([]);

    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                // Use centralized config and new Hono endpoint
                const res = await fetch(`${getApiBaseUrl()}/doctors/on-leave`);
                if (res.ok) {
                    const data = await res.json();
                    setLeaveData(data);
                }
            } catch (err) {
                console.error("Failed to load leaves for nav", err);
            }
        };
        fetchLeaves();
    }, []);

    // Filter active leaves
    const activeLeaves = leaveData.filter(leave => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(leave.TanggalSelesaiCuti);
        // Check if date is valid
        if (isNaN(end.getTime())) return false;
        return end >= today;
    });

    const marqueeText = activeLeaves.length > 0
        ? activeLeaves.map(l => `📅 ${l.NamaDokter} (${l.Keterangan || 'Cuti'}) ${formatDisplayDate(l.TanggalMulaiCuti)} - ${formatDisplayDate(l.TanggalSelesaiCuti)}`).join(' • ')
        : "✅ Saat ini seluruh dokter praktik sesuai jadwal.";

    // Only show on article pages
    const isArticlePage = location.pathname.startsWith('/article');

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                setIsVisible(false);
            } else {
                // Scrolling up
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    if (!isArticlePage) return null;

    return (
        <div
            className={`sticky top-[72px] md:top-[88px] z-40 bg-primary text-white shadow-md transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
        >
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center gap-3 w-full overflow-hidden">
                    <h2 className="text-sm md:text-base font-bold font-poppins whitespace-nowrap flex-shrink-0 text-yellow-300">
                        Cuti Dokter :
                    </h2>
                    <div className="flex-grow overflow-hidden relative h-6">
                        <div className="animate-marquee whitespace-nowrap absolute top-0 left-0 flex items-center h-full text-sm font-medium">
                            <span className="mx-4">{marqueeText} • Hubungi 1-500-911 untuk info lanjut.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryNav;
