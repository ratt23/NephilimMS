import { getCookie } from 'hono/cookie';

export const requireAuth = async (c, next) => {
    const authCookie = getCookie(c, 'nf_auth');

    if (authCookie !== 'true') {
        return c.json({ message: 'Akses ditolak. Silakan login.' }, 401);
    }

    await next();
};
