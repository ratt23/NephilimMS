import React, { useState, useEffect } from 'react';
import { Save, Upload, AlertCircle, CheckCircle, Eye, EyeOff, Trash2, ArrowRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { getApiBaseUrl } from '../utils/apiConfig';

export default function PopUpAdsManager() {
    const [adConfig, setAdConfig] = useState({
        images: [],
        active: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        fetchAdConfig();
    }, []);

    const fetchAdConfig = async () => {
        try {
            const res = await fetch(`${getApiBaseUrl()}/popup-ad`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                // Ensure images is array
                setAdConfig({
                    images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
                    active: data.active
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (adConfig.images.length >= 2) {
            setMsg({ type: 'error', text: "Max 2 images allowed." });
            return;
        }

        const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            setMsg({ type: 'error', text: "Missing Cloudinary Env Variables" });
            return;
        }

        const formDataApi = new FormData();
        formDataApi.append('file', file);
        formDataApi.append('upload_preset', UPLOAD_PRESET);
        formDataApi.append('cloud_name', CLOUD_NAME);

        setMsg({ type: 'info', text: 'Uploading image...' });

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formDataApi,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error.message);

            setAdConfig(prev => ({
                ...prev,
                images: [...prev.images, data.secure_url]
            }));
            setMsg({ type: 'success', text: 'Image uploaded! Remember to Save.' });
        } catch (err) {
            setMsg({ type: 'error', text: "Upload Failed: " + err.message });
        }
    };

    const removeImage = (index) => {
        if (confirm('Remove this image?')) {
            setAdConfig(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMsg(null);
        try {
            const payload = {
                images: adConfig.images,
                active: adConfig.active
            };

            const res = await fetch(`${getApiBaseUrl()}/popup-ad`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed to save settings");

            setAdConfig(prev => ({ ...data }));
            setMsg({ type: 'success', text: 'Popup Settings Saved!' });
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
                        Pop Up Ads Manager (Max 2 Slides)
                    </h2>
                </div>

                <div className="p-6 space-y-8">
                    {/* Status Message */}
                    {msg && (
                        <div className={`p-4 rounded border flex items-center gap-3 ${msg.type === 'success' ? 'bg-green-900/20 border-green-200 text-green-700' : (msg.type === 'info' ? 'bg-blue-900/20 border-blue-200 text-blue-700' : 'bg-red-900/20 border-red-200 text-red-700')}`}>
                            {msg.type === 'success' ? <CheckCircle size={20} /> : (msg.type === 'info' ? <Upload size={20} /> : <AlertCircle size={20} />)}
                            <span className="font-bold text-sm uppercase">{msg.text}</span>
                        </div>
                    )}

                    {/* Images List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {adConfig.images.map((img, idx) => (
                            <div key={idx} className="relative group border-2 border-dashed border-[#8C7A3E]/30 rounded bg-[#0B0B0C] p-2 aspect-video flex items-center justify-center">
                                <img src={img} alt={`Slide ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Slide {idx + 1}</div>
                                <button
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}

                        {/* Upload Placeholder */}
                        {adConfig.images.length < 2 && (
                            <div className="border-2 border-dashed border-[#8C7A3E]/30 rounded bg-[#1a1d21] p-4 aspect-video flex flex-col items-center justify-center text-[#a0a4ab] hover:bg-[#25282c] transition-colors">
                                <label className="cursor-pointer flex flex-col items-center gap-2 w-full h-full justify-center">
                                    <Upload size={32} />
                                    <span className="font-bold uppercase text-xs">Add Slide {adConfig.images.length + 1}</span>
                                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Global Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#8C7A3E]/20 pt-6">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-bold text-[#E6E6E3] uppercase">Status</label>
                            <button
                                onClick={() => setAdConfig(prev => ({ ...prev, active: !prev.active }))}
                                className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase transition-colors ${adConfig.active ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
                            >
                                {adConfig.active ? <Eye size={16} /> : <EyeOff size={16} />}
                                {adConfig.active ? 'Visible' : 'Hidden'}
                            </button>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full sm:w-auto py-3 px-8 bg-[#8C7A3E] text-white font-bold uppercase text-sm rounded shadow-lg hover:bg-[#a89150] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            {isSaving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
