import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { newsletterAPI } from '../api';

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function NewsletterList() {
    const navigate = useNavigate();
    const [newsletters, setNewsletters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const limit = 20;

    useEffect(() => {
        loadNewsletters();
    }, [page]);

    async function loadNewsletters() {
        try {
            setLoading(true);
            const data = await newsletterAPI.getArchive(page, limit, true); // admin=true to see all
            setNewsletters(data.newsletters);
            setTotal(data.total);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleTogglePublish(id) {
        try {
            await newsletterAPI.togglePublish(id);
            // Reload list
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
                    onClick={() => navigate('/admin/newsletter/new')}
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
                    <p className="text-gray-500 mb-4">Klik tombol "New Issue" untuk membuat newsletter pertama</p>
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
                                                onClick={() => navigate(`/admin/newsletter/edit/${newsletter.id}`)}
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

                    {/* Pagination */}
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
