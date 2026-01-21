import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import 'dotenv/config';

// Import routes
import doctorsRouter from './routes/doctors.js';
import leavesRouter from './routes/leaves.js';
import settingsRouter from './routes/settings.js';
import postsRouter from './routes/posts.js';
import mcuRouter from './routes/mcu.js';
import catalogRouter from './routes/catalog.js';
import promosRouter from './routes/promos.js';
import miscRouter from './routes/misc.js';
import authRouter from './routes/auth.js';

// Phase 3.6 - New Routers
import newsletterRouter from './routes/newsletter.js';
import devicesRouter from './routes/devices.js';
import analyticsRouter from './routes/analytics.js';
import proxyRouter from './routes/proxy.js';
import imageProxyRouter from './routes/imageProxy.js';

const app = new Hono();

// CORS Middleware - White-label support
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:5173',  // jadwaldokter (legacy)
        'http://localhost:3001',  // Dashboard UI
        'http://localhost:3002',  // eNewsletter
        'http://localhost:3003',  // eCatalog
        'http://localhost:5174',   // slideshow TV (legacy)
        'http://localhost:3004',  // jadwaldokter (new)
        'http://localhost:3005'   // slideshow (new)
    ];

app.use('/*', cors({
    origin: (origin) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return '*';

        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            return origin;
        }

        // Check if origin matches wildcard patterns (for production domains)
        if (origin.includes('.netlify.app') || origin.includes('your-domain.com')) {
            return origin;
        }

        return allowedOrigins[0]; // Fallback
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-onesignal-app-id', 'x-onesignal-api-key'],
}));

// Logger
app.use('/*', logger());

// Health check
app.get('/', (c) => c.json({ status: 'ok', message: 'Hono API Server Running' }));

// Mount routers
app.route('/', authRouter);
app.route('/doctors', doctorsRouter);
app.route('/leaves', leavesRouter);
app.route('/settings', settingsRouter);
app.route('/posts', postsRouter);
app.route('/mcu-packages', mcuRouter);
app.route('/catalog-items', catalogRouter);
app.route('/catalog', catalogRouter); // For /catalog/reorder
app.route('/promos', promosRouter);
app.route('/', miscRouter); // popup-ad, specialties, sstv_images

// Phase 3.6 Mounts
app.route('/', newsletterRouter); // /newsletter-archive, etc
app.route('/device-heartbeat', devicesRouter);
app.route('/analytics', analyticsRouter);
app.route('/pdf-proxy', proxyRouter);
app.route('/imageProxy', imageProxyRouter);

const port = process.env.PORT || 3000;

console.log(`🚀 Hono API Server running on http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port
});
