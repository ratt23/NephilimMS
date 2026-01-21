import { Hono } from 'hono';

const router = new Hono();

// Mapped to /pdf-proxy in server/index.js

router.get('/', async (c) => {
    try {
        const pdfUrl = c.req.query('url');

        if (!pdfUrl) {
            return c.json({ message: 'PDF URL required' }, 400);
        }

        // Fetch PDF
        const response = await fetch(pdfUrl);

        if (!response.ok) {
            return c.json({ message: 'Failed to fetch PDF' }, response.status);
        }

        // Get PDF as buffer
        const arrayBuffer = await response.arrayBuffer();
        const pdfBuffer = Buffer.from(arrayBuffer);

        // Hono handles buffer response automatically via c.body() but explicit headers needed
        c.header('Content-Type', 'application/pdf');
        c.header('Content-Disposition', 'inline');

        return c.body(pdfBuffer);

    } catch (error) {
        console.error('PDF Proxy error:', error);
        return c.json({ message: 'Server error', error: error.message }, 500);
    }
});

export default router;
