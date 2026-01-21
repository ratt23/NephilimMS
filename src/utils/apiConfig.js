// API Configuration with override support for white-label deployments
const API_SERVERS = {
    local: '/.netlify/functions/api',
    dashdev1: 'https://dashdev1.netlify.app/.netlify/functions/api',
    dashdev2: 'https://dashdev2.netlify.app/.netlify/functions/api',
    dashdev3: 'https://dashdev3.netlify.app/.netlify/functions/api'
};

/**
 * Get API base URL with override support
 * Priority: localStorage override > environment variable > fallback
 */
export function getApiBaseUrl() {
    // Check localStorage override (for development/testing)
    const override = localStorage.getItem('api_server_override');
    if (override && API_SERVERS[override]) {
        return API_SERVERS[override];
    }

    // Use environment variable based on VITE mode
    // In dev, usually undefined or set in .env
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl) {
        return envUrl;
    }

    // Fallback logic
    return import.meta.env.DEV ? API_SERVERS.local : API_SERVERS.dashdev3;
}

/**
 * Helper to switch API server (for development/testing)
 * @param {string} serverKey - 'local', 'dashdev1', 'dashdev2', or 'dashdev3'
 */
export function setApiServer(serverKey) {
    if (API_SERVERS[serverKey]) {
        localStorage.setItem('api_server_override', serverKey);
        console.log(`✅ API server switched to: ${serverKey}`);
        console.log('⚠️ Reload page to apply changes');
        return true;
    }
    console.error(`❌ Invalid server key: ${serverKey}`);
    return false;
}

/**
 * Helper to clear override
 */
export function clearApiOverride() {
    localStorage.removeItem('api_server_override');
    console.log('✅ API override cleared');
}

// Development helper
if (import.meta.env.DEV) {
    window.apiConfig = {
        switch: setApiServer,
        clear: clearApiOverride,
        current: getApiBaseUrl,
        available: Object.keys(API_SERVERS)
    };
}
