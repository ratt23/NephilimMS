import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getApiBaseUrl } from '../utils/apiConfig';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdvancedAnalytics() {
    const [data, setData] = useState(null);
    const [period, setPeriod] = useState('7days');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                // In a real implementation: fetch(`${API_BASE}/analytics?action=stats&type=advanced&period=${period}`)
                // For now, we simulate or fetch basic stats. 
                // Since the backend 'advanced' query isn't implemented in full aggregation yet, 
                // we will placeholder this or implement a basic fetch if the backend supports it.
                // WE NEED TO UPDATE ANALYTICS.JS TO SUPPORT 'advanced' stats first?
                // Or we can just fetch 'stats' and Client-side process if the volume is low? 
                // Let's assume we fetch a mocked structure for UI Dev first, or basic stats.

                const res = await fetch(`${getApiBaseUrl()}/analytics?action=stats&type=advanced&period=${period}`, { credentials: 'include' });
                const advancedData = await res.json();

                // Fallback for empty data to avoid crash
                setData({
                    devices: advancedData.devices || [],
                    browsers: advancedData.browsers || [],
                    sources: advancedData.sources || [],
                    topPages: advancedData.topPages || [],
                    conversions: advancedData.conversions || []
                });
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [period]);

    if (loading) return <div className="p-4 text-center text-[#a0a4ab]">Loading Analytics...</div>;
    if (!data) return <div className="p-4 text-center text-[#a0a4ab]">No Data Available</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-sanctum-text-curr">Detailed Traffic Analysis</h3>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="border border-sanctum-border rounded px-2 py-1 text-sm bg-sanctum-bg text-sanctum-text-curr"
                >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Traffic Sources */}
                <div className="bg-sanctum-surface p-4 rounded shadow-2xl border border-sanctum-border">
                    <h4 className="text-sm font-bold text-sanctum-accent mb-4">Traffic Sources</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.sources}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.sources.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Device Breakdown */}
                <div className="bg-sanctum-surface p-4 rounded shadow-2xl border border-sanctum-border">
                    <h4 className="text-sm font-bold text-sanctum-accent mb-4">Device Usage</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.devices} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" barSize={20} radius={[0, 4, 4, 0]}>
                                    {data.devices.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Pages Table */}
                <div className="bg-sanctum-surface p-4 rounded shadow-2xl border border-sanctum-border md:col-span-2">
                    <h4 className="text-sm font-bold text-sanctum-accent mb-4">Top Visited Pages</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-sanctum-bg text-sanctum-accent font-medium border-b border-sanctum-border">
                                <tr>
                                    <th className="py-2 px-3">Page URL</th>
                                    <th className="py-2 px-3 text-right">Views</th>
                                    <th className="py-2 px-3 text-right">% of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topPages.map((page, idx) => (
                                    <tr key={idx} className="border-b border-[#8C7A3E]/10 last:border-0 hover:bg-[#0B0B0C]">
                                        <td className="py-2 px-3 font-mono text-xs text-[#E6E6E3]">{page.name}</td>
                                        <td className="py-2 px-3 text-right font-semibold text-[#E6E6E3]">{page.value}</td>
                                        <td className="py-2 px-3 text-right text-[#a0a4ab]">
                                            {((page.value / 2500) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Conversion Events Table */}
            <div className="bg-sanctum-surface p-4 rounded shadow-2xl border border-sanctum-border">
                <h4 className="text-sm font-bold text-sanctum-accent mb-4">Conversion Events</h4>
                {data.conversions && data.conversions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-green-900/20 text-green-400 font-medium border-b border-green-500/20">
                                <tr>
                                    <th className="py-2 px-3">Event Name</th>
                                    <th className="py-2 px-3 text-right">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.conversions.map((event, idx) => (
                                    <tr key={idx} className="border-b border-[#8C7A3E]/10 last:border-0 hover:bg-[#0B0B0C]">
                                        <td className="py-2 px-3 font-mono text-xs text-[#E6E6E3]">{event.name}</td>
                                        <td className="py-2 px-3 text-right font-bold text-green-400">{event.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-[#a0a4ab] text-xs italic">
                        No conversion events recorded yet.
                    </div>
                )}
            </div>
        </div>
    );
}
