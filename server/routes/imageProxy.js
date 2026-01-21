import { Hono } from 'hono';

const router = new Hono();

router.get('/', async (c) => {
    try {
        let imageUrl = c.req.query('url');
        console.log('[ImageProxy] Request for:', imageUrl);

        if (!imageUrl) {
            console.error('[ImageProxy] No URL provided');
            return c.json({ message: 'Image URL required' }, 400);
        }

        // Ensure Request is not double encoded or somehow raw
        // Hono usually decodes, but let's be safe if it looks encoded
        if (imageUrl.startsWith('http%3A') || imageUrl.startsWith('https%3A')) {
            imageUrl = decodeURIComponent(imageUrl);
        }

        // Fetch Image with headers to mimic browser
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Referer': 'http://localhost:3000/'
            }
        });

        if (!response.ok) {
            console.error(`[ImageProxy] Fetch failed: ${response.status} ${response.statusText}`);
            return c.json({ message: `Failed to fetch image: ${response.statusText}`, upstreamStatus: response.status }, response.status);
        }

        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`[ImageProxy] Success: ${contentType}, ${buffer.length} bytes`);

        c.header('Content-Type', contentType);
        c.header('Cache-Control', 'public, max-age=86400');
        c.header('Access-Control-Allow-Origin', '*');

        return c.body(buffer);

    } catch (error) {
        console.error('[ImageProxy] Server Error:', error);
        return c.json({
            message: 'Server error',
            error: error.message,
            stack: error.stack
        }, 500);
    }
});

export default router;
