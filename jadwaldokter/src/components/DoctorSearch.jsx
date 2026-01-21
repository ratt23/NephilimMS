import React from 'react';

const DoctorSearch = ({ value, onChange, onClear }) => {
    return (
        <div className="p-6">
            <div className="relative mb-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </span>
                <input
                    type="text"
                    placeholder="Cari nama dokter atau spesialisasi..."
                    className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black shadow-sm"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                {value && (
                    <button
                        onClick={onClear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default DoctorSearch;
