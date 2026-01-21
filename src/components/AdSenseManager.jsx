import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { getApiBaseUrl } from '../utils/apiConfig';

export default function AdSenseManager() {
    const [settings, setSettings] = useState({
        adsense_script: '',
        show_ads_on_article: true,
        show_ads_on_newsletter: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${getApiBaseUrl()}/settings`, { credentials: 'include' });
            const data = await res.json();
            if (res.ok) {
                // Map API response ({ key: { value, enabled } }) to local state
                setSettings({
                    adsense_script: data.adsense_script?.value || '',
                    show_ads_on_article: data.show_ads_on_article?.enabled ?? true,
                    show_ads_on_newsletter: data.show_ads_on_newsletter?.enabled ?? false
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMsg(null);
        try {
            // Transform back to API format: { key: { value, enabled } }
            const payload = {
                adsense_script: { value: settings.adsense_script, enabled: true },
                show_ads_on_article: { value: 'true', enabled: settings.show_ads_on_article },
                show_ads_on_newsletter: { value: 'false', enabled: settings.show_ads_on_newsletter }
            };

            const res = await fetch(`${getApiBaseUrl()}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (!res.ok) throw new Error("Failed to save settings");

            setMsg({ type: 'success', text: 'Ad Settings Saved Successfully!' });

            // Auto hide msg
            setTimeout(() => setMsg(null), 3000);

        } catch (err) {
            setMsg({ type: 'error', text: err.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-12"><LoadingSpinner /></div>;

    return (
        <div className="space-y-6 animate-fade-in font-sans max-w-4xl mx-auto">

            <div className="bg-[#1a1d21] border border-[#8C7A3E]/20 shadow-2xl-sm rounded-none">
                <div className="bg-[#1a1d21] p-4 border-b border-[#8C7A3E]/20">
                    <h2 className="text-lg font-bold text-[#E6E6E3] uppercase tracking-wide flex items-center gap-2">
                        AdSense & Monetization
                    </h2>
                </div>

                <div className="p-6 space-y-8">

                    {/* Status Message */}
                    {msg && (
                        <div className={`p-4 rounded border flex items-center gap-3 ${msg.type === 'success' ? 'bg-green-900/20 border-green-200 text-green-700' : 'bg-red-900/20 border-red-200 text-red-700'}`}>
                            {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="font-bold text-sm uppercase">{msg.text}</span>
                        </div>
                    )}

                    {/* Global Script Section */}
                    <div>
                        <h3 className="text-sm font-bold text-[#E6E6E3] uppercase mb-2">Global AdSense Script</h3>
                        <p className="text-xs text-[#a0a4ab] mb-3">Paste your <code>&lt;script async ...&gt;</code> code here from your AdSense dashboard. This will be injected into the head of your pages.</p>
                        <textarea
                            rows="6"
                            value={settings.adsense_script}
                            onChange={(e) => setSettings({ ...settings, adsense_script: e.target.value })}
                            className="block w-full px-3 py-2 border border-[#8C7A3E]/30 rounded-sm font-mono text-xs bg-[#0B0B0C] focus:ring-blue-500 focus:border-blue-500"
                            placeholder='<script async src="https://pagead2.googlesyndication.com/..."></script>'
                        />
                    </div>

                    <div className="border-t border-[#8C7A3E]/10 pt-6"></div>

                    {/* Placement Rules */}
                    <div>
                        <h3 className="text-sm font-bold text-[#E6E6E3] uppercase mb-4">Ad Placements</h3>
                        <div className="space-y-4">

                            <label className="flex items-center gap-3 cursor-pointer p-4 border border-[#8C7A3E]/20 rounded-sm hover:bg-[#0B0B0C] transition-colors">
                                <input
                                    type="checkbox"
                                    checked={settings.show_ads_on_article}
                                    onChange={(e) => setSettings({ ...settings, show_ads_on_article: e.target.checked })}
                                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-[#8C7A3E]/30"
                                />
                                <div>
                                    <div className="font-bold text-sm text-[#E6E6E3] uppercase">Show on Articles</div>
                                    <div className="text-xs text-[#a0a4ab]">Enable ads on posts categorized as "Article"</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer p-4 border border-[#8C7A3E]/20 rounded-sm hover:bg-[#0B0B0C] transition-colors">
                                <input
                                    type="checkbox"
                                    checked={settings.show_ads_on_newsletter}
                                    onChange={(e) => setSettings({ ...settings, show_ads_on_newsletter: e.target.checked })}
                                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-[#8C7A3E]/30"
                                />
                                <div>
                                    <div className="font-bold text-sm text-[#E6E6E3] uppercase">Show on Newsletters</div>
                                    <div className="text-xs text-[#a0a4ab]">Enable ads on posts categorized as "Newsletter"</div>
                                </div>
                            </label>

                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="py-2 px-6 bg-[#8C7A3E] text-white font-bold uppercase text-sm rounded-sm shadow-2xl-md hover:bg-[#a89150] transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save size={18} />
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
