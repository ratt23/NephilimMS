import React, { useEffect, useState, useMemo } from 'react';
import DoctorCard from './DoctorCard';
import { getDoctorLeaveStatus } from '../utils/dateUtils';
import { useConfig } from '../context/ConfigContext';

const DoctorModal = ({ specialtyKey, specialtyData, leaveData, onClose }) => {
    // Animation state
    const [visible, setVisible] = useState(false);
    const { doctorPriority } = useConfig();

    // Lock body scroll when modal is open
    useEffect(() => {
        // Lock body scroll
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;

        // Prevent scroll
        document.body.style.overflow = 'hidden';

        // Prevent layout shift from scrollbar
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // Cleanup: restore original styles
        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
        };
    }, []);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
    };

    // Sorting Logic
    const sortedDoctors = useMemo(() => {
        if (!specialtyData || !specialtyData.doctors) return [];

        // Normalize key to lower case to match config keys just in case
        const key = specialtyKey ? specialtyKey.toLowerCase() : '';
        const priorityList = doctorPriority[key] || [];

        return [...specialtyData.doctors].sort((a, b) => {
            // Check exact name match first
            let indexA = priorityList.indexOf(a.name);
            let indexB = priorityList.indexOf(b.name);

            // If not found, try trimming/normalizing if needed (optional robustness)
            if (indexA === -1) indexA = priorityList.findIndex(p => p.toLowerCase() === a.name.toLowerCase());
            if (indexB === -1) indexB = priorityList.findIndex(p => p.toLowerCase() === b.name.toLowerCase());

            // If both are in priority list, sort by index
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }

            // If only A is in list, A comes first
            if (indexA !== -1) return -1;

            // If only B is in list, B comes first
            if (indexB !== -1) return 1;

            // Otherwise maintain original order
            return 0;
        });
    }, [specialtyData, specialtyKey, doctorPriority]);

    if (!specialtyData) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`} style={{ touchAction: 'none' }}>
            <div className={`bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] transition-transform duration-300 ${visible ? 'scale-100' : 'scale-90'}`} style={{ touchAction: 'auto' }}>
                <div className="flex items-center justify-between p-4 bg-[#01007f] text-white">
                    <h3 className="text-xl font-bold">{specialtyData.title}</h3>
                    <button onClick={handleClose} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
                </div>

                <div className="p-4 overflow-y-auto flex-grow bg-slate-50">
                    <div className="flex flex-col gap-4">
                        {sortedDoctors.map((doctor, idx) => {
                            const leaveStatus = getDoctorLeaveStatus(doctor.name, leaveData);
                            return (
                                <DoctorCard
                                    key={idx}
                                    doctor={doctor}
                                    specialtyTitle={specialtyData.title}
                                    leaveStatus={leaveStatus}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={handleClose}></div>
        </div>
    );
};

export default DoctorModal;
