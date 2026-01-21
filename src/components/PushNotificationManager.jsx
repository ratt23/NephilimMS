import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Helper function for API calls
// Helper API
import { getApiBaseUrl } from '../utils/apiConfig';

async function fetchApi(endpoint, options = {}) {
    const baseUrl = getApiBaseUrl();
    let cleanPath = endpoint;

    if (cleanPath.startsWith('/.netlify/functions/api')) {
        cleanPath = cleanPath.replace('/.netlify/functions/api', '');
    } else if (cleanPath.startsWith('/.netlify/functions')) {
        cleanPath = cleanPath.replace('/.netlify/functions', '');
    }

    const url = `${baseUrl}${cleanPath}`;
    const response = await fetch(url, { ...options, credentials: 'include' });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
    }
    return response.json();
}

export default function PushNotificationManager() {
    const [leaves, setLeaves] = useState([]);
    const [selectedLeaves, setSelectedLeaves] = useState([]);
    const [formData, setFormData] = useState({
        heading: 'DOCTOR LEAVE INFO',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Format date: dd-mm-yyyy
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}-${m}-${y}`;
    };

    useEffect(() => {
        // Fetch leave data
        fetchApi('/.netlify/functions/api/leaves')
            .then(data => {
                // 1. Filter out expired leaves (end_date < today)
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const activeLeaves = data.filter(leave => {
                    const endDate = new Date(leave.end_date);
                    endDate.setHours(0, 0, 0, 0);
                    return endDate >= today;
                });

                // 2. Group by Doctor Name
                const groupedMap = new Map();
                activeLeaves.forEach(leave => {
                    if (!groupedMap.has(leave.doctor_name)) {
                        groupedMap.set(leave.doctor_name, {
                            id: leave.doctor_name, // Use name as ID for grouping select
                            doctor_name: leave.doctor_name,
                            ranges: []
                        });
                    }
                    groupedMap.get(leave.doctor_name).ranges.push({
                        start: leave.start_date,
                        end: leave.end_date
                    });
                });

                // 3. Convert to array and Sort by Earliest Start Date
                const groupedArray = Array.from(groupedMap.values()).map(group => {
                    // Sort ranges within the doctor mainly for display
                    group.ranges.sort((a, b) => new Date(a.start) - new Date(b.start));
                    return group;
                });

                // Sort doctors by their very first start date
                groupedArray.sort((a, b) => {
                    const startA = new Date(a.ranges[0].start);
                    const startB = new Date(b.ranges[0].start);
                    return startA - startB;
                });

                setLeaves(groupedArray);
            })
            .catch(err => console.error("Failed to fetch leaves:", err))
            .finally(() => setInitialLoading(false));
    }, []);

    const handleCheckboxChange = (group) => {
        const isSelected = selectedLeaves.some(l => l.id === group.id);
        let newSelected;

        if (isSelected) {
            newSelected = selectedLeaves.filter(l => l.id !== group.id);
        } else {
            // MAX 5 LIMIT
            if (selectedLeaves.length >= 5) {
                alert("Please select a maximum of 5 doctors.");
                return;
            }
            newSelected = [...selectedLeaves, group];
        }

        setSelectedLeaves(newSelected);
        generateMessage(newSelected);
    };

    const generateMessage = (selectedList) => {
        if (selectedList.length === 0) {
            setFormData(prev => ({ ...prev, content: '' }));
            return;
        }

        // Header
        const header = "📅 DOCTOR LEAVE INFO:";

        // Map details
        const details = selectedList.map(group => {
            // Format all ranges: "dd-mm-yyyy" or "dd-mm-yyyy s/d dd-mm-yyyy"
            // Join with " & "
            const rangesText = group.ranges.map(range => {
                const startStr = formatDate(range.start);
                const endStr = formatDate(range.end);
                return (startStr === endStr) ? startStr : `${startStr} s/d ${endStr}`;
            }).join(' & ');

            return `- ${group.doctor_name} (${rangesText})`;
        }).join('\n');

        const message = `${header}\n${details}`;
        setFormData(prev => ({ ...prev, content: message }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const appId = localStorage.getItem('oneSignalAppId') || '';
            const apiKey = localStorage.getItem('oneSignalApiKey') || '';

            await fetchApi('/.netlify/functions/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-onesignal-app-id': appId,
                    'x-onesignal-api-key': apiKey
                },
                body: JSON.stringify({
                    heading: formData.heading,
                    content: formData.content
                })
            });
            setStatus({ type: 'success', message: 'Notification sent successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to send: ' + err.message });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-[#1a1d21] p-6 rounded-lg shadow-2xl-md max-w-6xl mx-auto border border-[#8C7A3E]/20">
            <h2 className="text-2xl font-bold mb-6 text-[#E6E6E3] border-b pb-2">Send Leave Notification</h2>

            {status.message && (
                <div className={`p-4 mb-4 rounded ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LEFT COLUMN: Leave Selection List */}
                <div>
                    <label className="block text-sm font-bold text-[#E6E6E3] mb-2 uppercase tracking-wide">
                        Select Doctors on Leave (Max 5):
                    </label>
                    <div className="h-[400px] overflow-y-auto border border-[#8C7A3E]/30 rounded-md p-2 space-y-2 bg-[#0B0B0C] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                        {leaves.length === 0 ? (
                            <p className="text-[#a0a4ab] text-sm p-4 text-center italic">No active or future leaves found.</p>
                        ) : (
                            leaves.map(group => (
                                <div key={group.id} className="flex items-start hover:bg-[#1a1d21] p-2 rounded border border-transparent hover:border-[#8C7A3E]/20 transition-all cursor-pointer" onClick={() => handleCheckboxChange(group)}>
                                    <input
                                        id={`leave-${group.id}`}
                                        type="checkbox"
                                        checked={selectedLeaves.some(l => l.id === group.id)}
                                        onChange={() => { }} // Handle click in parent div
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-[#8C7A3E]/30 rounded mt-0.5 pointer-events-none"
                                    />
                                    <div className="ml-3 select-none">
                                        <span className="block font-semibold text-[#E6E6E3] text-sm">{group.doctor_name}</span>
                                        <span className="block text-[#a0a4ab] text-xs mt-0.5">
                                            {group.ranges.map((range, idx) => {
                                                const startStr = formatDate(range.start);
                                                const endStr = formatDate(range.end);
                                                const text = (startStr === endStr) ? startStr : `${startStr} s/d ${endStr}`;
                                                return (
                                                    <span key={idx} className="block">
                                                        {text}
                                                    </span>
                                                );
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <p className="text-xs text-[#a0a4ab] mt-2 text-right font-medium">
                        Selected: {selectedLeaves.length}/5
                    </p>
                </div>

                {/* RIGHT COLUMN: Form Fields */}
                <div className="space-y-6">
                    {/* Heading */}
                    <div>
                        <label className="block text-sm font-bold text-[#E6E6E3] mb-1 uppercase tracking-wide">Notification Title</label>
                        <input
                            type="text"
                            name="heading"
                            value={formData.heading}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-[#8C7A3E]/30 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-shadow-2xl"
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-bold text-[#E6E6E3] mb-1 uppercase tracking-wide">Message Content (Auto / Manual Edit)</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            rows="10"
                            className="w-full px-4 py-2 border border-[#8C7A3E]/30 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm transition-shadow-2xl"
                        />
                        <p className="text-xs text-[#a0a4ab]/60 mt-1">* You can manually edit the message above before sending.</p>
                    </div>

                    <div className="pt-4 border-t border-[#8C7A3E]/10">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-md shadow-2xl text-sm font-bold text-white uppercase tracking-wider transition-all
                  ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#8C7A3E] hover:bg-[#a89150] hover:shadow-2xl-lg'}
                `}
                        >
                            {loading ? 'Sending...' : 'Send Notification'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
