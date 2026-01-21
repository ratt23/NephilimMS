export const getProxiedImageUrl = (url) => {
    if (!url || url === '/asset/logo/logo.png') return url;

    // Check if Cloudinary or External URL that might have CORS issues
    // For now, specific to Cloudinary as requested
    if (url.includes('cloudinary.com')) {
        // Use /.netlify/functions/imageProxy endpoint
        // Vite will proxy this to localhost:3000/imageProxy in dev
        // Netlify will route this to functions/imageProxy in prod
        return `/.netlify/functions/imageProxy?url=${encodeURIComponent(url)}`;
    }

    return url;
};
