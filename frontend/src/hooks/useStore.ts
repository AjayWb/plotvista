import { create } from 'zustand'
import { Plot, Layout, FilterState, PlotStatus, BookingInfo, Project, PlotDefinition } from '../types'
import { api, adminApi } from '../utils/api'

interface AppStore {
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Projects
  projects: Project[]
  currentProjectId: string | null
  
  // Layout & Plots
  layout: Layout
  
  // Authentication
  user: { isAdmin: boolean; token?: string } | null
  
  // Filters
  filters: FilterState
  setStatusFilter: (status: PlotStatus | 'all') => void
  setSearchQuery: (query: string) => void
  setMultipleBookingsFilter: (enabled: boolean) => void
  
  // API Integration
  initializeFromAPI: () => Promise<void>
  refreshData: () => Promise<void>
  selectProject: (projectId: string) => Promise<void>
  
  // Admin Actions (requires admin auth)
  login: (password: string) => Promise<boolean>
  createProject: (name: string) => Promise<void>
  createProjectWithLayout: (name: string, rows: number, cols: number, plotDefinitions: PlotDefinition[]) => Promise<void>
  updateProjectLayout: (rows: number, cols: number, plotDefinitions: PlotDefinition[]) => Promise<void>
  updatePlotStatus: (plotId: string, newStatus: PlotStatus, bookingInfo?: BookingInfo) => Promise<void>
  bookMultiplePlots: (plotIds: string[], bookingInfo: BookingInfo) => Promise<void>
  addBooking: (plotId: string, bookingInfo: BookingInfo) => Promise<void>
  removeBooking: (plotId: string, bookingIndex: number) => Promise<void>
  exportData: (projectId?: string) => Promise<any>
  
  // Computed
  getFilteredPlots: () => Plot[]
  getDashboardStats: () => {
    totalPlots: number
    available: number
    booked: number
    agreement: number
    registration: number
    percentageSold: number
  }
  
  // Phone validation
  validatePhoneNumber: (phone: string) => boolean
  checkPhoneExistsInProject: (phone: string) => { exists: boolean; plots: string[] }
}

// Initial empty state
const initialLayout: Layout = {
  id: '',
  name: 'No Project Selected',
  totalArea: '0 acres',
  totalPlots: 0,
  plots: [],
  createdAt: new Date(),
  updatedAt: new Date()
}

const initialFilters: FilterState = {
  status: 'all',
  searchQuery: '',
  multipleBookings: false
}

