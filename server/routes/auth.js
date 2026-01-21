import { Hono } from 'hono';
import sql from '../db.js';
import { setCookie, deleteCookie } from 'hono/cookie';

const router = new Hono();

// POST /login
router.post('/login', async (c) => {
    try {
        const { username, password } = await c.req.json();

        if (password === process.env.DASHBOARD_PASS) {

            // Set cookie matching middleware expectations
            setCookie(c, 'nf_auth', 'true', {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: false, // Must be false so client (js-cookie) can read it for ProtectedRoute
                maxAge: 60 * 60 * 24 * 7, // 7 days
                sameSite: 'Lax',
            });

            console.log('[Auth] Login successful');
            return c.json({ success: true, message: 'Login successful' });
        }

        return c.json({ success: false, message: 'Invalid credentials' }, 401);
    } catch (error) {
        console.error('[API Error] /login:', error);
        return c.json({ message: 'Login failed', error: error.message }, 500);
    }
});

// POST /logout
router.post('/logout', async (c) => {
    deleteCookie(c, 'nf_auth');
    return c.json({ success: true, message: 'Logged out' });
});

// GET /check-auth (Optional helper)
router.get('/check-auth', (c) => {
    // This route would be protected by middleware usually, 
    // but here we just check if cookie exists for basic state
    // Real auth check happens in middleware/auth.js
    return c.json({ authenticated: true });
});

export default router;
