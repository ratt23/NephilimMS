import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { mcuPackages } from '../data/mcuPackages';
import McuPackageCard from '../components/McuPackageCard';
import McuFormModal from '../components/McuFormModal';

const McuView = () => {
    const config = useConfig();
    const [selectedPkg, setSelectedPkg] = useState(null);

    return (
        <div className="pb-10">
            <h1 className="sr-only">Paket Medical Check Up {config.hospitalName || 'RSU Siloam Ambon'}</h1>

            {/* Header Section */}
            <section className="bg-gradient-to-br from-[#01007f] to-[#0c4a6e] text-white px-4 py-6 md:px-6 md:py-8 mb-6">
                <div className="max-w-4xl mx-auto">
                    <div>
                        <h2 className="text-2xl font-bold">Paket Medical Check Up</h2>
                        <p className="text-sm text-white/80">Pemeriksaan kesehatan menyeluruh untuk deteksi dini</p>
                    </div>
                </div>
            </section>

            {/* MCU Packages Grid */}
            <div className="px-4 md:px-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {mcuPackages.map(pkg => (
                        <McuPackageCard key={pkg.id} pkg={pkg} onSelect={setSelectedPkg} />
                    ))}
                </div>
            </div>

            {selectedPkg && (
                <McuFormModal pkg={selectedPkg} onClose={() => setSelectedPkg(null)} />
            )}
        </div>
    );
};

export default McuView;
