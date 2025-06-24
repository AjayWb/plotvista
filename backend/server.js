const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory session management
let adminSessions = new Map();

// Helper to check admin auth
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Refresh session timeout
  adminSessions.set(token, Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  next();
};

// Clean up expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of adminSessions.entries()) {
    if (expiry < now) {
      adminSessions.delete(token);
    }
  }
}, 60 * 60 * 1000); // Every hour

// ===== PUBLIC ROUTES (No Auth Required) =====

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get plots for a project
app.get('/api/projects/:projectId/plots', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('plots')
      .select(`
        *,
        bookings (*)
      `)
      .eq('project_id', req.params.projectId)
      .order('plot_number');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project statistics
app.get('/api/projects/:projectId/stats', async (req, res) => {
  try {
    const { data: plots, error } = await supabase
      .from('plots')
      .select('status')
      .eq('project_id', req.params.projectId);
    
    if (error) throw error;
    
    const stats = {
      total: plots.length,
      available: plots.filter(p => p.status === 'available').length,
      booked: plots.filter(p => p.status === 'booked').length,
      agreement: plots.filter(p => p.status === 'agreement').length,
      registration: plots.filter(p => p.status === 'registration').length
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ADMIN ROUTES (Auth Required) =====

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  
  const token = uuidv4();
  adminSessions.set(token, Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  res.json({ token });
});

// Admin logout
app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  adminSessions.delete(token);
  res.json({ success: true });
});

// Create project
app.post('/api/admin/projects', requireAdmin, async (req, res) => {
  try {
    const { name, layoutTemplate } = req.body;
    
    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([{
        id: uuidv4(),
        name,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (projectError) throw projectError;
    
    // Create plots if layout template provided
    if (layoutTemplate?.plotDefinitions) {
      const plots = layoutTemplate.plotDefinitions.map(plot => ({
        id: uuidv4(),
        project_id: project.id,
        plot_number: plot.plotNumber,
        dimension: plot.dimension,
        area: plot.area,
        row: plot.row,
        col: plot.col,
        status: 'available'
      }));
      
      const { error: plotsError } = await supabase
        .from('plots')
        .insert(plots);
      
      if (plotsError) throw plotsError;
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project layout
app.put('/api/admin/projects/:projectId/layout', requireAdmin, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { plotDefinitions } = req.body;
    
    // Delete existing plots
    await supabase
      .from('plots')
      .delete()
      .eq('project_id', projectId);
    
    // Insert new plots
    const plots = plotDefinitions.map(plot => ({
      id: uuidv4(),
      project_id: projectId,
      plot_number: plot.plotNumber,
      dimension: plot.dimension,
      area: plot.area,
      row: plot.row,
      col: plot.col,
      status: 'available'
    }));
    
    const { error } = await supabase
      .from('plots')
      .insert(plots);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book plot
app.post('/api/admin/plots/:plotId/book', requireAdmin, async (req, res) => {
  try {
    const { plotId } = req.params;
    const { customerName, customerPhone, status } = req.body;
    
    // Create booking
    const { error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        id: uuidv4(),
        plot_id: plotId,
        customer_name: customerName,
        customer_phone: customerPhone,
        booking_type: status,
        created_at: new Date().toISOString()
      }]);
    
    if (bookingError) throw bookingError;
    
    // Update plot status
    const { error: plotError } = await supabase
      .from('plots')
      .update({ status })
      .eq('id', plotId);
    
    if (plotError) throw plotError;
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update plot status
app.put('/api/admin/plots/:plotId/status', requireAdmin, async (req, res) => {
  try {
    const { plotId } = req.params;
    const { status } = req.body;
    
    const { error } = await supabase
      .from('plots')
      .update({ status })
      .eq('id', plotId);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
app.delete('/api/admin/projects/:projectId', requireAdmin, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Delete bookings first (due to foreign key)
    await supabase
      .from('bookings')
      .delete()
      .in('plot_id', supabase
        .from('plots')
        .select('id')
        .eq('project_id', projectId)
      );
    
    // Delete plots
    await supabase
      .from('plots')
      .delete()
      .eq('project_id', projectId);
    
    // Delete project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export data
app.get('/api/admin/export', requireAdmin, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    let query = supabase
      .from('plots')
      .select(`
        *,
        bookings (*),
        project:projects (name)
      `);
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});