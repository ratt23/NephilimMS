import { getApiBaseUrl } from './utils/apiConfig';

// Get API Base URL from central config
const BASE_URL = getApiBaseUrl();

// Helper for Fetch requests
const fetchAPI = async (endpoint, options = {}) => {
    try {
        // Remove leading slash if present to avoid double slashes when joining with BASE_URL
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        const url = `${BASE_URL}/${cleanEndpoint}`;

        console.log(`📡 Fetching: ${url}`);

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`❌ API Call Failed (${endpoint}):`, error);
        throw error;
    }
};

// --- Catalog API ---

export const getCatalogItems = async () => {
    // Use new Hono endpoint: /catalog-items
    return await fetchAPI('catalog-items');
};

export const getSettings = async () => {
    // Use new Hono endpoint: /settings
    // Note: eCatalog might use a subset of settings or same as dashboard
    return await fetchAPI('settings');
};

// Add other API functions as needed based on eCatalog requirements
// For example:
// export const getFacilityData = async () => fetchAPI('facility-data');
