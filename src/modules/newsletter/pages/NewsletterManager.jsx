import React, { useState, useEffect } from 'react';
import { newsletterAPI } from '../api';
import { uploadPDFToCloudinary } from '../utils/cloudinaryUpload';

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function NewsletterManager() {
    // View state
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [editingId, setEditingId] = useState(null);

    // List state
    const [newsletters, setNewsletters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Form state
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        title: '',
        description: '',
        pdf_url: '',
        cloudinary_public_id: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState('');

    const limit = 20;

    useEffect(() => {
        if (view === 'list') {
            loadNewsletters();
        }
    }, [page, view]);

    async function loadNewsletters() {
        try {
            setLoading(true);
            setError(null);
            const data = await newsletterAPI.getArchive(page, limit, true);
            setNewsletters(data.newsletters);
            setTotal(data.total);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function showNewForm() {
        setEditingId(null);
        setFormData({
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            title: '',
            description: '',
            pdf_url: '',
            cloudinary_public_id: ''
        });
        setSelectedFile(null);
        setUploadProgress('');
        setView('form');
    }

    async function showEditForm(id) {
        try {
            setLoading(true);
            const newsletter = await newsletterAPI.getById(id);
            if (newsletter) {
                setEditingId(id);
                setFormData({
                    year: newsletter.year,
                    month: newsletter.month,
                    title: newsletter.title,
                    description: newsletter.description || '',
                    pdf_url: newsletter.pdf_url,
                    cloudinary_public_id: newsletter.cloudinary_public_id || ''
                });
                setSelectedFile(null);
                setUploadProgress('');
                setView('form');
            }
        } catch (err) {
            alert('Gagal load newsletter: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    function cancelForm() {
        setView('list');
        setEditingId(null);
    }

    async function handleTogglePublish(id) {
        try {
            await newsletterAPI.togglePublish(id);
            loadNewsletters();
        } catch (err) {
            alert('Gagal toggle publish: ' + err.message);
        }
    }

    async function handleDelete(id, title) {
        if (!confirm(`Yakin ingin menghapus newsletter "${title}"?`)) return;

        try {
            await newsletterAPI.delete(id);
            loadNewsletters();
        } catch (err) {
            alert('Gagal menghapus: ' + err.message);
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    async function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Hanya file PDF yang diperbolehkan');
            e.target.value = '';
            return;
        }

        setSelectedFile(file);
        setUploadProgress(`Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    }

    async function handleUpload() {
        if (!selectedFile) {
            alert('Pilih file PDF terlebih dahulu');
            return;
        }

        try {
            setUploading(true);
            setUploadProgress('Uploading to Cloudinary...');

            const { url, publicId } = await uploadPDFToCloudinary(selectedFile);

            setFormData(prev => ({
                ...prev,
                pdf_url: url,
                cloudinary_public_id: publicId
            }));

            setUploadProgress('✅ Upload berhasil!');
        } catch (err) {
            alert('Upload gagal: ' + err.message);
            setUploadProgress('');
        } finally {
            setUploading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!formData.title || !formData.pdf_url) {
            alert('Title dan PDF wajib diisi');
            return;
        }

        try {
            setSaving(true);
            await newsletterAPI.upsert(formData);
            setView('list');
            loadNewsletters();
        } catch (err) {
            alert('Gagal menyimpan: ' + err.message);
        } finally {
            setSaving(false);
        }
    }

    // LIST VIEW
    if (view === 'list') {
        if (loading && newsletters.length === 0) {
            return (
                <div className="p-6">
                    <div className="text-center text-gray-500">Loading...</div>
                </div>
            );
        }

        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">📰 e-Newsletter</h1>
                    <button
                        onClick={showNewForm}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                    >
                        + New Issue
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {newsletters.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                        <div className="text-gray-400 text-5xl mb-4">📄</div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Belum ada newsletter</h3>
                        <p className="text-gray-500 mb-4">
                            Pastikan database table sudah dibuat.<br />
                            Klik tombol "New Issue" untuk membuat newsletter pertama
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Periode
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {newsletters.map((newsletter) => (
                                        <tr key={newsletter.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {MONTHS[newsletter.month - 1]} {newsletter.year}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{newsletter.title}</div>
                                                {newsletter.description && (
                                                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {newsletter.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {newsletter.is_published ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <button
                                                    onClick={() => window.open(newsletter.pdf_url, '_blank')}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                    title="View PDF"
                                                >
                                                    📄 View
                                                </button>
                                                <button
                                                    onClick={() => showEditForm(newsletter.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                    title="Edit"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleTogglePublish(newsletter.id)}
                                                    className="text-yellow-600 hover:text-yellow-900 mr-3"
                                                    title="Toggle Publish"
                                                >
                                                    {newsletter.is_published ? '👁️ Unpublish' : '✅ Publish'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(newsletter.id, newsletter.title)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {total > limit && (
                            <div className="flex justify-center items-center gap-4 mt-6">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {page} of {Math.ceil(total / limit)}
                                </span>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= Math.ceil(total / limit)}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }

    // FORM VIEW
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {editingId ? '✏️ Edit Newsletter' : '➕ New Newsletter'}
                </h1>
                <button
                    onClick={cancelForm}
                    className="text-gray-600 hover:text-gray-900"
                >
                    ← Back to List
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Year <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            min="2000"
                            max="2100"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Month <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="month"
                            value={formData.month}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {MONTHS.map((monthName, idx) => (
                                <option key={idx} value={idx + 1}>
                                    {monthName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Newsletter Desember 2024"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Brief description..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        PDF File <span className="text-red-500">*</span>
                    </label>

                    <div className="space-y-3">
                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileSelect}
                            disabled={uploading}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                        />

                        {uploadProgress && (
                            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                                {uploadProgress}
                            </div>
                        )}

                        {selectedFile && !formData.pdf_url && (
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={uploading}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                            >
                                {uploading ? uploadProgress : 'Upload to Cloudinary'}
                            </button>
                        )}

                        {formData.pdf_url && (
                            <div className="bg-green-50 border border-green-200 rounded p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-green-700">✅ PDF Uploaded</span>
                                    <a
                                        href={formData.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        View PDF →
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={saving || !formData.pdf_url}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : (editingId ? 'Update Newsletter' : 'Create Newsletter')}
                    </button>

                    <button
                        type="button"
                        onClick={cancelForm}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
