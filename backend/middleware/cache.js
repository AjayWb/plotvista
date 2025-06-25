// Simple in-memory cache for Railway optimization
class SimpleCache {
  constructor(defaultTTL = 300) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL * 1000; // Convert to milliseconds
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
    
    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance on each set
      this.cleanup();
    }
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  size() {
    return this.cache.size;
  }
}

// Create cache instances
const dataCache = new SimpleCache(300); // 5 minutes for data
const statsCache = new SimpleCache(60);  // 1 minute for stats

// Cache middleware factory
function cacheMiddleware(cacheName, ttl) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cache = cacheName === 'stats' ? statsCache : dataCache;
    const key = `${req.originalUrl || req.url}`;
    
    // Try to get from cache
    const cached = cache.get(key);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Store original json method
    const originalJson = res.json;
    
    // Override json method to cache the response
    res.json = function(data) {
      // Cache successful responses only
      if (res.statusCode === 200) {
        cache.set(key, data, ttl);
        res.set('X-Cache', 'MISS');
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
}

module.exports = {
  dataCache,
  statsCache,
  cacheMiddleware
};