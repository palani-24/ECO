/**
 * High-Speed In-Memory Response Caching Middleware with Automatic TTL & LRU Eviction
 * Provides sub-millisecond response times (<1ms) for frequent read queries under heavy load.
 */

class FastMemoryCache {
  constructor(maxEntries = 1000) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU position
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.data;
  }

  set(key, data, ttlMs = 30000) {
    if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry (first item in Map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }

  clear(pattern) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  size() {
    return this.cache.size;
  }
}

export const memoryCache = new FastMemoryCache(1000);

/**
 * Cache middleware for Express GET routes
 * @param {number} ttlSeconds Time-to-live in seconds (default: 30)
 */
export const cacheResponse = (ttlSeconds = 30) => {
  const ttlMs = ttlSeconds * 1000;

  return (req, res, next) => {
    // Only cache safe GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Cache key based on route and query params (and user role if applicable)
    const userRole = req.user?.role || 'public';
    const cacheKey = `${req.originalUrl || req.url}:${userRole}`;

    const cachedData = memoryCache.get(cacheKey);
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Content-Type', 'application/json');
      return res.send(cachedData);
    }

    res.setHeader('X-Cache', 'MISS');

    // Intercept res.json to store into cache
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.set(cacheKey, JSON.stringify(data), ttlMs);
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Invalidate cache helper by pattern
 */
export const invalidateCache = (pattern) => {
  memoryCache.clear(pattern);
};

export default { cacheResponse, invalidateCache, memoryCache };
