export const getProxiedImageUrl = (url) => {
    if (!url) return url;

    // Handle local assets with Vite Base URL
    if (url.startsWith('/asset') && !url.startsWith(import.meta.env.BASE_URL)) {
        // Remove leading slash from url to avoid double slashes if BASE_URL ends with slash
        const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
        const relativeUrl = url.startsWith('/') ? url.slice(1) : url;
        return `${baseUrl}${relativeUrl}`;
    }

    if (url === '/asset/logo/logo.png') return url; // Should be caught above, but keeping for safety

    // Check if Cloudinary or External URL that might have CORS issues
    if (url.includes('cloudinary.com')) {
        // Use Netlify Rewrite (faster than function)
        // URL format: https://res.cloudinary.com/cloud/image/type/v123/id
        // Rewrite expects: /cloudinary-proxy/cloud/image/type/v123/id
        return url.replace('https://res.cloudinary.com', '/cloudinary-proxy');
    }

    return url;
};

// Function for eCatalog components with fallback support
export const getValidImageUrl = (url, fallback = '/asset/logo/logo.png') => {
    if (!url || url.trim() === '') {
        return getProxiedImageUrl(fallback);
    }

    // Use proxy for Cloudinary images
    return getProxiedImageUrl(url);
};
