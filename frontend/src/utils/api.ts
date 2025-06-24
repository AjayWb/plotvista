const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ===== PUBLIC API (No Auth Required) =====

export const api = {
  // Get all projects
  getProjects: async () => {
    const response = await fetch(`${API_URL}/api/projects`);
    return handleResponse(response);
  },

  // Get plots for a project
  getPlots: async (projectId: string) => {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/plots`);
    return handleResponse(response);
  },

  // Get project statistics
  getStats: async (projectId: string) => {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/stats`);
    return handleResponse(response);
  }
};

// ===== ADMIN API (Auth Required) =====

export const adminApi = {
  // Admin login
  login: async (password: string) => {
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('admin_token', data.token);
    }
    return data;
  },

  // Admin logout
  logout: async () => {
    try {
      await fetch(`${API_URL}/api/admin/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } finally {
      localStorage.removeItem('admin_token');
    }
  },

  // Check if admin token is valid
  checkAuth: () => {
    return !!localStorage.getItem('admin_token');
  },

  // Create project
  createProject: async (name: string, layoutTemplate?: any) => {
    const response = await fetch(`${API_URL}/api/admin/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, layoutTemplate })
    });
    return handleResponse(response);
  },

  // Update project layout
  updateProjectLayout: async (projectId: string, plotDefinitions: any[]) => {
    const response = await fetch(`${API_URL}/api/admin/projects/${projectId}/layout`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ plotDefinitions })
    });
    return handleResponse(response);
  },

  // Book plot
  bookPlot: async (plotId: string, customerName: string, customerPhone: string, status: string) => {
    const response = await fetch(`${API_URL}/api/admin/plots/${plotId}/book`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ customerName, customerPhone, status })
    });
    return handleResponse(response);
  },

  // Update plot status
  updatePlotStatus: async (plotId: string, status: string) => {
    const response = await fetch(`${API_URL}/api/admin/plots/${plotId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  // Delete project
  deleteProject: async (projectId: string) => {
    const response = await fetch(`${API_URL}/api/admin/projects/${projectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Export data
  exportData: async (projectId?: string) => {
    const url = projectId 
      ? `${API_URL}/api/admin/export?projectId=${projectId}`
      : `${API_URL}/api/admin/export`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};