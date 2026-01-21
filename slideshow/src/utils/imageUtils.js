export const getProxiedImageUrl = (url) => {
    if (!url || url === '/asset/logo/logo.png') return url;

    // Check if Cloudinary or External URL that might have CORS issues
    if (url.includes('cloudinary.com')) {
        // Use /.netlify/functions/imageProxy endpoint
        return `/.netlify/functions/imageProxy?url=${encodeURIComponent(url)}`;
    }

    return url;
};
