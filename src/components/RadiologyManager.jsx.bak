import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { getApiBaseUrl } from '../utils/apiConfig';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const IconPlus = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>
);
const IconTrash = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);
const IconEdit = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
);
const IconUpload = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
);
const IconSearch = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /></svg>
);

const ITEMS_PER_PAGE = 20;

export default function RadiologyManager() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newItem, setNewItem] = useState({ name: '', common_name: '', category: '', price: 0 });
    const [editingItem, setEditingItem] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [page, setPage] = useState(0);

    // Fetch on mount and when page changes
    useEffect(() => {
        fetchItems();
    }, [page]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const offset = page * ITEMS_PER_PAGE;
            // Include limit and offset in query
            const res = await fetch(`${getApiBaseUrl()}/radiology?search=${searchTerm}&limit=${ITEMS_PER_PAGE}&offset=${offset}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0); // Reset to first page on search
            fetchItems();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSave = async () => {
        const itemData = editingItem || newItem;
        const method = editingItem ? 'PUT' : 'POST';
        const url = editingItem
            ? `${getApiBaseUrl()}/radiology/${editingItem.id}`
            : `${getApiBaseUrl()}/radiology`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData),
                credentials: 'include'
            });

            if (res.ok) {
                await fetchItems();
                setNewItem({ name: '', common_name: '', category: '', price: 0 });
                setEditingItem(null);
            } else {
                alert('Gagal menyimpan data');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus item ini?')) return;
        try {
            await fetch(`${getApiBaseUrl()}/radiology/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            fetchItems();
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const parsedItems = results.data.map(row => ({
                    name: row['Nama Pemeriksaan'] || row['name'] || '',
                    common_name: row['Nama Awam'] || row['common_name'] || '',
                    category: row['Kategori'] || row['category'] || 'General',
                    price: parseFloat(row['Harga'] || row['price'] || 0)
                })).filter(item => item.name); // Filter invalid rows

                if (parsedItems.length === 0) {
                    alert('Tidak ada data valid ditemukan di CSV. Pastikan header: Nama Pemeriksaan, Nama Awam, Kategori, Harga');
                    setUploading(false);
                    return;
                }

                try {
                    const res = await fetch(`${getApiBaseUrl()}/radiology/batch`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(parsedItems),
                        credentials: 'include'
                    });

                    if (res.ok) {
                        const result = await res.json();
                        alert(`Sukses mengupload ${result.count} item.`);
                        fetchItems();
                    } else {
                        alert('Upload gagal');
                    }
                } catch (err) {
                    console.error(err);
                    alert('Error upload');
                } finally {
                    setUploading(false);
                    e.target.value = null; // Reset input
                }
            },
            error: (err) => {
                console.error(err);
                alert('Error parsing CSV');
                setUploading(false);
            }
        });
    };

    return (
        <div className="bg-sanctum-surface p-6 rounded shadow-lg max-w-6xl mx-auto border border-sanctum-border">
            <h2 className="text-xl font-light text-sanctum-text-curr mb-6 border-b border-sanctum-border pb-2">Radiology Prices Manager</h2>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-end">
                {/* Form Input */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 w-full">
                    <input
                        type="text"
                        placeholder="Nama Pemeriksaan"
                        className="bg-sanctum-bg border border-sanctum-border rounded px-3 py-2 text-sm text-sanctum-text-curr"
                        value={editingItem ? editingItem.name : newItem.name}
                        onChange={e => {
                            const val = e.target.value;
                            editingItem ? setEditingItem({ ...editingItem, name: val }) : setNewItem({ ...newItem, name: val });
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Nama Awam (Optional)"
                        className="bg-sanctum-bg border border-sanctum-border rounded px-3 py-2 text-sm text-sanctum-text-curr"
                        value={editingItem ? editingItem.common_name : newItem.common_name}
                        onChange={e => {
                            const val = e.target.value;
                            editingItem ? setEditingItem({ ...editingItem, common_name: val }) : setNewItem({ ...newItem, common_name: val });
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Kategori"
                        className="bg-sanctum-bg border border-sanctum-border rounded px-3 py-2 text-sm text-sanctum-text-curr"
                        value={editingItem ? editingItem.category : newItem.category}
                        onChange={e => {
                            const val = e.target.value;
                            editingItem ? setEditingItem({ ...editingItem, category: val }) : setNewItem({ ...newItem, category: val });
                        }}
                    />
                    <input
                        type="number"
                        placeholder="Harga"
                        className="bg-sanctum-bg border border-sanctum-border rounded px-3 py-2 text-sm text-sanctum-text-curr"
                        value={editingItem ? editingItem.price : newItem.price}
                        onChange={e => {
                            const val = e.target.value;
                            editingItem ? setEditingItem({ ...editingItem, price: val }) : setNewItem({ ...newItem, price: val });
                        }}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center gap-1 w-full justify-center transition-colors"
                        >
                            {editingItem ? <IconEdit /> : <IconPlus />} {editingItem ? 'Update' : 'Add'}
                        </button>
                        {editingItem && (
                            <button
                                onClick={() => setEditingItem(null)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-2 rounded text-sm transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Batch Upload & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-center bg-sanctum-bg p-4 rounded border border-sanctum-border">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer text-sm flex items-center gap-2 transition-colors">
                        <IconUpload /> {uploading ? 'Uploading...' : 'Batch Upload CSV'}
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                    </label>
                    <span className="text-xs text-sanctum-text-muted hidden md:inline">Format: Nama Pemeriksaan, Nama Awam, Kategori, Harga</span>
                </div>
                <div className="relative w-full md:w-1/3">
                    <input
                        type="text"
                        className="w-full bg-sanctum-surface border border-sanctum-border rounded pl-10 pr-3 py-2 text-sm text-sanctum-text-curr focus:border-sanctum-accent outline-none transition-colors"
                        placeholder="Search radiology items..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute left-3 top-2.5 text-sanctum-text-muted">
                        <IconSearch />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="overflow-x-auto rounded border border-sanctum-border">
                <table className="w-full text-sm text-left text-sanctum-text-curr">
                    <thead className="text-xs text-sanctum-text-muted uppercase bg-sanctum-bg border-b border-sanctum-border">
                        <tr>
                            <th className="px-6 py-3">Nama Pemeriksaan</th>
                            <th className="px-6 py-3">Nama Awam</th>
                            <th className="px-6 py-3">Kategori</th>
                            <th className="px-6 py-3 text-right">Harga</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4 text-sanctum-text-muted">No items found.</td></tr>
                        ) : (
                            items.map(item => (
                                <tr key={item.id} className="bg-sanctum-surface border-b border-sanctum-border hover:bg-sanctum-bg transition-colors">
                                    <td className="px-6 py-4 font-medium">{item.name}</td>
                                    <td className="px-6 py-4 text-sanctum-text-muted">{item.common_name || '-'}</td>
                                    <td className="px-6 py-4"><span className="bg-blue-900/30 text-blue-200 px-2 py-1 rounded text-xs">{item.category}</span></td>
                                    <td className="px-6 py-4 text-right font-mono">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</td>
                                    <td className="px-6 py-4 flex justify-center gap-2">
                                        <button
                                            onClick={() => setEditingItem(item)}
                                            className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                        >
                                            <IconEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                                        >
                                            <IconTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
                <div className="text-xs text-sanctum-text-muted">
                    Page {page + 1}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                        className="px-3 py-1 bg-sanctum-bg border border-sanctum-border rounded hover:bg-sanctum-surface disabled:opacity-50 text-sanctum-text-curr"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        // Simple logic: if we got less than LIMIT, it's the last page.
                        disabled={items.length < ITEMS_PER_PAGE || loading}
                        className="px-3 py-1 bg-sanctum-bg border border-sanctum-border rounded hover:bg-sanctum-surface disabled:opacity-50 text-sanctum-text-curr"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
