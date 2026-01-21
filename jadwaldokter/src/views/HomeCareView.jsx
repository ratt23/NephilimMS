import React from 'react';
import { useConfig } from '../context/ConfigContext';

const HomeCareView = () => {
    const config = useConfig();
    return (
        <div className="pb-10">
            <h1 className="sr-only">Layanan {config.hospitalShortName || 'Siloam'} at Home - {config.hospitalName || 'RSU Siloam Ambon'}</h1>

            {/* Header Section */}
            <section className="bg-gradient-to-br from-[#01007f] to-[#0c4a6e] text-white px-4 py-6 md:px-6 md:py-8 mb-6">
                <div className="max-w-4xl mx-auto">
                    <div>
                        <h2 className="text-2xl font-bold">Home Care</h2>
                        <p className="text-sm text-white/80">Layanan Kesehatan di Rumah Anda</p>
                    </div>
                </div>
            </section>

            {/* Content Section - Empty for now */}
            <div className="px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
                        <p className="text-slate-500">Konten akan ditambahkan di sini</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeCareView;
