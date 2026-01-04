import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function McuManager() {
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/.netlify/functions/api/mcu-packages/all');
            if (!res.ok) throw new Error('Failed to fetch packages');
            const data = await res.json();
            setPackages(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleEnabled = async (pkg) => {
        try {
            const res = await fetch(`/.netlify/functions/api/mcu-packages/${pkg.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...pkg, is_enabled: !pkg.is_enabled })
            });
            if (!res.ok) throw new Error('Failed to update package');
            setMessage({ type: 'success', text: 'Package status updated' });
            fetchPackages();
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to disable this package?')) return;

        try {
            const res = await fetch(`/.netlify/functions/api/mcu-packages/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete package');
            setMessage({ type: 'success', text: 'Package disabled' });
            fetchPackages();
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const openAddModal = () => {
        setEditingPackage(null);
        setShowModal(true);
    };

    const openEditModal = (pkg) => {
        setEditingPackage(pkg);
        setShowModal(true);
    };

    const handleModalClose = (shouldRefresh) => {
        setShowModal(false);
        setEditingPackage(null);
        if (shouldRefresh) {
            fetchPackages();
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="bg-white border border-gray-200 shadow-sm rounded-none">
                {/* TOOLBAR */}
                <div className="bg-white p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                        <span>MCU Package Manager</span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">{packages.length}</span>
                    </h2>
                    <button
                        onClick={openAddModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Package
                    </button>
                </div>

                {message && (
                    <div className={`mx-4 mt-4 p-4 rounded text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'}`}>
                        {message.text}
                    </div>
                )}

                {error && (
                    <div className="p-6 text-red-600">Error: {error}</div>
                )}

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#f0f2f5]">
                            <tr>
                                <th className="p-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider">Order</th>
                                <th className="p-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider">Package</th>
                                <th className="p-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider">Price</th>
                                <th className="p-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider">Type</th>
                                <th className="p-3 text-center text-[11px] font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="p-3 text-center text-[11px] font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {packages.map((pkg) => (
                                <tr key={pkg.id} className="hover:bg-blue-50 transition-colors">
                                    <td className="p-3 text-sm text-gray-600">{pkg.display_order}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            {pkg.image_url && (
                                                <img src={pkg.image_url} alt={pkg.name} className="w-16 h-16 object-cover rounded border" />
                                            )}
                                            <div>
                                                <div className="font-semibold text-gray-800">{pkg.name}</div>
                                                <div className="text-xs text-gray-500">{pkg.package_id}</div>
                                                {pkg.is_recommended && (
                                                    <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Recommended</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-sm font-semibold text-gray-800">
                                        Rp {pkg.price.toLocaleString('id-ID')}
                                    </td>
                                    <td className="p-3 text-sm text-gray-600">
                                        {pkg.is_pelaut ? (
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Pelaut</span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">Regular</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={pkg.is_enabled}
                                                onChange={() => handleToggleEnabled(pkg)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => openEditModal(pkg)}
                                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-xs font-semibold transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pkg.id)}
                                                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-xs font-semibold transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <McuPackageModal
                    package={editingPackage}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
}

// Placeholder for modal - will create next
function McuPackageModal({ package: pkg, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                <h3 className="text-xl font-bold mb-4">{pkg ? 'Edit Package' : 'Add Package'}</h3>
                <p className="text-gray-600 mb-4">Modal coming soon...</p>
                <button
                    onClick={() => onClose(false)}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
