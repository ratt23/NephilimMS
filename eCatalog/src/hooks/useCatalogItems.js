// Custom hook to fetch catalog items from Dashboard
import { useState, useEffect } from 'react';

import { getApiBaseUrl } from '../utils/apiConfig';

export function useCatalogItems(category) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!category) {
            setItems([]);
            setLoading(false);
            return;
        }

        async function fetchItems() {
            try {
                setLoading(true);
                setError(null);

                const apiBase = getApiBaseUrl();
                const response = await fetch(`${apiBase}/catalog-items?category=${category}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch catalog items for ${category}`);
                }

                const data = await response.json();

                // Parse features if they are JSON strings
                const parsedData = data.map(item => ({
                    ...item,
                    features: typeof item.features === 'string' ? JSON.parse(item.features) : (item.features || [])
                }));

                setItems(parsedData);
            } catch (err) {
                console.error(`Error fetching catalog items for ${category}:`, err);
                setError(err.message);
                setItems([]);
            } finally {
                setLoading(false);
            }
        }

        fetchItems();
    }, [category]);

    return { items, loading, error };
}
