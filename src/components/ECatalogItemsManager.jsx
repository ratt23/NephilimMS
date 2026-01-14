// E-Catalog items management module
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

const DEFAULT_CATEGORIES = [
    { id: 'tarif-kamar', label: 'Tarif Kamar' },
    { id: 'fasilitas', label: 'Fasilitas' },
    { id: 'layanan-unggulan', label: 'Layanan Unggulan' },
    { id: 'contact-person', label: 'Contact Person' }
];

export default function ECatalogItemsManager() {
    const [selectedCategory, setSelectedCategory] = useState('tarif-kamar');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        category: '',
        title: '',
        description: '',
        price: '',
        image_url: '',
        features: []
    });
    const [featureInput, setFeatureInput] = useState('');
    const [uploading, setUploading] = useState(false);

    // Category Covers & Maintenance Mode
    const [categoryCovers, setCategoryCovers] = useState({});
    const [ecatalogEnabled, setEcatalogEnabled] = useState(true);
    const [uploadingCovers, setUploadingCovers] = useState({}); // Track uploading state per category
    const [savingSettings, setSavingSettings] = useState(false);

    // Category Visibility
    const [categoryVisibility, setCategoryVisibility] = useState({
        'tarif-kamar': true,
        'fasilitas': true,
        'layanan-unggulan': true,
        'contact-person': true
    });

    // Dynamic Categories
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);


    useEffect(() => {
        loadItems();
        loadSettings();
    }, [selectedCategory]);

    async function loadSettings() {
        try {
            const res = await fetch('/.netlify/functions/api/settings');
            const data = await res.json();

            // Helper to get value
            const getVal = (key) => data[key]?.value;

            // Load Categories
            const catVal = getVal('ecatalog_categories');
            if (catVal) {
                try {
                    const parsedCats = JSON.parse(catVal);
                    if (Array.isArray(parsedCats) && parsedCats.length > 0) {
                        setCategories(parsedCats);

                        // If current selected category is not in the new list, switch to the first one
                        const currentExists = parsedCats.find(c => c.id === selectedCategory);
                        if (!currentExists) {
                            setSelectedCategory(parsedCats[0].id);
                        }
                    }
                } catch (e) {
                    console.error("Error parsing categories", e);
                }
            }

            if (data['category_covers']?.value) {
                try {
                    setCategoryCovers(JSON.parse(data['category_covers'].value));
                } catch (e) {
                    console.error("Error parsing covers", e);
                }
            }

            if (data['category_visibility']?.value) {
                try {
                    setCategoryVisibility(JSON.parse(data['category_visibility'].value));
                } catch (e) {
                    console.error("Error parsing visibility", e);
                }
            }

            if (data['ecatalog_enabled']?.value === 'false') {
                setEcatalogEnabled(false);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async function handleCoverUpload(category, file) {
        try {
            setUploadingCovers(prev => ({ ...prev, [category]: true }));
            const uploadData = await uploadToCloudinary(file);

            // Extract URL from response object
            const url = uploadData.secure_url || uploadData;

            const newCovers = { ...categoryCovers, [category]: url };
            setCategoryCovers(newCovers);

            // Save to database
            await fetch('/.netlify/functions/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category_covers: {
                        value: JSON.stringify(newCovers),
                        enabled: true
                    }
                })
            });

            alert('Cover image berhasil diupdate!');
        } catch (err) {
            console.error('Error uploading cover:', err);
            alert('Gagal mengupload cover image: ' + err.message);
        } finally {
            setUploadingCovers(prev => ({ ...prev, [category]: false }));
        }
    }

    async function toggleMaintenanceMode() {
        try {
            setSavingSettings(true);
            const newValue = !ecatalogEnabled;

            await fetch('/.netlify/functions/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ecatalog_enabled: {
                        value: newValue.toString(),
                        enabled: true
                    }
                })
            });

            setEcatalogEnabled(newValue);
            alert(`E-Catalog ${newValue ? 'diaktifkan' : 'dinonaktifkan'}`);
        } catch (err) {
            console.error('Error toggling maintenance mode:', err);
            alert('Gagal mengupdate status');
        } finally {
            setSavingSettings(false);
        }
    }

    async function toggleCategoryVisibility(categoryId) {
        // Only update local state
        const newVisibility = { ...categoryVisibility, [categoryId]: !categoryVisibility[categoryId] };
        setCategoryVisibility(newVisibility);
    }

    async function saveCategoryVisibility() {
        try {
            setSavingSettings(true);
            await fetch('/.netlify/functions/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category_visibility: {
                        value: JSON.stringify(categoryVisibility),
                        enabled: true
                    }
                })
            });
            alert('Settings saved successfully!');
        } catch (err) {
            console.error('Error saving visibility:', err);
            alert('Failed to save settings');
        } finally {
            setSavingSettings(false);
        }
    }


    async function loadItems() {
        try {
            setLoading(true);
            const response = await fetch(`/.netlify/functions/api/catalog-items/all?category=${selectedCategory}`);
            const data = await response.json();

            // Parse features if they are JSON strings
            const parsedData = data.map(item => ({
                ...item,
                features: typeof item.features === 'string' ? JSON.parse(item.features) : (item.features || [])
            }));

            setItems(parsedData);
        } catch (err) {
            console.error('Error loading items:', err);
            alert('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    }

    function openForm(item = null) {
        if (item) {
            setEditItem(item);
            setFormData({
                category: item.category,
                title: item.title,
                description: item.description || '',
                price: item.price || '',
                image_url: item.image_url || '',
                features: Array.isArray(item.features) ? item.features : (typeof item.features === 'string' ? JSON.parse(item.features) : [])
            });
        } else {
            setEditItem(null);
            setFormData({
                category: selectedCategory,
                title: '',
                description: '',
                price: '',
                image_url: '',
                features: []
            });
        }
        setShowForm(true);
    }

    function closeForm() {
        setShowForm(false);
        setEditItem(null);
        setFormData({ category: '', title: '', description: '', price: '', image_url: '', features: [] });
        setFeatureInput('');
    }

    async function handleImageUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const result = await uploadToCloudinary(file);
            setFormData(prev => ({
                ...prev,
                image_url: result.secure_url,
                cloudinary_public_id: result.public_id
            }));
            alert('Gambar berhasil diupload!');
        } catch (err) {
            console.error('Upload error:', err);
            alert('Gagal upload gambar');
        } finally {
            setUploading(false);
        }
    }

    function addFeature() {
        if (featureInput.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, featureInput.trim()]
            }));
            setFeatureInput('');
        }
    }

    function removeFeature(index) {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const url = editItem
                ? `/.netlify/functions/api/catalog-items?id=${editItem.id}`
                : '/.netlify/functions/api/catalog-items';

            const response = await fetch(url, {
                method: editItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Gagal menyimpan');

            alert(editItem ? 'Item berhasil diupdate!' : 'Item berhasil ditambahkan!');
            closeForm();
            loadItems();
        } catch (err) {
            console.error('Save error:', err);
            alert('Gagal menyimpan data');
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus item ini?')) return;

        try {
            const res = await fetch(`/.netlify/functions/api/catalog/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('Item berhasil dihapus');
                loadItems();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Gagal menghapus item');
        }
    };

    const moveItem = async (index, direction) => {
        const newItems = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newItems.length) return;

        // Swap items
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];

        // Update local state immediately for better UX
        setItems(newItems);

        // Update sort_order in database
        try {
            const updates = newItems.map((item, idx) => ({
                id: item.id,
                sort_order: idx
            }));

            const res = await fetch('/.netlify/functions/api/catalog/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: updates })
            });

            if (!res.ok) {
                throw new Error('Failed to update order');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Gagal mengupdate urutan');
            loadItems(); // Reload to get correct order
        }
    };

    async function handleRemoveCover(category) {
        if (!confirm('Hapus cover image ini dan kembalikan ke default?')) return;

        try {
            const newCovers = { ...categoryCovers };
            delete newCovers[category];
            setCategoryCovers(newCovers);

            // Save to database
            await fetch('/.netlify/functions/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category_covers: {
                        value: JSON.stringify(newCovers),
                        enabled: true
                    }
                })
            });
        } catch (err) {
            console.error('Error removing cover:', err);
            alert('Gagal menghapus cover');
        }
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">E-Catalog Management</h1>
                <p className="text-gray-400">Kelola kategori cover dan items E-Catalog</p>
            </div>

            {/* Category Covers Management */}
            <div className="bg-zinc-800 rounded-lg p-6 mb-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Category Cover Images</h3>
                <p className="text-sm text-gray-400 mb-4">Upload gambar cover untuk setiap kategori</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map(category => (
                        <div key={category.id} className="bg-zinc-900 rounded-lg p-4 border border-gray-700">
                            <h4 className="text-white font-medium mb-3">{category.label}</h4>

                            {/* Preview */}
                            <div className="aspect-video bg-gray-800 rounded-lg mb-3 overflow-hidden relative group">
                                {categoryCovers[category.id] ? (
                                    <>
                                        <img
                                            src={categoryCovers[category.id]}
                                            alt={category.label}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null; // Prevent infinite loop
                                                e.target.src = '/asset/categories/placeholder.svg';
                                            }}
                                        />
                                        <button
                                            onClick={() => handleRemoveCover(category.id)}
                                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                            title="Hapus Cover"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <ImageIcon size={32} />
                                    </div>
                                )}
                            </div>

                            {/* Upload Button */}
                            <label className="block w-full">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            handleCoverUpload(category.id, e.target.files[0]);
                                        }
                                    }}
                                    disabled={uploadingCovers[category.id]}
                                />
                                <div className={`text-center py-2 rounded cursor-pointer transition-colors text-sm font-medium flex items-center justify-center gap-2 ${uploadingCovers[category.id] ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
                                    {uploadingCovers[category.id] ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={16} />
                                            Upload Cover
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Visibility Management */}
            <div className="bg-zinc-800 rounded-lg p-6 mb-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Category Visibility</h3>
                <p className="text-sm text-gray-400 mb-4">Tampilkan atau sembunyikan kategori di eCatalog visitor</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map(category => (
                        <div key={category.id} className="bg-zinc-900 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-medium">{category.label}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    {categoryVisibility[category.id] !== false ? 'Visible' : 'Hidden (Coming Soon)'}
                                </p>
                            </div>

                            {/* Toggle Switch */}
                            <button
                                onClick={() => toggleCategoryVisibility(category.id)}
                                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${categoryVisibility[category.id] !== false ? 'bg-green-600' : 'bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${categoryVisibility[category.id] !== false ? 'translate-x-8' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={saveCategoryVisibility}
                        disabled={savingSettings}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={20} />
                        {savingSettings ? 'Menyimpan...' : 'Simpan Visibility'}
                    </button>
                </div>
            </div>

            {/* Categories Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${selectedCategory === cat.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600'
                            }`}
                    >
                        {cat.label}
                        {/* Visibility Indicator */}
                        {categoryVisibility[cat.id] === false && (
                            <span className="w-2 h-2 rounded-full bg-red-500" title="Tersembunyi"></span>
                        )}
                    </button>
                ))}
            </div>
            {/* Add Button */}
            <div className="mb-6">
                <button
                    onClick={() => openForm()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    Tambah Item
                </button>
            </div>

            {/* Items List */}
            {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : items.length === 0 ? (
                <div className="bg-zinc-800 rounded-lg p-8 text-center">
                    <ImageIcon className="mx-auto mb-4 text-gray-600" size={48} />
                    <p className="text-gray-400">Belum ada item di kategori ini</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(item => (
                        <div key={item.id} className="bg-zinc-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors">
                            {item.image_url && (
                                <div className="h-48 bg-gray-900 overflow-hidden">
                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                                {item.price && (
                                    <p className="text-blue-400 font-semibold mb-2">{item.price}</p>
                                )}
                                {item.description && (
                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                                )}
                                {item.features && item.features.length > 0 && (
                                    <ul className="text-xs text-gray-500 mb-3 space-y-1">
                                        {item.features.slice(0, 3).map((feature, idx) => (
                                            <li key={idx}>• {feature}</li>
                                        ))}
                                        {item.features.length > 3 && (
                                            <li className="text-blue-400">+{item.features.length - 3} lainnya</li>
                                        )}
                                    </ul>
                                )}
                                <div className="flex gap-2 pt-3 border-t border-gray-700">
                                    {/* Order Controls */}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => moveItem(items.indexOf(item), 'up')}
                                            disabled={items.indexOf(item) === 0}
                                            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white p-2 rounded transition-colors"
                                            title="Pindah ke atas"
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => moveItem(items.indexOf(item), 'down')}
                                            disabled={items.indexOf(item) === items.length - 1}
                                            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white p-2 rounded transition-colors"
                                            title="Pindah ke bawah"
                                        >
                                            <ArrowDown size={16} />
                                        </button>
                                    </div>

                                    {/* Edit/Delete */}
                                    <button
                                        onClick={() => openForm(item)}
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-1 overflow-y-auto">
                    <div className="bg-zinc-800 rounded max-w-sm w-full mx-1 my-1">
                        <div className="p-2 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-xs font-bold text-white">
                                {editItem ? 'Edit' : 'Tambah'}
                            </h2>
                            <button onClick={closeForm} className="text-gray-400 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-2 space-y-2">
                            <div>
                                <label className="block text-[10px] font-medium text-gray-300 mb-0.5">Kategori</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-1.5 py-1 text-xs"
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-medium text-gray-300 mb-0.5">Judul</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-1.5 py-1 text-xs"
                                    required
                                    placeholder="Nama item"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-medium text-gray-300 mb-0.5">
                                    {formData.category === 'contact-person' ? 'Nomor WhatsApp' : 'Harga'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.price}
                                    onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-1.5 py-1 text-xs"
                                    placeholder={formData.category === 'contact-person' ? '08123456789' : 'Rp 600.000'}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-medium text-gray-300 mb-0.5">
                                    {formData.category === 'contact-person' ? 'Jabatan / Role' : 'Deskripsi'}
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-1.5 py-1 h-12 text-xs"
                                    placeholder={formData.category === 'contact-person' ? 'Contoh: Kepala Ruangan / Admin IGD' : 'Singkat...'}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-medium text-gray-300 mb-0.5">Gambar</label>
                                {formData.image_url && (
                                    <div className="mb-0.5">
                                        <img src={formData.image_url} alt="Preview" className="h-16 max-w-full rounded object-cover" />
                                    </div>
                                )}
                                <label className="cursor-pointer inline-flex items-center px-2 py-1 border border-gray-600 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors text-xs">
                                    <Upload size={12} className="mr-1" />
                                    {uploading ? 'Uploading...' : formData.image_url ? 'Ganti' : 'Upload'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                                <div className="mt-1 text-[9px] text-gray-400 leading-tight">
                                    <p>📐 Ukuran: 800x600 (Kamar), 1200x800 (Fasilitas)</p>
                                    <p className="text-yellow-400">⚠️ Max 5MB</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-medium text-gray-300 mb-0.5">Fitur</label>
                                <div className="flex gap-1 mb-1">
                                    <input
                                        type="text"
                                        value={featureInput}
                                        onChange={e => setFeatureInput(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                        className="flex-1 bg-gray-700 text-white border border-gray-600 rounded px-1.5 py-1 text-xs"
                                        placeholder="AC, TV, dll"
                                    />
                                    <button
                                        type="button"
                                        onClick={addFeature}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                                    >
                                        +
                                    </button>
                                </div>
                                {formData.features.length > 0 && (
                                    <ul className="space-y-0.5">
                                        {formData.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center justify-between bg-gray-700 px-1.5 py-1 rounded gap-1">
                                                <span className="text-white text-[10px] break-words flex-1">{feature}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(idx)}
                                                    className="text-red-400 hover:text-red-300 flex-shrink-0"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-1 pt-1.5">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded font-medium transition-colors flex items-center justify-center gap-1 text-xs"
                                >
                                    <Save size={12} />
                                    {editItem ? 'Update' : 'Simpan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="w-full sm:w-auto px-2 py-1 rounded font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors text-xs"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
