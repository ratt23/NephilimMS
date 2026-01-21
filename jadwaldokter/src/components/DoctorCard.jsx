import React from 'react';
import { formatDisplayDate } from '../utils/dateUtils';
import { trackEvent } from './AnalyticsTracker';
import { useConfig } from '../context/ConfigContext';
import { getProxiedImageUrl } from '../utils/imageUtils';

const DoctorCard = ({ doctor, specialtyTitle, leaveStatus }) => {
    const config = useConfig();
    const isOnLeave = !!leaveStatus;

    // Schedule Processing
    const daysOrder = { senin: 'Senin', selasa: 'Selasa', rabu: 'Rabu', kamis: 'Kamis', jumat: 'Jumat', sabtu: 'Sabtu' };
    let scheduleRows = [];
    let scheduleTextForWhatsApp = '';

    // Sanitize specialty for event name (remove spaces/special chars)
    const sanitizedSpecialty = specialtyTitle
        ? specialtyTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
        : 'general';
    const eventName = `interest_${sanitizedSpecialty}`;

    for (const dayKey in daysOrder) {
        const scheduleData = doctor.schedule?.[dayKey];
        let scheduleTime = null;
        if (typeof scheduleData === 'string') { scheduleTime = scheduleData; }
        else if (typeof scheduleData === 'object' && scheduleData !== null && scheduleData.jam) { scheduleTime = scheduleData.jam; }

        if (scheduleTime && scheduleTime.trim() !== '-' && scheduleTime.trim() !== '') {
            let time = scheduleTime;
            scheduleTextForWhatsApp += `${daysOrder[dayKey]}: ${time}\\n`;

            // Highlight (MCU) for Dokter Umum
            if (specialtyTitle && specialtyTitle.includes('Dokter Umum') && time.includes('/')) {
                const parts = time.split('/');
                time = (
                    <span>
                        {parts[0].trim()} / <span className="bg-[#ffd700] text-[#cc0000] font-bold px-1 rounded whitespace-nowrap">(MCU)</span> {parts[1].trim()}
                    </span>
                );
            }
            scheduleRows.push({ day: daysOrder[dayKey], time: time });
        }
    }

    const whatsappText = encodeURIComponent(`Jadwal Dokter:\\nNama: ${doctor.name}\\nSpesialisasi: ${specialtyTitle}\\n\\nJadwal Praktik:\\n${scheduleTextForWhatsApp}`);

    // Use proxy for Cloudinary images to bypass CORS
    const imageUrl = getProxiedImageUrl(doctor.image_url || '/asset/logo/logo.png');

    // Check if updated recently (3 days) or Manual Override
    const isNew = React.useMemo(() => {
        // Manual override
        if (config?.manualUpdateIds && (config.manualUpdateIds.includes(doctor.id) || config.manualUpdateIds.includes(String(doctor.id)))) {
            return true;
        }

        if (!doctor.updated_at) return false;
        const diff = new Date() - new Date(doctor.updated_at);
        return diff < 3 * 24 * 60 * 60 * 1000;
    }, [doctor.updated_at, config, doctor.id]);

    return (
        <div
            onClick={() => trackEvent(eventName, { doctor: doctor.name, specialty: specialtyTitle })}
            className={`flex items-start gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-hidden relative cursor-pointer hover:shadow-md transition-shadow ${isOnLeave ? 'bg-slate-50' : ''}`}
        >
            {isNew && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                    NEW
                </div>
            )}
            <div className="flex-shrink-0">
                <img
                    src={imageUrl}
                    alt={`Foto ${doctor.name}`}
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/asset/logo/logo.png'; }}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover ${isOnLeave ? 'grayscale' : ''}`}
                />
            </div>
            <div className="flex-grow min-w-0">
                <h4 className="text-lg font-bold text-slate-800 m-0">{doctor.name}</h4>
                <p className="text-sm font-semibold text-[#01007f] mt-0.5">{specialtyTitle}</p>

                {isOnLeave && (
                    <div className="inline-block bg-red-50 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full mt-2">
                        Cuti hingga {formatDisplayDate(leaveStatus.TanggalSelesaiCuti)}
                    </div>
                )}

                <p className="text-sm font-semibold text-slate-600 mt-3 mb-1">Jadwal Praktik:</p>
                <div className="text-sm text-slate-500">
                    {scheduleRows.length > 0 ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="py-1 w-20">Hari</th>
                                    <th className="py-1">Jam</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scheduleRows.map((row, idx) => (
                                    <tr key={idx} className="border-b border-slate-50 last:border-none">
                                        <td className="py-1">{row.day}</td>
                                        <td className="py-1">{row.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-sm text-slate-400">Jadwal tidak tersedia.</p>
                    )}
                </div>

                <a
                    href={`https://wa.me/?text=${whatsappText}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('click_whatsapp_schedule', { doctor: doctor.name })}
                    className="flex items-center justify-center gap-2 w-full mt-3 bg-green-600 text-white border-none py-2 px-3 rounded-lg font-semibold text-sm hover:bg-green-700 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01C17.18 3.03 14.69 2 12.04 2M12.05 3.66c2.2 0 4.26.85 5.82 2.41 1.55 1.56 2.41 3.63 2.41 5.85 0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32c-.82-1.29-1.26-2.82-1.26-4.38 0-4.54 3.7-8.23 8.24-8.23" /></svg>
                    <span>Bagikan Jadwal</span>
                </a>
            </div>
        </div>
    );
};

export default DoctorCard;
