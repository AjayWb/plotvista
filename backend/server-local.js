const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const { validateEnvironment } = require('./validate-env');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite database
const db = new sqlite3.Database('./plotvista.db');

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static('../frontend/dist'));

// Create tables if they don't exist
db.serialize(() => {
  // Projects table
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Plots table
  db.run(`
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
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      plot_id TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      booking_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(plot_id) REFERENCES plots(id)
    )
  `);

  // Insert sample project if no projects exist
  db.get("SELECT COUNT(*) as count FROM projects", (err, row) => {
    if (row.count === 0) {
      const projectId = uuidv4();
      db.run("INSERT INTO projects (id, name) VALUES (?, ?)", [projectId, "Ruby Sizzle Heritage"], (err) => {
        if (!err) {
          // Insert sample plots
          const plots = [
            { plotNumber: '1', dimension: '30x40', area: 1200, row: 0, col: 0, status: 'available' },
            { plotNumber: '2', dimension: '30x40', area: 1200, row: 0, col: 1, status: 'booked' },
            { plotNumber: '3', dimension: '30x50', area: 1500, row: 1, col: 0, status: 'available' },
            { plotNumber: '4', dimension: '40x40', area: 1600, row: 1, col: 1, status: 'agreement' }
          ];
          
          plots.forEach(plot => {
            db.run(
              "INSERT INTO plots (id, project_id, plot_number, dimension, area, row, col, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [uuidv4(), projectId, plot.plotNumber, plot.dimension, plot.area, plot.row, plot.col, plot.status]
            );
          });
        }
      });
    }
  });
});

// Simple admin session management
let adminSessions = new Map();

// Admin password from environment or default
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sizzle123';

// Helper to check admin auth
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  adminSessions.set(token, Date.now() + 24 * 60 * 60 * 1000);
  next();
};

// ===== PUBLIC ROUTES =====

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    const token = uuidv4();
    adminSessions.set(token, Date.now() + 24 * 60 * 60 * 1000);
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Get all projects
app.get('/api/projects', (req, res) => {
  db.all("SELECT * FROM projects ORDER BY created_at DESC", (err, projects) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(projects);
    }
  });
});

// Get plots for a project
app.get('/api/projects/:projectId/plots', (req, res) => {
  const query = `
    SELECT 
      p.*,
      json_group_array(
        CASE 
          WHEN b.id IS NOT NULL THEN 
            json_object(
              'customer_name', b.customer_name,
              'customer_phone', b.customer_phone,
              'created_at', b.created_at
            )
          ELSE NULL
        END
      ) as bookings
    FROM plots p
    LEFT JOIN bookings b ON p.id = b.plot_id
    WHERE p.project_id = ?
    GROUP BY p.id
    ORDER BY p.plot_number
  `;
  
  db.all(query, [req.params.projectId], (err, plots) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Parse bookings JSON
      plots = plots.map(plot => ({
        ...plot,
        bookings: JSON.parse(plot.bookings).filter(b => b !== null)
      }));
      res.json(plots);
    }
  });
});

// Get project statistics
app.get('/api/projects/:projectId/stats', (req, res) => {
  db.all(
    "SELECT status, COUNT(*) as count FROM plots WHERE project_id = ? GROUP BY status",
    [req.params.projectId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        const stats = {
          total: 0,
          available: 0,
          booked: 0,
          agreement: 0,
          registration: 0
        };
        
        rows.forEach(row => {
          stats[row.status] = row.count;
          stats.total += row.count;
        });
        
        res.json(stats);
      }
    }
  );
});

// ===== ADMIN ROUTES =====

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

// Create project
app.post('/api/admin/projects', requireAdmin, (req, res) => {
  const { name, layoutTemplate } = req.body;
  const projectId = uuidv4();
  
  db.run("INSERT INTO projects (id, name) VALUES (?, ?)", [projectId, name], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Create plots if layout template provided
      if (layoutTemplate?.plotDefinitions) {
        const stmt = db.prepare("INSERT INTO plots (id, project_id, plot_number, dimension, area, row, col, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        
        layoutTemplate.plotDefinitions.forEach(plot => {
          stmt.run(uuidv4(), projectId, plot.plotNumber, plot.dimension, plot.area, plot.row, plot.col, 'available');
        });
        
        stmt.finalize();
      }
      
      res.json({ id: projectId, name, created_at: new Date().toISOString() });
    }
  });
});

// Update project layout
app.put('/api/admin/projects/:projectId/layout', requireAdmin, (req, res) => {
  const { projectId } = req.params;
  const { plotDefinitions } = req.body;
  
  // Delete existing plots
  db.run("DELETE FROM plots WHERE project_id = ?", [projectId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Insert new plots
      const stmt = db.prepare("INSERT INTO plots (id, project_id, plot_number, dimension, area, row, col, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
      
      plotDefinitions.forEach(plot => {
        stmt.run(uuidv4(), projectId, plot.plotNumber, plot.dimension, plot.area, plot.row, plot.col, 'available');
      });
      
      stmt.finalize(() => {
        res.json({ success: true });
      });
    }
  });
});

// Book plot
app.post('/api/admin/plots/:plotId/book', requireAdmin, (req, res) => {
  const { plotId } = req.params;
  const { customerName, customerPhone, status } = req.body;
  const bookingId = uuidv4();
  
  // Create booking
  db.run(
    "INSERT INTO bookings (id, plot_id, customer_name, customer_phone, booking_type) VALUES (?, ?, ?, ?, ?)",
    [bookingId, plotId, customerName, customerPhone, status],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        // Update plot status
        db.run("UPDATE plots SET status = ? WHERE id = ?", [status, plotId], (err) => {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.json({ success: true });
          }
        });
      }
    }
  );
});

// Update plot status
app.put('/api/admin/plots/:plotId/status', requireAdmin, (req, res) => {
  const { plotId } = req.params;
  const { status } = req.body;
  
  db.run("UPDATE plots SET status = ? WHERE id = ?", [status, plotId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

// Export data
app.get('/api/admin/export', requireAdmin, (req, res) => {
  const { projectId } = req.query;
  
  let query = `
    SELECT 
      p.*,
      pr.name as project_name,
      json_group_array(
        CASE 
          WHEN b.id IS NOT NULL THEN 
            json_object(
              'customer_name', b.customer_name,
              'customer_phone', b.customer_phone,
              'booking_type', b.booking_type,
              'created_at', b.created_at
            )
          ELSE NULL
        END
      ) as bookings
    FROM plots p
    LEFT JOIN projects pr ON p.project_id = pr.id
    LEFT JOIN bookings b ON p.id = b.plot_id
  `;
  
  const params = [];
  if (projectId) {
    query += " WHERE p.project_id = ?";
    params.push(projectId);
  }
  
  query += " GROUP BY p.id";
  
  db.all(query, params, (err, data) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Parse bookings JSON
      data = data.map(plot => ({
        ...plot,
        bookings: JSON.parse(plot.bookings).filter(b => b !== null)
      }));
      res.json(data);
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'plotvista-backend' });
});

// Validate environment variables before starting
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

app.listen(PORT, () => {
  console.log(`
🚀 PlotVista Backend is running!
   
   Local URL: http://localhost:${PORT}
   Network URL: http://YOUR_IP_ADDRESS:${PORT}
   
   To find your IP address:
   Mac: System Settings → Network → WiFi → Details
   
   Admin Password: ${ADMIN_PASSWORD}
  `);
});