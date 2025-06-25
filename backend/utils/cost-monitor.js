// Cost monitoring utility for Railway optimization
class CostMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      dbQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      startTime: Date.now()
    };
  }

  incrementRequests() {
    this.metrics.requests++;
  }

  incrementDbQueries() {
    this.metrics.dbQueries++;
  }

  incrementCacheHits() {
    this.metrics.cacheHits++;
  }

  incrementCacheMisses() {
    this.metrics.cacheMisses++;
  }

  getMetrics() {
    const uptime = Date.now() - this.metrics.startTime;
    const cacheHitRatio = this.metrics.cacheMisses > 0 
      ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100).toFixed(2)
      : 0;

    return {
      ...this.metrics,
      uptime: Math.floor(uptime / 1000), // seconds
      cacheHitRatio: `${cacheHitRatio}%`,
      requestsPerSecond: (this.metrics.requests / (uptime / 1000)).toFixed(2),
      dbQueriesPerRequest: this.metrics.requests > 0 
        ? (this.metrics.dbQueries / this.metrics.requests).toFixed(2)
        : 0
    };
  }

  reset() {
    this.metrics = {
      requests: 0,
      dbQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      startTime: Date.now()
    };
  }

  // Railway cost estimation (approximate)
  estimateMonthlyCost() {
    const metrics = this.getMetrics();
    const hoursPerMonth = 24 * 30;
    const currentHourlyRequests = metrics.requestsPerSecond * 3600;
    const monthlyRequests = currentHourlyRequests * hoursPerMonth;
    
    // Railway pricing tiers (approximate)
    let estimatedCost = 0;
    
    if (monthlyRequests < 50000) {
      estimatedCost = 0; // Free tier
    } else if (monthlyRequests < 500000) {
      estimatedCost = 5; // Hobby plan
    } else {
      estimatedCost = 20; // Pro plan base
    }

    return {
      monthlyRequests: Math.floor(monthlyRequests),
      estimatedCost: `$${estimatedCost}`,
      tier: estimatedCost === 0 ? 'Free' : estimatedCost === 5 ? 'Hobby' : 'Pro'
    };
  }
}

// Global cost monitor instance
const costMonitor = new CostMonitor();

// Middleware to track requests
function requestTrackingMiddleware(req, res, next) {
  costMonitor.incrementRequests();
  next();
}

module.exports = {
  costMonitor,
  requestTrackingMiddleware
};