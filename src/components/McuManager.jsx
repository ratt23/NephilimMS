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
                                                pkg.image_url.startsWith('http') ? (
                                                    <img src={pkg.image_url} alt={pkg.name} className="w-16 h-16 object-cover rounded border" />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500">
                                                        No Preview
                                                    </div>
                                                )
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

// Full-featured Modal Component
function McuPackageModal({ package: pkg, onClose }) {
    const [formData, setFormData] = useState({
        package_id: '',
        name: '',
        price: 0,
        base_price: null,
        image_url: '',
        is_pelaut: false,
        is_recommended: false,
        display_order: 0,
        items: [],
        addons: []
    });
    const [isUploading, setIsUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (pkg) {
            // Parse JSONB fields if they come as strings from database
            const parseJsonField = (field) => {
                if (!field) return [];
                if (Array.isArray(field)) return field;
                if (typeof field === 'string') {
                    try {
                        return JSON.parse(field);
                    } catch {
                        return [];
                    }
                }
                return [];
            };

            setFormData({
                package_id: pkg.package_id || '',
                name: pkg.name || '',
                price: pkg.price || 0,
                base_price: pkg.base_price || null,
                image_url: pkg.image_url || '',
                is_pelaut: pkg.is_pelaut || false,
                is_recommended: pkg.is_recommended || false,
                display_order: pkg.display_order || 0,
                items: parseJsonField(pkg.items),
                addons: parseJsonField(pkg.addons)
            });
        }
    }, [pkg]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            alert("Cloudinary configuration missing in .env");
            return;
        }

        setIsUploading(true);

        const formDataApi = new FormData();
        formDataApi.append('file', file);
        formDataApi.append('upload_preset', UPLOAD_PRESET);
        formDataApi.append('cloud_name', CLOUD_NAME);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formDataApi,
            });
            const data = await response.json();

            if (response.ok) {
                setFormData(prev => ({ ...prev, image_url: data.secure_url }));
            } else {
                throw new Error(data.error.message || 'Upload failed');
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const addCategory = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { category: '', items: [], hidden: false }]
        }));
    };

    const updateCategory = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const removeCategory = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const addCategoryItem = (catIndex) => {
        const newItems = [...formData.items];
        newItems[catIndex].items.push('');
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const updateCategoryItem = (catIndex, itemIndex, value) => {
        const newItems = [...formData.items];
        newItems[catIndex].items[itemIndex] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const removeCategoryItem = (catIndex, itemIndex) => {
        const newItems = [...formData.items];
        newItems[catIndex].items = newItems[catIndex].items.filter((_, i) => i !== itemIndex);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addAddon = () => {
        setFormData(prev => ({
            ...prev,
            addons: [...(prev.addons || []), { id: '', label: '', price: 0 }]
        }));
    };

    const updateAddon = (index, field, value) => {
        const newAddons = [...(formData.addons || [])];
        newAddons[index][field] = value;
        setFormData(prev => ({ ...prev, addons: newAddons }));
    };

    const removeAddon = (index) => {
        setFormData(prev => ({
            ...prev,
            addons: (prev.addons || []).filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        // Validation
        if (!formData.package_id || !formData.name || !formData.price || formData.items.length === 0) {
            alert('Please fill in all required fields (Package ID, Name, Price, and at least one category)');
            return;
        }

        setSaving(true);

        try {
            const url = pkg
                ? `/.netlify/functions/api/mcu-packages/${pkg.id}`
                : '/.netlify/functions/api/mcu-packages';

            const method = pkg ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to save package');
            }

            alert(pkg ? 'Package updated successfully!' : 'Package created successfully!');
            onClose(true); // Refresh parent
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold mb-6">{pkg ? 'Edit Package' : 'Add New Package'}</h3>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Package ID *</label>
                            <input
                                type="text"
                                value={formData.package_id}
                                onChange={(e) => setFormData(prev => ({ ...prev, package_id: e.target.value }))}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                placeholder="e.g., executive"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Package Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                placeholder="e.g., MCU Executive"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Price (Rp) *</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Base Price (Optional)</label>
                            <input
                                type="number"
                                value={formData.base_price || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseInt(e.target.value) || null }))}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Display Order</label>
                            <input
                                type="number"
                                value={formData.display_order}
                                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Package Image</label>
                        {formData.image_url && (
                            <img src={formData.image_url} alt="Preview" className="w-40 h-40 object-cover rounded border mb-2" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {isUploading && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
                    </div>

                    {/* Checkboxes */}
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.is_pelaut}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_pelaut: e.target.checked }))}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-semibold">Is Pelaut Package</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.is_recommended}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_recommended: e.target.checked }))}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-semibold">Recommended</span>
                        </label>
                    </div>

                    {/* Items/Categories */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-lg">Examination Items *</h4>
                            <button
                                onClick={addCategory}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                            >
                                + Add Category
                            </button>
                        </div>

                        {formData.items.map((cat, catIdx) => (
                            <div key={catIdx} className="border border-gray-300 rounded p-4 mb-3 bg-gray-50">
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={cat.category}
                                        onChange={(e) => updateCategory(catIdx, 'category', e.target.value)}
                                        placeholder="Category name (e.g., Pemeriksaan Fisik)"
                                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm font-semibold"
                                    />
                                    <label className="flex items-center gap-1 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={cat.hidden || false}
                                            onChange={(e) => updateCategory(catIdx, 'hidden', e.target.checked)}
                                        />
                                        Hidden
                                    </label>
                                    <button
                                        onClick={() => removeCategory(catIdx)}
                                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                    >
                                        Remove
                                    </button>
                                </div>

                                {/* Category Items */}
                                <div className="space-y-1 ml-4">
                                    {(cat.items || []).map((item, itemIdx) => (
                                        <div key={itemIdx} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={item}
                                                onChange={(e) => updateCategoryItem(catIdx, itemIdx, e.target.value)}
                                                placeholder="Item name"
                                                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                            />
                                            <button
                                                onClick={() => removeCategoryItem(catIdx, itemIdx)}
                                                className="text-red-600 text-xs px-2"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addCategoryItem(catIdx)}
                                        className="text-blue-600 text-xs hover:underline"
                                    >
                                        + Add Item
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Addons */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-lg">Add-ons (Optional)</h4>
                            <button
                                onClick={addAddon}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                            >
                                + Add Add-on
                            </button>
                        </div>

                        {(formData.addons || []).map((addon, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={addon.id}
                                    onChange={(e) => updateAddon(idx, 'id', e.target.value)}
                                    placeholder="ID (e.g., golongan_darah)"
                                    className="w-1/3 border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                                <input
                                    type="text"
                                    value={addon.label}
                                    onChange={(e) => updateAddon(idx, 'label', e.target.value)}
                                    placeholder="Label"
                                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                                <input
                                    type="number"
                                    value={addon.price}
                                    onChange={(e) => updateAddon(idx, 'price', parseInt(e.target.value) || 0)}
                                    placeholder="Price"
                                    className="w-1/4 border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                                <button
                                    onClick={() => removeAddon(idx)}
                                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={() => onClose(false)}
                            disabled={saving}
                            className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : (pkg ? 'Update Package' : 'Create Package')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
