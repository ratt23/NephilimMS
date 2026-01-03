import React, { useState, useEffect } from 'react';
import { Save, Upload, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function PopUpAdsManager() {
    const [adConfig, setAdConfig] = useState({
        image_url: '',
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
            const res = await fetch('/.netlify/functions/api/popup-ad');
            const data = await res.json();
            if (res.ok) {
                setAdConfig(data);
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

            setAdConfig(prev => ({ ...prev, image_url: data.secure_url }));
            setMsg({ type: 'success', text: 'Image uploaded! Remember to Save.' });
        } catch (err) {
            setMsg({ type: 'error', text: "Upload Failed: " + err.message });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMsg(null);
        try {
            const res = await fetch('/.netlify/functions/api/popup-ad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(adConfig)
            });

            if (!res.ok) throw new Error("Failed to save settings");

            setMsg({ type: 'success', text: 'Popup Ad Settings Saved Successfully!' });
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

            <div className="bg-white border border-gray-200 shadow-sm rounded-none">
                <div className="bg-white p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                        Pop Up Ads Manager
                    </h2>
                </div>

                <div className="p-6 space-y-8">

                    {/* Status Message */}
                    {msg && (
                        <div className={`p-4 rounded border flex items-center gap-3 ${msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : (msg.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-red-50 border-red-200 text-red-700')}`}>
                            {msg.type === 'success' ? <CheckCircle size={20} /> : (msg.type === 'info' ? <Upload size={20} /> : <AlertCircle size={20} />)}
                            <span className="font-bold text-sm uppercase">{msg.text}</span>
                        </div>
                    )}

                    {/* Preview Section */}
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded bg-gray-50 min-h-[300px] p-4 relative">
                        {adConfig.image_url ? (
                            <>
                                <img src={adConfig.image_url} alt="Popup Preview" className="max-h-[400px] max-w-full object-contain shadow-lg rounded" />
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded text-xs font-bold uppercase shadow ${adConfig.active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                                    {adConfig.active ? 'Active' : 'Inactive'}
                                </div>
                            </>
                        ) : (
                            <div className="text-gray-400 font-bold uppercase tracking-widest">No Image Uploaded</div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Upload New Image</label>
                            <label className="cursor-pointer flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-300 rounded shadow-sm text-sm font-bold uppercase text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                <Upload size={18} />
                                <span>Choose Image...</span>
                                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                            </label>
                            <p className="text-xs text-gray-400">Recommended size: 600x600px or similar square/portrait aspect.</p>
                        </div>

                        <div className="space-y-4 md:border-l md:pl-6 border-gray-200">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-gray-700 uppercase">Status</label>
                                <button
                                    onClick={() => setAdConfig(prev => ({ ...prev, active: !prev.active }))}
                                    className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase transition-colors ${adConfig.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {adConfig.active ? <Eye size={16} /> : <EyeOff size={16} />}
                                    {adConfig.active ? 'Visible on Site' : 'Hidden'}
                                </button>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-3 px-6 bg-blue-600 text-white font-bold uppercase text-sm rounded shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                {isSaving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
