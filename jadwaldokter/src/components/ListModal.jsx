import React, { useState, useEffect } from 'react';
import { formatLeaveDates } from '../utils/dateUtils';

const ListModal = ({ isOpen, onClose, title, data, type }) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Lock body scroll when modal is open
    useEffect(() => {
        if (!isOpen) return;

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
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredData = data.filter(item =>
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ touchAction: 'none' }}>
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[85vh] animate-fadeIn" style={{ touchAction: 'auto' }}>
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white rounded-t-2xl z-10 sticky top-0">
                    <h3 className="text-lg font-bold text-[#0c4a6e]">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 border-b border-slate-100 bg-white sticky top-[73px] z-10">
                    <input
                        type="text"
                        placeholder="Cari nama dokter..."
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0c4a6e] focus:border-transparent transition-all text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                <div className="p-4 overflow-y-auto space-y-3">
                    {filteredData.length > 0 ? (
                        filteredData.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className={`w-14 h-14 rounded-full object-cover border border-slate-200 flex-shrink-0 ${type === 'leave' ? 'grayscale' : ''}`}
                                />
                                <div className="flex-grow">
                                    <h4 className="font-semibold text-slate-900 leading-tight mb-1">{item.name}</h4>

                                    {type === 'today' && (
                                        <>
                                            <p className="text-xs text-slate-500 mb-1">{item.specialty}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {item.times.map((t, i) => (
                                                    <span key={i} className="px-2 py-1 bg-blue-50 text-[#01007f] text-xs font-bold rounded-md border border-blue-100">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {type === 'leave' && (
                                        <div className="space-y-1 mt-1">
                                            {item.formattedDates ? (
                                                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-md inline-block mr-2 border border-red-100">
                                                    {item.formattedDates}
                                                </div>
                                            ) : (
                                                item.dates.map((d, i) => (
                                                    <div key={i} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-md inline-block mr-2 border border-red-100">
                                                        <b>{d.start}</b> s/d <b>{d.end}</b>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-500 py-8">Tidak ada data untuk "{searchQuery}"</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListModal;
