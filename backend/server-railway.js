const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { validateEnvironment } = require('./validate-env');
const { cacheMiddleware, dataCache } = require('./middleware/cache');
const { costMonitor, requestTrackingMiddleware } = require('./utils/cost-monitor');

const app = express();
const PORT = process.env.PORT || 4001;

// PostgreSQL connection for Railway with optimized settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pool optimization for Railway
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Close and replace a connection after it has been used 7500 times
});

// Railway health check - must be before other middleware
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'plotvista-backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Readiness probe for Railway
app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ready', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', database: 'disconnected' });
  }
});

// Cost monitoring endpoint will be defined after requireAdmin function

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow embedding
  contentSecurityPolicy: false, // We'll set CSP separately if needed
}));

// Compression middleware - compress all responses
app.use(compression({
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  },
  level: 6, // Compression level (0-9)
}));

// Rate limiting - prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit requests per IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Track all requests for cost monitoring
app.use(requestTrackingMiddleware);

// Stricter rate limit for admin routes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 requests per 15 minutes for admin routes
  skipSuccessfulRequests: true, // Don't count successful requests
});

app.use('/api/admin/', adminLimiter);

// CORS middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5001',
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize PostgreSQL tables with optimizations
async function initializeDatabase() {
  try {
    // Projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Plots table with optimized indexes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plots (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        plot_number TEXT NOT NULL,
        dimension TEXT,
        area INTEGER,
        row INTEGER,
        col INTEGER,
        status TEXT DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, plot_number),
        FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // Bookings table with optimized indexes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        plot_id TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        booking_type TEXT DEFAULT 'booking',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(plot_id) REFERENCES plots(id) ON DELETE CASCADE
      )
    `);

    // Create performance indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_plots_project_id ON plots(project_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_plots_status ON plots(status)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_plots_project_status ON plots(project_id, status)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_plot_id ON bookings(plot_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(customer_phone)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)
    `);

    // Add updated_at trigger for plots
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_plots_updated_at ON plots
    `);

    await pool.query(`
      CREATE TRIGGER update_plots_updated_at
        BEFORE UPDATE ON plots
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('✅ Database tables and indexes initialized');
    console.log('✅ Performance optimizations applied');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Authentication
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sizzle123';


// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PlotVista API is running' });
});

// Simple admin session management
let adminSessions = new Map();

// Helper to check admin auth
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  adminSessions.set(token, Date.now() + 24 * 60 * 60 * 1000);
  next();
};

// Cost monitoring endpoint for admins
app.get('/api/admin/metrics', requireAdmin, (req, res) => {
  const metrics = costMonitor.getMetrics();
  const costEstimate = costMonitor.estimateMonthlyCost();
  
  res.json({
    performance: metrics,
    cost: costEstimate,
    recommendations: {
      cacheOptimization: metrics.cacheHitRatio < 70 ? 'Consider increasing cache TTL' : 'Cache performing well',
      queryOptimization: metrics.dbQueriesPerRequest > 5 ? 'High DB queries per request - consider optimization' : 'DB queries optimized',
      costAlert: costEstimate.estimatedCost !== '$0' ? 'Monitor usage to stay within free tier' : 'Within free tier limits'
    }
  });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  
  const token = uuidv4();
  adminSessions.set(token, Date.now() + 24 * 60 * 60 * 1000);
  
  res.json({ token });
});

// Admin logout
app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  adminSessions.delete(token);
  res.json({ success: true });
});

