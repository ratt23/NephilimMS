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
        console.log(`🔄 Using API override: ${override}`);
        return API_SERVERS[override];
    }

    // Use environment variable
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl) {
        return envUrl;
    }

    // Fallback
    const url = import.meta.env.DEV ? API_SERVERS.local : API_SERVERS.dashdev3;

    // Ensure URL ends with /api
    if (!url.endsWith('/api') && !url.endsWith('/api/')) {
        return `${url}/api`;
    }
    return url;
}

/**
 * Helper to switch API server (for development/testing)
 * @param {string} serverKey - 'local', 'dashdev1', or 'dashdev2'
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

// Development helper - expose to window for console access
if (import.meta.env.DEV) {
    window.apiConfig = {
        switch: setApiServer,
        clear: clearApiOverride,
        current: getApiBaseUrl,
        available: Object.keys(API_SERVERS)
    };
    console.log('💡 API Switcher available in console:');
    console.log('   - apiConfig.switch("dashdev1") - Switch to dashdev1');
    console.log('   - apiConfig.switch("dashdev2") - Switch to dashdev2');
    console.log('   - apiConfig.switch("local") - Switch to localhost');
    console.log('   - apiConfig.clear() - Clear override');
    console.log('   - apiConfig.current() - Show current API');
}
