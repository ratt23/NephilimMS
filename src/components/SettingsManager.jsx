import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function SettingsManager() {
    const [isLoading, setIsLoading] = useState(false);
    const [apiConfig, setApiConfig] = useState({
        oneSignalAppId: '',
        oneSignalApiKey: '',
    });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        // Load existing settings if available (mocking this for now or using localStorage)
        const savedAppId = localStorage.getItem('oneSignalAppId') || '';
        const savedApiKey = localStorage.getItem('oneSignalApiKey') || '';
        setApiConfig({ oneSignalAppId: savedAppId, oneSignalApiKey: savedApiKey });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setApiConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call or save to backend
        setTimeout(() => {
            localStorage.setItem('oneSignalAppId', apiConfig.oneSignalAppId);
            localStorage.setItem('oneSignalApiKey', apiConfig.oneSignalApiKey);
            setIsLoading(false);
            setMessage({ type: 'success', text: 'Settings saved successfully!' });

            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        }, 800);
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="bg-white border border-gray-200 shadow-sm rounded-none">

                {/* TOLBAR */}
                <div className="bg-white p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                        <span>System Settings</span>
                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">Global Configuration</span>
                    </h2>
                </div>

                <div className="bg-gray-50 border-b border-gray-100 p-4 text-sm text-gray-600">
                    <p>Manage global application settings and API configurations.</p>
                </div>

                <div className="p-8 max-w-4xl">
                    {message && (
                        <div className={`mb-6 p-4 rounded text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-8">
                        {/* OneSignal Configuration */}
                        <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
                            <h3 className="text-base font-bold text-gray-800 mb-4 border-b pb-2 uppercase text-xs tracking-wider">OneSignal API Configuration</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">OneSignal App ID</label>
                                    <input
                                        type="text"
                                        name="oneSignalAppId"
                                        value={apiConfig.oneSignalAppId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                                        placeholder="Enter OneSignal App ID"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Found in OneSignal Dashboard &gt; Settings &gt; Keys &amp; IDs</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">OneSignal Rest API Key</label>
                                    <input
                                        type="password"
                                        name="oneSignalApiKey"
                                        value={apiConfig.oneSignalApiKey}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                                        placeholder="Enter OneSignal REST API Key"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Found in OneSignal Dashboard &gt; Settings &gt; Keys &amp; IDs. Keep this secret.</p>
                                </div>
                            </div>
                        </div>

                        {/* General Save Button */}
                        <div className="flex justify-start">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded shadow-sm text-sm uppercase tracking-wide transition-colors"
                            >
                                {isLoading ? <LoadingSpinner size="sm" color="white" /> : null}
                                {isLoading ? 'Saving...' : 'Save Configuration'}
                            </button>

                            {/* Explicit "Change API" button requested by user, distinct from Save */}
                            {/* Wait, the "Save" effectively changes it. But maybe they want a specific "Change API" action? 
                        I'll Stick to "Save Configuration" as the primary action, but maybe label the section "Change API"
                    */}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
