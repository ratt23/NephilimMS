import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, RefreshCw } from 'lucide-react';

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
            const apiBase = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';
            const url = `${apiBase}/analytics?action=monthly&month=${selectedMonth}`;
            console.log('Fetching:', url);

            const res = await fetch(url);
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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="text-blue-600" size={20} />
                    Monthly Traffic Report
                </h3>

                <div className="flex items-center gap-3">
                    {/* Month Selector */}
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                        <Calendar size={16} className="text-gray-500" />
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            max={new Date().toISOString().slice(0, 7)}
                            className="bg-transparent text-sm font-medium text-gray-700 outline-none"
                        />
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={fetchMonthlyReport}
                        disabled={loading}
                        className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        title="Refresh data"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>

                    {/* Download Button */}
                    <button
                        onClick={downloadCSV}
                        disabled={loading || monthlyData.length === 0}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download size={16} />
                        Download CSV
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-xs text-blue-600 uppercase tracking-wide font-semibold mb-1">Total Visitors</div>
                    <div className="text-2xl font-bold text-blue-900">{totalVisitors.toLocaleString()}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-xs text-green-600 uppercase tracking-wide font-semibold mb-1">Total Page Views</div>
                    <div className="text-2xl font-bold text-green-900">{totalPageviews.toLocaleString()}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-xs text-purple-600 uppercase tracking-wide font-semibold mb-1">Avg Per Day</div>
                    <div className="text-2xl font-bold text-purple-900">{avgPerDay}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-xs text-orange-600 uppercase tracking-wide font-semibold mb-1">Days Tracked</div>
                    <div className="text-2xl font-bold text-orange-900">{monthlyData.length}</div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="h-96 bg-gray-50 animate-pulse rounded-lg flex items-center justify-center text-gray-400">
                    Loading report...
                </div>
            ) : monthlyData.length === 0 ? (
                <div className="h-96 bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-400">
                    <Calendar size={48} className="mb-2" />
                    <p>No data available for this month</p>
                    <p className="text-xs mt-2">Try selecting a different month or click Refresh</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Day</th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-700">Visitors</th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-700">Page Views</th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-700">Avg Views/Visitor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {monthlyData.map((day, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {day.formattedDate || new Date(day.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {day.dayName || new Date(day.date).toLocaleDateString('id-ID', { weekday: 'long' })}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-blue-600">
                                        {day.visitors.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                                        {day.pageviews.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-700">
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
