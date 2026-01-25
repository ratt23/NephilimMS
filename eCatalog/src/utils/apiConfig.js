// API Configuration with override support for white-label deployments
const API_SERVERS = {
    local: '/.netlify/functions/api',
    dashdev1: 'https://dashdev1.netlify.app/.netlify/functions/api',
    dashdev2: 'https://dashdev2.netlify.app/.netlify/functions/api',
    dashdev3: 'https://dashdev3.netlify.app/.netlify/functions/api',
    dashdev4: 'https://dashdev4.netlify.app/.netlify/functions/api'
};

/**
 * Get API base URL with override support
 */
export function getApiBaseUrl() {
    const override = localStorage.getItem('api_server_override');
    if (override && API_SERVERS[override]) {
        console.log(`🔄 Using API override: ${override}`);
        return API_SERVERS[override];
    }

    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl) {
        return envUrl;
    }

    return import.meta.env.DEV ? API_SERVERS.local : API_SERVERS.dashdev4;
}

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

export function clearApiOverride() {
    localStorage.removeItem('api_server_override');
    console.log('✅ API override cleared');
}

if (import.meta.env.DEV) {
    window.apiConfig = {
        switch: setApiServer,
        clear: clearApiOverride,
        current: getApiBaseUrl,
        available: Object.keys(API_SERVERS)
    };
    console.log('💡 API Switcher available in console');
}