export const useStore = create<AppStore>((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,
  projects: [],
  currentProjectId: null,
  layout: initialLayout,
  filters: initialFilters,
  user: null,

  // Filter actions
  setStatusFilter: (status) => set(state => ({
    filters: { ...state.filters, status }
  })),

  setSearchQuery: (searchQuery) => set(state => ({
    filters: { ...state.filters, searchQuery }
  })),

  setMultipleBookingsFilter: (multipleBookings) => set(state => ({
    filters: { ...state.filters, multipleBookings }
  })),

  // API Integration
  initializeFromAPI: async () => {
    set({ isLoading: true, error: null })
    
    try {
      // Get all projects
      const projects = await api.getProjects()
      
      if (projects.length > 0) {
        // Select first project by default
        const firstProject = projects[0]
        const plots = await api.getPlots(firstProject.id)
        
        const layout: Layout = {
          id: firstProject.id,
          name: firstProject.name,
          totalArea: '5 acres', // TODO: Calculate from plot data
          totalPlots: plots.length,
          plots: plots.map((plot: any) => ({
            id: plot.id,
            plotNumber: plot.plot_number,
            dimension: plot.dimension,
            area: plot.area,
            status: plot.status,
            row: plot.row,
            col: plot.col,
            bookings: plot.bookings?.map((booking: any) => ({
              name: booking.customer_name,
              phone: booking.customer_phone,
              bookingDate: new Date(booking.created_at)
            })) || [],
            lastUpdated: new Date()
          })),
          createdAt: new Date(firstProject.createdAt || firstProject.created_at),
          updatedAt: new Date()
        }
        
        set({
          projects,
          currentProjectId: firstProject.id,
          layout,
          isLoading: false
        })
      } else {
        set({
          projects: [],
          currentProjectId: null,
          layout: initialLayout,
          isLoading: false
        })
      }
    } catch (error) {
      console.error('Failed to initialize from API:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false
      })
    }
  },

  refreshData: async () => {
    const { currentProjectId } = get()
    if (currentProjectId) {
      await get().selectProject(currentProjectId)
    }
  },

  selectProject: async (projectId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const project = get().projects.find(p => p.id === projectId)
      if (!project) {
        throw new Error('Project not found')
      }
      
      const plots = await api.getPlots(projectId)
      
      const layout: Layout = {
        id: project.id,
        name: project.name,
        totalArea: '5 acres', // TODO: Calculate from plot data
        totalPlots: plots.length,
        plots: plots.map((plot: any) => ({
          id: plot.id,
          plotNumber: plot.plot_number,
          dimension: plot.dimension,
          area: plot.area,
          status: plot.status,
          row: plot.row,
          col: plot.col,
          bookings: plot.bookings?.map((booking: any) => ({
            name: booking.customer_name,
            phone: booking.customer_phone,
            bookingDate: new Date(booking.created_at)
          })) || [],
          lastUpdated: new Date()
        })),
        createdAt: new Date(project.createdAt || project.created_at),
        updatedAt: new Date()
      }
      
      set({
        currentProjectId: projectId,
        layout,
        isLoading: false
      })
    } catch (error) {
      console.error('Failed to select project:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to load project',
        isLoading: false
      })
    }
  },

  // Authentication
  login: async (password: string) => {
    try {
      const response = await adminApi.login(password)
      set({ 
        user: { 
          isAdmin: true, 
          token: response.token 
        } 
      })
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  },

  // Admin actions
  createProject: async (name: string) => {
    try {
      const newProject = await adminApi.createProject(name)
      
      // Update projects list
      set(state => ({
        projects: [newProject, ...state.projects]
      }))
      
      // Select the new project
      await get().selectProject(newProject.id)
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  },

  createProjectWithLayout: async (name: string, rows: number, cols: number, plotDefinitions: PlotDefinition[]) => {
    try {
      const layoutTemplate = { rows, cols, plotDefinitions }
      const newProject = await adminApi.createProject(name, layoutTemplate)
      
      // Update projects list
      set(state => ({
        projects: [newProject, ...state.projects]
      }))
      
      // Select the new project
      await get().selectProject(newProject.id)
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  },

  updateProjectLayout: async (rows: number, cols: number, plotDefinitions: PlotDefinition[]) => {
    const { currentProjectId } = get()
    if (!currentProjectId) {
      throw new Error('No project selected')
    }
    
    try {
      await adminApi.updateProjectLayout(currentProjectId, plotDefinitions)
      
      // Refresh the current project data
      await get().selectProject(currentProjectId)
    } catch (error) {
      console.error('Failed to update layout:', error)
      throw error
    }
  },

  updatePlotStatus: async (plotId: string, newStatus: PlotStatus, bookingInfo?: BookingInfo) => {
    try {
      if (bookingInfo) {
        await adminApi.bookPlot(plotId, bookingInfo.name, bookingInfo.phone, newStatus)
      } else {
        await adminApi.updatePlotStatus(plotId, newStatus)
      }
      
      // Refresh data
      await get().refreshData()
    } catch (error) {
      console.error('Failed to update plot status:', error)
      throw error
    }
  },

  bookMultiplePlots: async (plotIds: string[], bookingInfo: BookingInfo) => {
    try {
      // Book each plot individually
      await Promise.all(
        plotIds.map(plotId => 
          adminApi.bookPlot(plotId, bookingInfo.name, bookingInfo.phone, 'booked')
        )
      )
      
      // Refresh data
      await get().refreshData()
    } catch (error) {
      console.error('Failed to book multiple plots:', error)
      throw error
    }
  },

  addBooking: async (plotId: string, bookingInfo: BookingInfo) => {
    try {
      await adminApi.bookPlot(plotId, bookingInfo.name, bookingInfo.phone, 'booked')
      
      // Refresh data
      await get().refreshData()
    } catch (error) {
      console.error('Failed to add booking:', error)
      throw error
    }
  },

  removeBooking: async (plotId: string, bookingIndex: number) => {
    try {
      // For now, we'll set the plot status back to available
      // In a more complex system, we might need a specific API for removing bookings
      await adminApi.updatePlotStatus(plotId, 'available')
      
      // Refresh data
      await get().refreshData()
    } catch (error) {
      console.error('Failed to remove booking:', error)
      throw error
    }
  },

  exportData: async (projectId?: string) => {
    try {
      return await adminApi.exportData(projectId)
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  },

  // Computed values
  getFilteredPlots: () => {
    const { layout, filters } = get()
    let filtered = layout.plots

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(plot => plot.status === filters.status)
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(plot => 
        plot.plotNumber.toLowerCase().includes(query)
      )
    }

    // Multiple bookings filter
    if (filters.multipleBookings) {
      filtered = filtered.filter(plot => 
        plot.status === 'booked' && plot.bookings && plot.bookings.length > 1
      )
    }

    return filtered
  },

  getDashboardStats: () => {
    const { layout } = get()
    const plots = layout.plots
    
    const available = plots.filter(p => p.status === 'available').length
    const booked = plots.filter(p => p.status === 'booked').length
    const agreement = plots.filter(p => p.status === 'agreement').length
    const registration = plots.filter(p => p.status === 'registration').length
    
    const totalSold = agreement + registration
    const percentageSold = plots.length > 0 ? (totalSold / plots.length) * 100 : 0

    return {
      totalPlots: plots.length,
      available,
      booked,
      agreement,
      registration,
      percentageSold
    }
  },

  // Phone validation
  validatePhoneNumber: (phone: string) => {
    // Basic phone validation - can be extended as needed
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone.trim())
  },

  // Simplified phone validation for API version
  checkPhoneExistsInProject: (phone: string) => {
    const { layout } = get()
    const existingPlots: string[] = []
    
    layout.plots.forEach(plot => {
      if (plot.bookings?.some(booking => booking.phone === phone)) {
        existingPlots.push(plot.plotNumber)
      }
    })
    
    return {
      exists: existingPlots.length > 0,
      plots: existingPlots
    }
  }
}))