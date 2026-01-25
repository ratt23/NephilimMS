import { getApiBaseUrl } from '../../utils/apiConfig';

const getApiBase = () => getApiBaseUrl();

export const catalogAPI = {
    // Get public items (for filter)
    async getItems(category) {
        const query = category ? `?category=${category}` : '';
        const response = await fetch(`${getApiBase()}/catalog-items${query}`);
        if (!response.ok) throw new Error('Failed to fetch catalog');
        return response.json();
    },

    // Get ALL items (admin)
    async getAllItems(category) {
        const query = category ? `?category=${category}` : '';
        const response = await fetch(`${getApiBase()}/catalog-items${query}`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch catalog (admin)');
        return response.json();
    },

    // Get item by ID (helper, client-side finding often used but let's add one)
    async getById(id) {
        // We retrieve all and find, or we could add backend endpoint. 
        // For now, reuse allItems and find filtering client side or implementing /:id locally?
        // Let's assume we fetch all and find, as per CatalogForm logic.
        // Or better, GET /catalog-items?id=... (not implemented in backend yet).
        // Let's just fetch all for now or rely on List passing data.
        // CatalogForm currently fetches LIST and finds.
        const items = await this.getAllItems();
        return items.find(i => i.id === id);
    },

    // Upsert (Create/Update based on ID presence in payload or ID arg)
    // CatalogForm logic sends POST to upsert endpoint usually.
    // Our refactored backend uses POST / (create) and PUT / (update with query id)
    async create(data) {
        const response = await fetch(`${getApiBase()}/catalog-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to create item');
        return response.json();
    },

    async update(id, data) {
        const response = await fetch(`${getApiBase()}/catalog-items?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to update item');
        return response.json();
    },

    async delete(id) {
        const response = await fetch(`${getApiBase()}/catalog-items?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to delete item');
        return response.json();
    }
};
