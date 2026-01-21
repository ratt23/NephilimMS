import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { getApiBaseUrl } from '../utils/apiConfig';

async function fetchApi(endpoint, options = {}) {
    const baseUrl = getApiBaseUrl();
    let cleanPath = endpoint;
    if (cleanPath.startsWith('/.netlify/functions/api')) {
        cleanPath = cleanPath.replace('/.netlify/functions/api', '');
    }
    const url = `${baseUrl}${cleanPath}`;
    const response = await fetch(url, { ...options, credentials: 'include' });
    if (!response.ok) {
        throw new Error(`Error ${response.status}`);
    }
    return response.json();
}

export default function ManualUpdateManager() {
    const [doctors, setDoctors] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch doctors and current settings
    useEffect(() => {
        const loadDat = async () => {
            try {
                setIsLoading(true);
                // 1. Fetch ALL doctors (limit 1000 to get all)
                // Note: If database is large, ideally we search/paginate. But user said "list dokternya sama ambil semua".
                const doctorsData = await fetchApi('/doctors?limit=1000');

                // 2. Fetch current settings
                const settingsData = await fetchApi('/settings');

                setDoctors(doctorsData.doctors || []);

                // Parse manual_update_list from settings
                const manualListSetting = settingsData.manual_update_list;
                let initialIds = [];
                if (manualListSetting && manualListSetting.value) {
                    try {
                        initialIds = JSON.parse(manualListSetting.value);
                    } catch (e) {
                        console.warn("Failed to parse manual_update_list", e);
                    }
                }
                setSelectedIds(initialIds);

            } catch (err) {
                console.error("Failed to load data", err);
                alert("Failed to load data: " + err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadDat();
    }, []);

    const handleCheckboxChange = (id) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            // Save to settings endpoint
            // We need to send it as a setting key-value
            // The /settings endpoint usually accepts POST/PUT to update specific keys
            // Based on previous knowledge, maybe /settings or /settings/update?
            // Let's assume standard PUT /settings behavior if simplified or POST.
            // Actually, typical SettingsManager updates via POST to /settings with array of {key, value, type} or similar.
            // Let's check SettingsManager if possible, but standard is mapped by key.
            // We will Try POST /settings with body { manual_update_list: { value: JSON.stringify(selectedIds) } } ? 
            // Or usually the API expects an array of settings to update.
            // I will use the generic structure typically found in these apps:
            // POST /settings with body: { settings: [{ key: 'manual_update_list', value: JSON.stringify(selectedIds), type: 'json' }] }

            await fetchApi('/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    manual_update_list: {
                        value: JSON.stringify(selectedIds),
                        enabled: true
                    }
                })
            });

            alert("Manual list saved successfully!");
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.specialty && doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-fade-in font-sans p-6">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h2 className="text-xl font-bold text-[#E6E6E3] uppercase tracking-wide">Manual Update Slider</h2>
                    <p className="text-sm text-[#a0a4ab]">Select doctors to Force-Show in the header slider update list.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#8C7A3E] text-white font-bold uppercase text-xs rounded shadow-2xl hover:bg-[#a89150] disabled:opacity-50"
                >
                    {isSaving ? "Saving..." : "Save Selection"}
                </button>
            </div>

            <div className="bg-[#1a1d21] border rounded shadow-2xl-sm">
                <div className="p-4 border-b bg-[#0B0B0C]">
                    <input
                        type="text"
                        placeholder="Search doctor..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full md:w-1/3 px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#0B0B0C] sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#a0a4ab] uppercase tracking-wider w-16">Select</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#a0a4ab] uppercase tracking-wider">Doctor Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#a0a4ab] uppercase tracking-wider">Specialty</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[#1a1d21] divide-y divide-gray-200">
                            {filteredDoctors.map(doc => (
                                <tr key={doc.id} className={`hover:bg-blue-900/20 cursor-pointer ${selectedIds.includes(doc.id) ? 'bg-blue-900/20' : ''}`} onClick={() => handleCheckboxChange(doc.id)}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(doc.id)}
                                            onChange={() => handleCheckboxChange(doc.id)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-[#8C7A3E]/30 rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#E6E6E3]">
                                        {doc.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#a0a4ab]">
                                        {doc.specialty}
                                    </td>
                                </tr>
                            ))}
                            {filteredDoctors.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-[#a0a4ab]">No doctors found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t bg-[#0B0B0C] text-sm text-[#a0a4ab]">
                    Selected: <b>{selectedIds.length}</b> doctors
                </div>
            </div>
        </div>
    );
}
