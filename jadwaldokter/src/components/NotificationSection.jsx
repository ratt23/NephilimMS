import React, { useState, useMemo } from 'react';
import Ticker from './Ticker';
import ListModal from './ListModal';
import PingPongText from './PingPongText'; // Use new component
// import AutoScrollText from './AutoScrollText'; // Removed
import { parseDateFromString, formatDisplayDate, formatLeaveDates } from '../utils/dateUtils';
import { useConfig } from '../context/ConfigContext';
import { getProxiedImageUrl } from '../utils/imageUtils'; // Import proxy util

const NotificationSection = ({ doctorsData, leaveData }) => {
    const config = useConfig();
    const [isTodayModalOpen, setIsTodayModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    // --- Derived Data Logic ---

    // 1. Doctors on Leave
    const leaveDoctors = useMemo(() => {
        if (!leaveData || !leaveData.length) return [];
        return leaveData.map(l => {
            let image = '/asset/logo/logo.png';
            // Find doctor image from doctorsData
            for (const key in doctorsData) {
                if (doctorsData[key] && doctorsData[key].doctors) {
                    const found = doctorsData[key].doctors.find(d => d.name === l.NamaDokter);
                    if (found) { image = getProxiedImageUrl(found.image_url || '/asset/logo/logo.png'); break; }
                }
            }
            return {
                name: l.NamaDokter,
                image,
                start: formatDisplayDate(l.TanggalMulaiCuti),
                end: formatDisplayDate(l.TanggalSelesaiCuti)
            };
        });
    }, [leaveData, doctorsData]);

    // 2. Doctors Today
    const todayDoctors = useMemo(() => {
        if (!doctorsData || Object.keys(doctorsData).length === 0) return [];
        const todayUrl = new Date();
        const dayNames = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
        const todayKey = dayNames[todayUrl.getDay()];
        const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);

        const list = [];

        // Helper to check leave
        const isLeave = (imgName) => {
            return leaveData.some(l => {
                const s = parseDateFromString(l.TanggalMulaiCuti);
                const e = parseDateFromString(l.TanggalSelesaiCuti);
                return l.NamaDokter === imgName && todayDate >= s && todayDate <= e;
            });
        };

        for (const key in doctorsData) {
            const specialty = doctorsData[key];
            if (specialty && specialty.doctors) {
                specialty.doctors.forEach(doc => {
                    const scheduleData = doc.schedule?.[todayKey];
                    let scheduleTime = null;
                    if (typeof scheduleData === 'string') scheduleTime = scheduleData;
                    else if (typeof scheduleData === 'object' && scheduleData?.jam) scheduleTime = scheduleData.jam;

                    if (scheduleTime && scheduleTime.trim() !== '-' && !isLeave(doc.name)) {
                        // Clean HTML tags from scheduleTime if any
                        const timeClean = scheduleTime.replace(/<[^>]*>?/gm, '');
                        list.push({
                            name: doc.name,
                            image: getProxiedImageUrl(doc.image_url || '/asset/logo/logo.png'),
                            specialty: specialty.title,
                            time: timeClean
                        });
                    }
                });
            }
        }
        return list;
    }, [doctorsData, leaveData]);

    // 3. Recently Updated Doctors (Last 7 Days)
    const updatedDoctors = useMemo(() => {
        if (!doctorsData || Object.keys(doctorsData).length === 0) return [];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const list = [];
        for (const key in doctorsData) {
            const specialty = doctorsData[key];
            if (specialty && specialty.doctors) {
                specialty.doctors.forEach(doc => {
                    if (doc.updated_at) {
                        const updatedDate = new Date(doc.updated_at);
                        if (updatedDate >= sevenDaysAgo) {
                            list.push({
                                name: doc.name,
                                image: getProxiedImageUrl(doc.image_url || '/asset/logo/logo.png'),
                                specialty: specialty.title,
                                updatedTime: updatedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                            });
                        }
                    }
                });
            }
        }
        return list.sort((a, b) => new Date(b.updatedTime) - new Date(a.updatedTime));
    }, [doctorsData]);

    // Data Processing for Modals
    const processedLeaveList = useMemo(() => {
        if (!leaveDoctors.length) return [];
        const groups = {};
        leaveDoctors.forEach(item => {
            if (!groups[item.name]) {
                groups[item.name] = {
                    name: item.name,
                    image: item.image,
                    dates: []
                };
            }
            groups[item.name].dates.push({ start: item.start, end: item.end });
        });
        const result = Object.values(groups).map(group => ({
            ...group,
            formattedDates: formatLeaveDates(group.dates)
        }));
        return result.sort((a, b) => {
            const dateA = a.dates[0]?.start ? parseDateFromString(a.dates[0].start) : new Date(8640000000000000);
            const dateB = b.dates[0]?.start ? parseDateFromString(b.dates[0].start) : new Date(8640000000000000);
            return dateA - dateB;
        });
    }, [leaveDoctors]);

    const processedTodayList = useMemo(() => {
        if (!todayDoctors.length) return [];
        const groups = {};
        todayDoctors.forEach(item => {
            if (!groups[item.name]) {
                groups[item.name] = {
                    name: item.name,
                    image: item.image,
                    specialty: item.specialty,
                    times: []
                };
            }
            if (!groups[item.name].times.includes(item.time)) {
                groups[item.name].times.push(item.time);
            }
        });
        return Object.values(groups);
    }, [todayDoctors]);

    if (todayDoctors.length === 0 && leaveDoctors.length === 0) return null;

    return (
        <section id="notifications-section" className="mb-8 px-4 md:px-6">
            <div className="grid grid-cols-2 gap-2 md:gap-6">
                {config.features.polyclinicToday && todayDoctors.length > 0 && (
                    <Ticker
                        title="Poliklinik Hari Ini"
                        onClick={() => setIsTodayModalOpen(true)}
                        headerClassName="bg-[#01007f] text-white font-poppins text-[11px] md:text-sm py-1.5 md:py-2"
                    >
                        {todayDoctors.map((doc, i) => (
                            <div key={i} className="flex items-center gap-1.5 md:gap-3 bg-[#f8fafc] p-1.5 md:p-3 rounded-xl border border-slate-200">
                                <img src={doc.image} alt={doc.name} loading="lazy" className="w-7 h-7 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0" />
                                <div className="flex-grow min-w-0 overflow-hidden relative">
                                    <PingPongText text={doc.name} className="font-semibold text-[10px] md:text-sm text-[#1f2937] leading-tight" />
                                    <PingPongText text={doc.specialty} className="text-[9px] md:text-xs text-slate-500" />
                                    <div className="text-[9px] md:text-xs font-bold text-[#01007f] mt-0.5">{doc.time}</div>
                                </div>
                            </div>
                        ))}
                    </Ticker>
                )}

                {config.features.doctorLeave && processedLeaveList.length > 0 && (
                    <Ticker
                        title="Dokter Cuti"
                        onClick={() => setIsLeaveModalOpen(true)}
                        headerClassName="bg-red-600 text-white font-poppins text-[11px] md:text-sm py-1.5 md:py-2"
                        className="h-full"
                    >
                        {processedLeaveList.map((doc, i) => (
                            <div key={i} className="flex items-start gap-2 md:gap-3 bg-red-50 p-2 md:p-3 rounded-xl border border-red-100 h-auto min-h-[60px]">
                                <img src={doc.image} alt={doc.name} loading="lazy" className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0 border border-red-200" />
                                <div className="flex-grow min-w-0 flex flex-col justify-center overflow-hidden">
                                    <PingPongText text={doc.name} className="font-semibold text-[11px] md:text-sm text-gray-800 leading-tight mb-0.5" />
                                    <PingPongText text={doc.formattedDates} className="text-[10px] md:text-xs text-red-600 font-medium leading-tight" />
                                </div>
                            </div>
                        ))}
                    </Ticker>
                )}


            </div>

            <ListModal
                isOpen={isTodayModalOpen}
                onClose={() => setIsTodayModalOpen(false)}
                title="Poliklinik Hari Ini"
                data={processedTodayList}
                type="today"
            />

            <ListModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                title="Informasi Dokter Cuti"
                data={processedLeaveList}
                type="leave"
            />
        </section>
    );
};

export default NotificationSection;
