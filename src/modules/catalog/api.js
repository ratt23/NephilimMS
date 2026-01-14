// API helper for newsletter endpoints
const API_BASE = '/.netlify/functions';

export const newsletterAPI = {
    // Get newsletter archive (paginated)
    async getArchive(page = 1, limit = 20, admin = false) {
        const params = new URLSearchParams({ page, limit, admin: admin.toString() });
        const response = await fetch(`${API_BASE}/newsletter-archive?${params}`);
        if (!response.ok) {
            const text = await response.text();
            try {
                const json = JSON.parse(text);
                throw new Error(json.message || 'Failed to fetch archive');
            } catch {
                throw new Error(text || 'Failed to fetch archive');
            }
        }
        return response.json();
    },

    // Get specific newsletter by year and month
    async getByYearMonth(year, month) {
        const params = new URLSearchParams({ year, month });
        const response = await fetch(`${API_BASE}/newsletter-issue?${params}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch newsletter');
        }
        return response.json();
    },

    // Get newsletter by ID
    async getById(id) {
        const params = new URLSearchParams({ id });
        const response = await fetch(`${API_BASE}/newsletter-issue?${params}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch newsletter');
        }
        return response.json();
    },

    // Create or update newsletter
    async upsert(data) {
        const response = await fetch(`${API_BASE}/newsletter-upsert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const text = await response.text();
            let errorMessage = 'Failed to save newsletter';
            try {
                const json = JSON.parse(text);
                errorMessage = json.message || errorMessage;
            } catch {
                errorMessage = text || errorMessage;
            }
            throw new Error(errorMessage);
        }
        return response.json();
    },

    // Toggle publish status
    async togglePublish(id) {
        const params = new URLSearchParams({ id });
        const response = await fetch(`${API_BASE}/newsletter-issue?${params}`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Failed to toggle publish status');
        return response.json();
    },

    // Delete newsletter
    async delete(id) {
        const params = new URLSearchParams({ id });
        const response = await fetch(`${API_BASE}/newsletter-issue?${params}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete newsletter');
        return response.json();
    }
};