// Projects
app.get('/api/projects', cacheMiddleware('data', 300000), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    // Cache for 5 minutes in production
    if (process.env.NODE_ENV === 'production') {
      res.set('Cache-Control', 'public, max-age=300');
    }
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/projects', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    
    // Clear cache when creating new projects
    dataCache.clear();
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO projects (id, name) VALUES ($1, $2)',
      [id, name]
    );
    
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/projects/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete bookings first
    await pool.query('DELETE FROM bookings WHERE plot_id IN (SELECT id FROM plots WHERE project_id = $1)', [id]);
    // Delete plots
    await pool.query('DELETE FROM plots WHERE project_id = $1', [id]);
    // Delete project
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Plots
app.get('/api/projects/:projectId/plots', cacheMiddleware('data', 180000), async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(`
      SELECT p.*, 
             COALESCE(b.customer_name, '') as customer_name,
             COALESCE(b.customer_phone, '') as customer_phone,
             COALESCE(b.booking_date, '') as booking_date
      FROM plots p 
      LEFT JOIN bookings b ON p.id = b.plot_id AND b.status = 'active'
      WHERE p.project_id = $1 
      ORDER BY p.row, p.col
    `, [projectId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching plots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/projects/:projectId/layout', requireAdmin, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { plotDefinitions } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete existing plots for this project
      await client.query('DELETE FROM plots WHERE project_id = $1', [projectId]);
      
      // Insert new plots
      for (const plot of plotDefinitions) {
        const id = uuidv4();
        await client.query(`
          INSERT INTO plots (id, project_id, plot_number, dimension, area, row, col, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [id, projectId, plot.plotNumber, plot.dimension, plot.area, plot.row, plot.col, 'available']);
      }
      
      await client.query('COMMIT');
      
      res.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error bulk updating plots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project statistics
app.get('/api/projects/:projectId/stats', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      'SELECT status, COUNT(*) as count FROM plots WHERE project_id = $1 GROUP BY status',
      [projectId]
    );
    
    const stats = {
      total: 0,
      available: 0,
      booked: 0,
      agreement: 0,
      registration: 0
    };
    
    result.rows.forEach(row => {
      stats[row.status] = parseInt(row.count);
      stats.total += parseInt(row.count);
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bookings
app.post('/api/admin/plots/:plotId/book', requireAdmin, async (req, res) => {
  try {
    const { plotId } = req.params;
    const { customerName, customerPhone, status } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if plot exists and is available
      const plotResult = await client.query('SELECT * FROM plots WHERE id = $1', [plotId]);
      if (plotResult.rows.length === 0) {
        throw new Error('Plot not found');
      }
      
      const plot = plotResult.rows[0];
      if (plot.status !== 'available') {
        throw new Error('Plot is not available');
      }
      
      // Create booking
      const bookingId = uuidv4();
      await client.query(`
        INSERT INTO bookings (id, plot_id, customer_name, customer_phone, status)
        VALUES ($1, $2, $3, $4, $5)
      `, [bookingId, plotId, customerName, customerPhone, 'active']);
      
      // Update plot status
      await client.query('UPDATE plots SET status = $1 WHERE id = $2', [status, plotId]);
      
      await client.query('COMMIT');
      
      res.json({ success: true, bookingId });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error booking plot:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update plot status
app.put('/api/admin/plots/:plotId/status', requireAdmin, async (req, res) => {
  try {
    const { plotId } = req.params;
    const { status } = req.body;
    
    await pool.query('UPDATE plots SET status = $1 WHERE id = $2', [status, plotId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating plot status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export data
app.get('/api/admin/export', requireAdmin, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    let query = `
      SELECT 
        p.*,
        pr.name as project_name,
        COALESCE(
          json_agg(
            CASE 
              WHEN b.id IS NOT NULL THEN 
                json_build_object(
                  'customer_name', b.customer_name,
                  'customer_phone', b.customer_phone,
                  'booking_type', b.status,
                  'created_at', b.booking_date
                )
              ELSE NULL
            END
          ) FILTER (WHERE b.id IS NOT NULL), 
          '[]'::json
        ) as bookings
      FROM plots p
      LEFT JOIN projects pr ON p.project_id = pr.id
      LEFT JOIN bookings b ON p.id = b.plot_id AND b.status = 'active'
    `;
    
    const params = [];
    if (projectId) {
      query += " WHERE p.project_id = $1";
      params.push(projectId);
    }
    
    query += " GROUP BY p.id, pr.name ORDER BY p.plot_number";
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Phone validation across projects
app.get('/api/validate-phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    const result = await pool.query(`
      SELECT p.plot_number, pr.name as project_name, b.customer_name
      FROM bookings b
      JOIN plots p ON b.plot_id = p.id
      JOIN projects pr ON p.project_id = pr.id
      WHERE b.customer_phone = $1 AND b.status = 'active'
    `, [phone]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error validating phone:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
async function startServer() {
  // Validate environment variables
  const { missing, warnings, isValid } = validateEnvironment();
  
  if (!isValid) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please set these variables in your .env file or environment');
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
    console.warn('');
  }
  
  await initializeDatabase();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PlotVista Backend running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 CORS origin: ${process.env.FRONTEND_URL || '*'}`);
  });
}

startServer().catch(console.error);