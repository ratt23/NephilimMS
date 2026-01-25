import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../utils/apiConfig';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function VisitorChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7days'); // 7days, 30days, year
    const [systemStatus, setSystemStatus] = useState({ online: false, lastSync: null });
    const [summary, setSummary] = useState({ visitors: 0, pageviews: 0, todayVisitors: 0, todayPageviews: 0 });

    useEffect(() => {
        fetchStats();
    }, [period]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Add timestamp to prevent caching
            const timestamp = new Date().getTime();
            const res = await fetch(`${getApiBaseUrl()}/analytics?action=stats&period=${period}&t=${timestamp}`, { credentials: 'include' });

            if (res.ok) {
                const fetchedData = await res.json();
                setData(fetchedData.stats || []);
                setSystemStatus(fetchedData.systemStatus || { online: true, lastSync: new Date().toISOString() });

                const stats = fetchedData.stats || [];
                const totalVisitors = stats.reduce((acc, curr) => acc + (curr.visitors || 0), 0);
                const totalPageviews = stats.reduce((acc, curr) => acc + (curr.pageviews || 0), 0);

                // Get today's stats (last item in array)
                const todayData = stats[stats.length - 1] || {};
                const todayVisitors = todayData.visitors || 0;
                const todayPageviews = todayData.pageviews || 0;

                setSummary({
                    visitors: totalVisitors,
                    pageviews: totalPageviews,
                    todayVisitors,
                    todayPageviews
                });
            }
        } catch (err) {
            console.error("Failed to load analytics", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-sanctum-surface p-6 rounded-lg shadow-2xl border border-sanctum-border mb-6 font-sans relative">
            {/* Header Section with Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-sanctum-text-curr flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sanctum-accent"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                    Site Traffic
                </h3>

                <div className="flex items-center space-x-2 bg-sanctum-bg p-1 rounded-lg border border-sanctum-border">
                    {['7days', '30days', 'year'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${period === p
                                ? 'bg-sanctum-accent text-white shadow-xl'
                                : 'text-sanctum-text-muted hover:text-sanctum-text-curr'
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
                            <span className="text-xs font-semibold text-[#a0a4ab] uppercase tracking-wide">
                                {systemStatus.online ? 'System Online' : 'Offline'}
                            </span>
                        </div>
                        {systemStatus.lastSync && (
                            <span className="text-[10px] text-[#a0a4ab]/60">
                                Last Sync: {new Date(systemStatus.lastSync).toLocaleTimeString()}
                            </span>
                        )}
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={fetchStats}
                        className="p-2 hover:bg-[#0B0B0C] rounded-full transition-colors group"
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
                            className={`text-sanctum-accent group-hover:text-blue-400 ${loading ? 'animate-spin' : ''}`}
                        >
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                            <path d="M21 3v5h-5" />
                        </svg>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="h-[300px] w-full bg-sanctum-bg animate-pulse rounded-lg flex items-center justify-center text-sanctum-text-muted text-sm border border-sanctum-border">
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
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8C7A3E" opacity={0.1} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#a0a4ab', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#a0a4ab', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#13233A', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', color: '#EAF2FF' }}
                                itemStyle={{ fontSize: '12px', fontWeight: '600', color: '#EAF2FF' }}
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-sanctum-border pt-4">
                <div className="text-center">
                    <div className="text-xs text-sanctum-text-muted uppercase tracking-wide font-semibold">Today</div>
                    <div className="text-2xl font-bold text-blue-400">{summary.todayVisitors.toLocaleString()}</div>
                    <div className="text-xs text-sanctum-text-muted/60 mt-1">{summary.todayPageviews.toLocaleString()} views</div>
                </div>
                <div className="text-center border-l border-sanctum-border">
                    <div className="text-xs text-sanctum-text-muted uppercase tracking-wide font-semibold">Total Visitors</div>
                    <div className="text-2xl font-bold text-sanctum-text-curr">{summary.visitors.toLocaleString()}</div>
                </div>
                <div className="text-center border-l border-sanctum-border">
                    <div className="text-xs text-sanctum-text-muted uppercase tracking-wide font-semibold">Page Views</div>
                    <div className="text-2xl font-bold text-sanctum-text-curr">{summary.pageviews.toLocaleString()}</div>
                </div>
                <div className="text-center border-l border-sanctum-border">
                    <div className="text-xs text-sanctum-text-muted uppercase tracking-wide font-semibold">Avg. Views/Visitor</div>
                    <div className="text-2xl font-bold text-[#E6E6E3]">
                        {(summary.visitors ? (summary.pageviews / summary.visitors).toFixed(1) : 0)}
                    </div>
                </div>
            </div>
        </div>
    );
}
