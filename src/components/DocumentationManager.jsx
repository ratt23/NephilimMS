import React, { useState } from 'react';

export default function DocumentationManager() {
    const [activeTab, setActiveTab] = useState('database');

    const tabs = [
        { id: 'database', label: 'Database Setup' },
        { id: 'api', label: 'API Reference' },
        { id: 'env', label: 'Environment Setup' }
    ];

    const sqlSchema = `-- 1. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    image_url TEXT,
    schedule JSONB DEFAULT '{}'
);

-- 2. Leave Data Table
CREATE TABLE IF NOT EXISTS leave_data (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

-- 3. Promo Images Table
CREATE TABLE IF NOT EXISTS promo_images (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0
);

-- 4. SSTV Images (SlideShow TV)
CREATE TABLE IF NOT EXISTS sstv_images (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER UNIQUE REFERENCES doctors(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

-- 5. Blog/News Posts
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'draft', -- 'published', 'draft', 'archived'
    category TEXT DEFAULT 'article',
    tags TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Application Settings (Key-Value Store)
CREATE TABLE IF NOT EXISTS app_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT,
    is_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    timestamp TIMESTAMP DEFAULT NOw(),
    event_type TEXT DEFAULT 'pageview', -- 'pageview', 'conversion', 'click'
    event_name TEXT, -- e.g., 'whatsapp_click', 'mcu_submit'
    region TEXT,
    city TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    referrer TEXT,
    traffic_source TEXT, -- 'google', 'direct', 'social'
    path TEXT,
    ip_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(date);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);

-- 8. Device Status (TV/Slideshow Clients)
CREATE TABLE IF NOT EXISTS device_status (
    device_id TEXT PRIMARY KEY,
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    browser_info TEXT,
    current_slide TEXT,
    ip_address TEXT,
    status TEXT DEFAULT 'offline',
    refresh_trigger BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    nickname TEXT
);

-- 9. MCU Packages
CREATE TABLE IF NOT EXISTS mcu_packages (
    id SERIAL PRIMARY KEY,
    package_id TEXT NOT NULL, -- e.g. 'basic', 'premium'
    name TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    base_price DECIMAL(12,2),
    image_url TEXT,
    is_pelaut BOOLEAN DEFAULT FALSE,
    is_recommended BOOLEAN DEFAULT FALSE,
    items JSONB DEFAULT '[]', -- List of package items
    addons JSONB DEFAULT '[]',
    is_enabled BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);`;

    const apiEndpoints = [
        { method: 'GET', path: '/api/doctors', desc: 'List all doctors with pagination' },
        { method: 'POST', path: '/api/doctors', desc: 'Create new doctor' },
        { method: 'PUT', path: '/api/doctors', desc: 'Update doctor details' },
        { method: 'DELETE', path: '/api/doctors', desc: 'Delete doctor' },
        { method: 'GET', path: '/api/leaves', desc: 'Get all active leave data' },
        { method: 'POST', path: '/api/leaves', desc: 'Add new leave schedule' },
        { method: 'GET', path: '/api/analytics', desc: 'Get analytics stats (action=stats)' },
        { method: 'POST', path: '/api/analytics', desc: 'Track new event (action=track)' },
        { method: 'GET', path: '/api/settings', desc: 'Get all app settings' },
        { method: 'POST', path: '/api/settings', desc: 'Update app settings' },
        { method: 'GET', path: '/api/posts', desc: 'Get blog posts with filters' },
        { method: 'GET', path: '/api/sstv_images', desc: 'Get slideshow images' },
        { method: 'POST', path: '/api/device-heartbeat', desc: 'Send device heartbeat' },
    ];

    const envSetup = `
# Backend Environment Variables (.env)
NEON_DATABASE_URL="postgres://user:pass@host/db?sslmode=require"
ONESIGNAL_APP_ID="your-app-id"
ONESIGNAL_API_KEY="your-api-key"

# Frontend Environment Variables
VITE_API_BASE_URL="https://your-backend.netlify.app/.netlify/functions"
    `;

    return (
        <div className="animate-fade-in font-sans p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    System Documentation
                </h2>
                <p className="text-gray-500 mt-2 text-lg">
                    Comprehensive guide for database setup, API usage, and system configuration.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm min-h-[500px]">

                {/* DATABASE TAB */}
                {activeTab === 'database' && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">PostgreSQL Schema</h3>
                            <button
                                onClick={() => navigator.clipboard.writeText(sqlSchema)}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                Copy SQL
                            </button>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-gray-100 font-mono text-sm leading-relaxed">
                                {sqlSchema}
                            </pre>
                        </div>
                    </div>
                )}

                {/* API TAB */}
                {activeTab === 'api' && (
                    <div className="p-0">
                        <div className="border-b px-6 py-4 bg-gray-50 rounded-t-lg">
                            <h3 className="text-lg font-semibold text-gray-800">Netlify Functions Endpoints</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {apiEndpoints.map((endpoint, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded text-xs font-bold w-20 text-center uppercase ${endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                                            endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                                                endpoint.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                                                    'bg-orange-100 text-orange-700'
                                        }`}>
                                        {endpoint.method}
                                    </span>
                                    <code className="text-sm font-mono text-gray-800 flex-1">{endpoint.path}</code>
                                    <span className="text-sm text-gray-500">{endpoint.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ENV TAB */}
                {activeTab === 'env' && (
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Environment Validation</h3>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <h4 className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                Important Note
                            </h4>
                            <p className="text-sm text-yellow-700">
                                This application requires a <strong>PostgreSQL</strong> database (configured via `NEON_DATABASE_URL`).
                                Frontend and Backend are decoupled; ensure `VITE_API_BASE_URL` in the frontend points to the active Netlify Functions URL.
                            </p>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-gray-100 font-mono text-sm leading-relaxed">
                                {envSetup}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
