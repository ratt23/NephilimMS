import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { getApiBaseUrl } from '../utils/apiConfig';

import McuPackageCard from '../components/McuPackageCard';
import McuFormModal from '../components/McuFormModal';

const McuView = () => {
    const config = useConfig();
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch packages from API
    React.useEffect(() => {
        const fetchPackages = async () => {
            try {
                // Determine API base URL (using config logic or relative path)
                const apiBase = getApiBaseUrl();
                const response = await fetch(`${apiBase}/mcu-packages`);
                if (!response.ok) throw new Error('Failed to fetch packages');
                const data = await response.json();
                setPackages(data);
            } catch (err) {
                console.error("Failed to load MCU packages", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    if (loading) return <div className="p-10 text-center text-slate-500">Loading packages...</div>;

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
                {packages.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 bg-white rounded-lg shadow-sm border border-slate-200">
                        <p>Belum ada paket MCU yang tersedia saat ini.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {packages.map(pkg => (
                            <McuPackageCard key={pkg.id} pkg={pkg} onSelect={setSelectedPkg} />
                        ))}
                    </div>
                )}
            </div>

            {selectedPkg && (
                <McuFormModal pkg={selectedPkg} onClose={() => setSelectedPkg(null)} />
            )}
        </div>
    );
};

export default McuView;
