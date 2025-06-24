const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// PostgreSQL connection for Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Initialize PostgreSQL tables
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

    // Plots table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plots (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        plot_number TEXT NOT NULL,
        dimension TEXT,
        area INTEGER,
        row INTEGER,
        col INTEGER,
        status TEXT DEFAULT 'available',
        UNIQUE(project_id, plot_number),
        FOREIGN KEY(project_id) REFERENCES projects(id)
      )
    `);

    // Bookings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        plot_id TEXT,
        customer_name TEXT,
        customer_phone TEXT,
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        FOREIGN KEY(plot_id) REFERENCES plots(id)
      )
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

// Authentication
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sizzle123';

// Authentication middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PlotVista API is running' });
});

// Auth
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Projects
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/projects', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
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

app.delete('/api/projects/:id', requireAuth, async (req, res) => {
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
app.get('/api/projects/:projectId/plots', async (req, res) => {
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

app.post('/api/projects/:projectId/plots/bulk', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { plots } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete existing plots for this project
      await client.query('DELETE FROM plots WHERE project_id = $1', [projectId]);
      
      // Insert new plots
      for (const plot of plots) {
        const id = uuidv4();
        await client.query(`
          INSERT INTO plots (id, project_id, plot_number, dimension, area, row, col, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [id, projectId, plot.plotNumber, plot.dimension, plot.area, plot.row, plot.col, plot.status]);
      }
      
      await client.query('COMMIT');
      
      // Fetch and return updated plots
      const result = await client.query(`
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

// Bookings
app.post('/api/plots/:plotId/book', requireAuth, async (req, res) => {
  try {
    const { plotId } = req.params;
    const { customerName, customerPhone } = req.body;
    
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
        INSERT INTO bookings (id, plot_id, customer_name, customer_phone)
        VALUES ($1, $2, $3, $4)
      `, [bookingId, plotId, customerName, customerPhone]);
      
      // Update plot status
      await client.query('UPDATE plots SET status = $1 WHERE id = $2', ['booked', plotId]);
      
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

// Export data
app.get('/api/export/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const result = await pool.query(`
      SELECT p.plot_number, p.dimension, p.area, p.status,
             COALESCE(b.customer_name, '') as customer_name,
             COALESCE(b.customer_phone, '') as customer_phone,
             COALESCE(b.booking_date, '') as booking_date
      FROM plots p 
      LEFT JOIN bookings b ON p.id = b.plot_id AND b.status = 'active'
      WHERE p.project_id = $1 
      ORDER BY p.plot_number
    `, [projectId]);
    
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
  await initializeDatabase();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PlotVista Backend running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(console.error);