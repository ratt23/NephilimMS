import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function VisitorChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7days'); // 7days, 30days, year
    const [systemStatus, setSystemStatus] = useState({ online: false, lastSync: null });
    const [summary, setSummary] = useState({ visitors: 0, pageviews: 0 });

    useEffect(() => {
        fetchStats();
    }, [period]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';

            // Add timestamp to prevent caching
            const timestamp = new Date().getTime();
            const res = await fetch(`${apiBase}/analytics?action=stats&period=${period}&t=${timestamp}`);

            if (res.ok) {
                const fetchedData = await res.json();
                setData(fetchedData.stats || []);
                setSystemStatus(fetchedData.systemStatus || { online: true, lastSync: new Date().toISOString() });

                const stats = fetchedData.stats || [];
                const totalVisitors = stats.reduce((acc, curr) => acc + (curr.visitors || 0), 0);
                const totalPageviews = stats.reduce((acc, curr) => acc + (curr.pageviews || 0), 0);
                setSummary({ visitors: totalVisitors, pageviews: totalPageviews });
            }
        } catch (err) {
            console.error("Failed to load analytics", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 font-sans relative">
            {/* Header Section with Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                    Site Traffic
                </h3>

                <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                    {['7days', '30days', 'year'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${period === p
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {p === '7days' ? 'Daily' : p === '30days' ? 'Monthly' : 'Yearly'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {/* System Status Indicator */}
                    <div className="flex flex-col items-end text-right">
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${systemStatus.online ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${systemStatus.online ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            </span>
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                {systemStatus.online ? 'System Online' : 'Offline'}
                            </span>
                        </div>
                        {systemStatus.lastSync && (
                            <span className="text-[10px] text-gray-400">
                                Last Sync: {new Date(systemStatus.lastSync).toLocaleTimeString()}
                            </span>
                        )}
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={fetchStats}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                        title="Refresh Data"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`text-gray-500 group-hover:text-blue-600 ${loading ? 'animate-spin' : ''}`}
                        >
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                            <path d="M21 3v5h-5" />
                        </svg>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="h-[300px] w-full bg-gray-50 animate-pulse rounded-lg flex items-center justify-center text-gray-400 text-sm">
                    Updating Chart...
                </div>
            ) : (
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Area
                                type="monotone"
                                dataKey="visitors"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorVisitors)"
                                strokeWidth={2}
                                name="Unique Visitors"
                            />
                            <Area
                                type="monotone"
                                dataKey="pageviews"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorPageviews)"
                                strokeWidth={2}
                                name="Page Views"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 border-t pt-4">
                <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Visitors</div>
                    <div className="text-2xl font-bold text-gray-800">{summary.visitors.toLocaleString()}</div>
                </div>
                <div className="text-center border-l-0 md:border-l border-r-0 md:border-r border-gray-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Page Views</div>
                    <div className="text-2xl font-bold text-gray-800">{summary.pageviews.toLocaleString()}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Avg. Views/Visitor</div>
                    <div className="text-2xl font-bold text-gray-800">
                        {(summary.visitors ? (summary.pageviews / summary.visitors).toFixed(1) : 0)}
                    </div>
                </div>
            </div>
        </div>
    );
}
