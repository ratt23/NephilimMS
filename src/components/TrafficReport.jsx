import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, RefreshCw } from 'lucide-react';
import { getApiBaseUrl } from '../utils/apiConfig';

export default function TrafficReport() {
    const [loading, setLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    useEffect(() => {
        fetchMonthlyReport();
    }, [selectedMonth]);

    const fetchMonthlyReport = async () => {
        setLoading(true);
        try {
            const url = `${getApiBaseUrl()}/analytics?action=monthly&month=${selectedMonth}`;
            console.log('Fetching:', url);

            const res = await fetch(url, { credentials: 'include' });
            console.log('Response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('Data received:', data);
                setMonthlyData(data.stats || []);
            } else {
                console.error('Error response:', await res.text());
            }
        } catch (err) {
            console.error('Failed to load monthly report:', err);
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        const headers = ['Date', 'Day', 'Visitors', 'Page Views', 'Avg Views/Visitor'];
        const rows = monthlyData.map(day => [
            day.formattedDate || new Date(day.date).toLocaleDateString('id-ID'),
            day.dayName || new Date(day.date).toLocaleDateString('id-ID', { weekday: 'long' }),
            day.visitors,
            day.pageviews,
            day.visitors ? (day.pageviews / day.visitors).toFixed(1) : '0'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `traffic-report-${selectedMonth}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const totalVisitors = monthlyData.reduce((acc, day) => acc + (day.visitors || 0), 0);
    const totalPageviews = monthlyData.reduce((acc, day) => acc + (day.pageviews || 0), 0);
    const avgPerDay = monthlyData.length ? (totalVisitors / monthlyData.length).toFixed(0) : 0;

    return (
        <div className="bg-sanctum-surface p-6 rounded-lg shadow-2xl border border-sanctum-border font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-sanctum-text-curr flex items-center gap-2">
                    <FileText className="text-sanctum-accent" size={20} />
                    Monthly Traffic Report
                </h3>

                <div className="flex items-center gap-3">
                    {/* Month Selector */}
                    <div className="flex items-center gap-2 bg-sanctum-bg px-3 py-2 rounded-lg border border-sanctum-border">
                        <Calendar size={16} className="text-sanctum-accent" />
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            max={new Date().toISOString().slice(0, 7)}
                            className="bg-transparent text-sm font-medium text-sanctum-text-curr outline-none"
                        />
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={fetchMonthlyReport}
                        disabled={loading}
                        className="flex items-center gap-2 bg-sanctum-surface hover:bg-sanctum-sidebar disabled:bg-sanctum-surface/50 text-sanctum-text-curr border border-sanctum-border px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        title="Refresh data"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>

                    {/* Download Button */}
                    <button
                        onClick={downloadCSV}
                        disabled={loading || monthlyData.length === 0}
                        className="flex items-center gap-2 bg-sanctum-accent hover:bg-blue-600 disabled:bg-sanctum-surface/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download size={16} />
                        Download CSV
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-sanctum-bg p-4 rounded-lg border border-blue-500/20">
                    <div className="text-xs text-blue-400 uppercase tracking-wide font-semibold mb-1">Total Visitors</div>
                    <div className="text-2xl font-bold text-blue-300">{totalVisitors.toLocaleString()}</div>
                </div>
                <div className="bg-sanctum-bg p-4 rounded-lg border border-green-500/20">
                    <div className="text-xs text-green-400 uppercase tracking-wide font-semibold mb-1">Total Page Views</div>
                    <div className="text-2xl font-bold text-green-300">{totalPageviews.toLocaleString()}</div>
                </div>
                <div className="bg-sanctum-bg p-4 rounded-lg border border-purple-500/20">
                    <div className="text-xs text-purple-400 uppercase tracking-wide font-semibold mb-1">Avg Per Day</div>
                    <div className="text-2xl font-bold text-purple-300">{avgPerDay}</div>
                </div>
                <div className="bg-sanctum-bg p-4 rounded-lg border border-orange-500/20">
                    <div className="text-xs text-orange-400 uppercase tracking-wide font-semibold mb-1">Days Tracked</div>
                    <div className="text-2xl font-bold text-orange-300">{monthlyData.length}</div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="h-96 bg-sanctum-bg animate-pulse rounded-lg flex items-center justify-center text-sanctum-text-muted border border-sanctum-border">
                    Loading report...
                </div>
            ) : monthlyData.length === 0 ? (
                <div className="h-96 bg-sanctum-bg rounded-lg flex flex-col items-center justify-center text-sanctum-text-muted border border-sanctum-border">
                    <Calendar size={48} className="mb-2 text-sanctum-accent" />
                    <p>No data available for this month</p>
                    <p className="text-xs mt-2">Try selecting a different month or click Refresh</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-sanctum-border rounded-lg bg-sanctum-bg">
                    <table className="w-full text-sm">
                        <thead className="bg-sanctum-surface border-b border-sanctum-border">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-sanctum-accent">Date</th>
                                <th className="px-4 py-3 text-left font-semibold text-sanctum-accent">Day</th>
                                <th className="px-4 py-3 text-right font-semibold text-sanctum-accent">Visitors</th>
                                <th className="px-4 py-3 text-right font-semibold text-sanctum-accent">Page Views</th>
                                <th className="px-4 py-3 text-right font-semibold text-sanctum-accent">Avg Views/Visitor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sanctum-border">
                            {monthlyData.map((day, index) => (
                                <tr key={index} className="hover:bg-sanctum-surface transition-colors">
                                    <td className="px-4 py-3 font-medium text-sanctum-text-curr">
                                        {day.formattedDate || new Date(day.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-4 py-3 text-sanctum-text-muted">
                                        {day.dayName || new Date(day.date).toLocaleDateString('id-ID', { weekday: 'long' })}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-blue-400">
                                        {day.visitors.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-green-400">
                                        {day.pageviews.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sanctum-text-curr">
                                        {day.visitors ? (day.pageviews / day.visitors).toFixed(1) : '0'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
