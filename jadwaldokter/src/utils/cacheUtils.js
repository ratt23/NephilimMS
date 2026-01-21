/**
 * Cache Utility for Client-Side Caching with TTL
 * Reduces API calls by storing data in localStorage with expiration
 */

class CacheManager {
    /**
     * Get cached data if valid and not expired
     * @param {string} key - Cache key
     * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
     * @returns {any|null} Cached data or null if expired/not found
     */
    get(key, ttl = 5 * 60 * 1000) {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);

            // Check if cache is still valid
            if (Date.now() - timestamp < ttl) {
                return data;
            }

            // Cache expired, remove it
            this.invalidate(key);
            return null;
        } catch (error) {
            console.error(`Cache get error for key "${key}":`, error);
            return null;
        }
    }

    /**
     * Set cache data with current timestamp
     * @param {string} key - Cache key
     * @param {any} data - Data to cache (must be JSON serializable)
     */
    set(key, data) {
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
        } catch (error) {
            console.error(`Cache set error for key "${key}":`, error);
            // Handle quota exceeded or other errors gracefully
            if (error.name === 'QuotaExceededError') {
                console.warn('LocalStorage quota exceeded, clearing old cache');
                this.clear();
                // Try again after clearing
                try {
                    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
                } catch (retryError) {
                    console.error('Failed to cache even after clearing:', retryError);
                }
            }
        }
    }

    /**
     * Invalidate specific cache key
     * @param {string} key - Cache key to invalidate
     */
    invalidate(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Cache invalidate error for key "${key}":`, error);
        }
    }

    /**
     * Clear all cache (use with caution)
     */
    clear() {
        try {
            // Clear only cache keys (those starting with 'cache_')
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('cache_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Cache clear error:', error);
        }
    }

    /**
     * Fetch with cache - wrapper for fetch with automatic caching
     * @param {string} cacheKey - Key to use for cache
     * @param {string} url - URL to fetch
     * @param {number} ttl - Cache TTL in milliseconds
     * @param {RequestInit} options - Fetch options (optional)
     * @returns {Promise<any>} Fetched or cached data
     */
    async fetchWithCache(cacheKey, url, ttl = 5 * 60 * 1000, options = {}) {
        // Try to get from cache first
        const cached = this.get(cacheKey, ttl);
        if (cached !== null) {
            console.log(`✅ Cache HIT for "${cacheKey}"`);
            return cached;
        }

        console.log(`❌ Cache MISS for "${cacheKey}", fetching...`);

        // Fetch from API
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Store in cache
            this.set(cacheKey, data);

            return data;
        } catch (error) {
            console.error(`Fetch error for "${cacheKey}":`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Export cache key constants for consistency
export const CACHE_KEYS = {
    SETTINGS: 'cache_settings',
    DOCTORS: 'cache_doctors',
    LEAVE_DATA: 'cache_leave_data',
    PROMO_IMAGES: 'cache_promo_images',
    POPUP_AD: 'cache_popup_ad',
    POSTS: 'cache_posts'
};

// Export TTL constants (in milliseconds)
export const CACHE_TTL = {
    SHORT: 2 * 60 * 1000,      // 2 minutes
    MEDIUM: 5 * 60 * 1000,     // 5 minutes
    LONG: 10 * 60 * 1000,      // 10 minutes
    VERY_LONG: 30 * 60 * 1000  // 30 minutes
};
