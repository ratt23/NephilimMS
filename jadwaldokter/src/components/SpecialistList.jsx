import React from 'react';
import { Link } from 'react-router-dom';
import { specialtyOrder } from '../data/specialtyOrder';
import { useConfig } from '../context/ConfigContext';

const SpecialistList = ({ doctorsData, onSelectSpecialty }) => {
    const config = useConfig();
    const specialtyCustomOrder = specialtyOrder;

    const sortedKeys = Object.keys(doctorsData).sort((a, b) => {
        const getIndex = (key) => {
            // Priority 1: Exact match
            const exactIndex = specialtyCustomOrder.indexOf(key);
            if (exactIndex !== -1) return exactIndex;

            // Priority 2: Longest partial match (most specific)
            const matches = specialtyCustomOrder
                .map((orderKey, index) => ({
                    orderKey,
                    index,
                    isMatch: key.includes(orderKey)
                }))
                .filter(m => m.isMatch);

            if (matches.length === 0) return 999;

            // Sort by length descending to get the most specific match
            matches.sort((m1, m2) => m2.orderKey.length - m1.orderKey.length);
            return matches[0].index;
        };

        return getIndex(a) - getIndex(b);
    });

    return (
        <div id="specialist-list" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 px-4 md:px-6 pb-6 mt-4">
            {sortedKeys.map(key => {
                const data = doctorsData[key];
                const hasNew = data.doctors.some(doc => {
                    // Check Manual Update List (Force New)
                    if (config?.manualUpdateIds && (config.manualUpdateIds.includes(doc.id) || config.manualUpdateIds.includes(String(doc.id)))) {
                        return true;
                    }

                    // Check Timestamp (Recent Update)
                    if (!doc.updated_at) return false;
                    return (new Date() - new Date(doc.updated_at)) < 3 * 24 * 60 * 60 * 1000;
                });

                return (
                    <Link
                        key={key}
                        to={`/jadwal-dokter/siloam-ambon/${key}`}
                        className="flex items-center justify-center p-3 md:p-4 bg-primary rounded-xl font-poppins font-semibold text-white text-[11px] md:text-[0.8rem] text-center shadow-sm transition-all duration-200 min-h-[60px] md:min-h-[80px] hover:-translate-y-0.5 hover:shadow-md hover:brightness-110 leading-[1.3] relative"
                    >
                        <span>{data.title}</span>
                        {hasNew && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-sm"></span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
};

export default SpecialistList;
