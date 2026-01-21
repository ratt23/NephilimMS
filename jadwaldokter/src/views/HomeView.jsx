import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { useDoctorData } from '../hooks/useDoctorData';
import { useSearchContext } from '../context/SearchContext'; // Import Context
import { parseDateFromString } from '../utils/dateUtils';
import SpecialistList from '../components/SpecialistList';
// import DoctorSearch from '../components/DoctorSearch'; // Removed
import DoctorCard from '../components/DoctorCard';
import DoctorModal from '../components/DoctorModal';
import NotificationSection from '../components/NotificationSection';
import AdDisplay from '../components/AdDisplay';

const HomeView = () => {
    const config = useConfig();
    const { doctorsData, leaveData, loading } = useDoctorData();
    const { searchQuery, setSearchQuery } = useSearchContext(); // Use Context
    const [selectedSpecialty, setSelectedSpecialty] = useState(null); // { key, data }
    const { specialtyId } = useParams();
    const navigate = useNavigate();

    // Effect to handle URL based selection
    useEffect(() => {
        if (specialtyId && !loading && doctorsData) {
            const specialtyData = doctorsData[specialtyId];
            if (specialtyData) {
                setSelectedSpecialty({ key: specialtyId, data: specialtyData });
            }
        }
    }, [specialtyId, loading, doctorsData]);

    const handleCloseModal = () => {
        setSelectedSpecialty(null);
        if (specialtyId) {
            navigate('/home');
        }
    };

    // --- Search Results Logic ---
    const searchResults = useMemo(() => {
        if (!searchQuery) return [];
        const query = searchQuery.toLowerCase();
        const results = [];
        const seen = new Set();

        for (const key in doctorsData) {
            const spec = doctorsData[key];
            if (spec && spec.doctors) {
                spec.doctors.forEach(doc => {
                    if ((doc.name.toLowerCase().includes(query) || spec.title.toLowerCase().includes(query)) && !seen.has(doc.name)) {
                        seen.add(doc.name);
                        const leaveStatus = leaveData.find(l => {
                            const s = parseDateFromString(l.TanggalMulaiCuti);
                            const e = parseDateFromString(l.TanggalSelesaiCuti);
                            const today = new Date(); today.setHours(0, 0, 0, 0);
                            return l.NamaDokter === doc.name && today >= s && today <= e;
                        });

                        results.push({
                            ...doc,
                            specialtyTitle: spec.title,
                            leaveStatus
                        });
                    }
                });
            }
        }
        return results;
    }, [searchQuery, doctorsData, leaveData]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-[#0c4a6e]">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border border-[#0c4a6e] border-t-transparent mb-4"></div>
                <p className="font-semibold">Memuat data...</p>
            </div>
        );
    }

    return (
        <div id="home-view" className="pt-6 pb-10">
            <h1 className="sr-only">Jadwal Praktik Dokter Spesialis & Layanan Kesehatan {config.hospitalName || 'RSU Siloam Ambon'}</h1>



            {/* DoctorSearch Removed - Moved to Header */}

            {!searchQuery && (
                <>
                    <NotificationSection doctorsData={doctorsData} leaveData={leaveData} />
                    <SpecialistList doctorsData={doctorsData} onSelectSpecialty={(key, data) => setSelectedSpecialty({ key, data })} />
                </>
            )}

            {searchQuery && (
                <div className="px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.length > 0 ? (
                        searchResults.map((doc, idx) => (
                            <DoctorCard
                                key={idx}
                                doctor={doc}
                                specialtyTitle={doc.specialtyTitle}
                                leaveStatus={doc.leaveStatus}
                            />
                        ))
                    ) : (
                        <p className="text-center text-lg col-span-full pt-4">Tidak ada dokter atau spesialisasi yang cocok.</p>
                    )}
                </div>
            )}

            {selectedSpecialty && (
                <DoctorModal
                    specialtyKey={selectedSpecialty.key}
                    specialtyData={selectedSpecialty.data}
                    leaveData={leaveData}
                    onClose={handleCloseModal}
                />
            )}

            {/* Bottom Banner Ad */}
            <div className="mt-8 mb-6">
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-center">
                    <AdDisplay
                        slotId="home-bottom-banner"
                        style={{ width: '100%', maxWidth: '728px', height: '90px' }}
                    />

                </div>
            </div>
        </div>
    );
};

export default HomeView;
