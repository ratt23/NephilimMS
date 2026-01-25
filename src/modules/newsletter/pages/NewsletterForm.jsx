import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { newsletterAPI } from '../api';
import { uploadPDFToCloudinary } from '../utils/cloudinaryUpload';

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function NewsletterForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        if (isEdit) {
            loadNewsletter();
        }
    }, [id]);

    async function loadNewsletter() {
        try {
            setLoading(true);
            const newsletter = await newsletterAPI.getById(id);
            if (newsletter) {
                setFormData({
                    year: newsletter.year,
                    month: newsletter.month,
                    title: newsletter.title,
                    description: newsletter.description || '',
                    pdf_url: newsletter.pdf_url,
                    cloudinary_public_id: newsletter.cloudinary_public_id || ''
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    async function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate PDF
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
            setError(null);
        } catch (err) {
            setError(err.message);
            setUploadProgress('');
        } finally {
            setUploading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.pdf_url) {
            alert('Title dan PDF wajib diisi');
            return;
        }

        try {
            setSaving(true);
            await newsletterAPI.upsert(formData);
            navigate('/admin/newsletter');
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-sanctum-text-curr">
                    {isEdit ? '✏️ Edit Newsletter' : '➕ New Newsletter'}
                </h1>
                <button
                    onClick={() => navigate('/admin/newsletter')}
                    className="text-sanctum-text-muted hover:text-white"
                >
                    ← Back to List
                </button>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-sanctum-surface rounded-lg shadow-lg p-6 space-y-6 border border-sanctum-border">
                {/* Year & Month */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-sanctum-text-muted mb-2">
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
                            className="w-full px-3 py-2 border border-sanctum-border rounded-lg focus:ring-2 focus:ring-sanctum-accent focus:border-transparent bg-sanctum-bg text-sanctum-text-curr"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-sanctum-text-muted mb-2">
                            Month <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="month"
                            value={formData.month}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-sanctum-border rounded-lg focus:ring-2 focus:ring-sanctum-accent focus:border-transparent bg-sanctum-bg text-sanctum-text-curr"
                        >
                            {MONTHS.map((monthName, idx) => (
                                <option key={idx} value={idx + 1}>
                                    {monthName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-sanctum-text-muted mb-2">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Newsletter Desember 2024"
                        className="w-full px-3 py-2 border border-sanctum-border rounded-lg focus:ring-2 focus:ring-sanctum-accent focus:border-transparent bg-sanctum-bg text-sanctum-text-curr"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-sanctum-text-muted mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Brief description..."
                        className="w-full px-3 py-2 border border-sanctum-border rounded-lg focus:ring-2 focus:ring-sanctum-accent focus:border-transparent bg-sanctum-bg text-sanctum-text-curr"
                    />
                </div>

                {/* PDF Upload */}
                <div className="border-2 border-dashed border-sanctum-border rounded-lg p-6 bg-sanctum-bg/50">
                    <label className="block text-sm font-medium text-sanctum-text-muted mb-2">
                        PDF File <span className="text-red-500">*</span>
                    </label>

                    <div className="space-y-3">
                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileSelect}
                            disabled={uploading}
                            className="w-full text-sm text-sanctum-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-900/20 file:text-blue-400 hover:file:bg-blue-900/30 disabled:opacity-50"
                        />

                        {uploadProgress && (
                            <div className="text-sm text-sanctum-text-muted bg-sanctum-sidebar px-3 py-2 rounded">
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
                                {uploading ? 'Uploading...' : '⬆️ Upload to Cloudinary'}
                            </button>
                        )}

                        {formData.pdf_url && (
                            <div className="bg-green-900/20 border border-green-500/30 rounded p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-green-400">✅ PDF Uploaded</span>
                                    <a
                                        href={formData.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 text-sm"
                                    >
                                        View PDF →
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={saving || !formData.pdf_url}
                        className="bg-sanctum-accent hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : (isEdit ? 'Update Newsletter' : 'Create Newsletter')}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/admin/newsletter')}
                        className="bg-sanctum-sidebar hover:bg-sanctum-bg text-sanctum-text-muted hover:text-white px-6 py-2 rounded-lg font-medium transition border border-sanctum-border"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
