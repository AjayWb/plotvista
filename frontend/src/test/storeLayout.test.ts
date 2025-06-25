import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../hooks/useStore'
import { PlotDefinition } from '../types'

// Helper function to create mock booking
const createMockBooking = (name: string, phone: string) => ({
  name,
  phone,
  bookingDate: new Date('2024-01-01T10:00:00Z')
})

describe('Store Layout Management', () => {
  beforeEach(() => {
    // Reset store to initial state
    useStore.setState({
      user: { id: '1', name: 'Manager', role: 'manager' },
      isAuthenticated: true,
      projects: [],
      currentProjectId: null,
      layout: {
        id: 'test',
        name: 'Test',
        totalArea: '1 acre',
        totalPlots: 0,
        plots: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  })

  describe('createProjectWithLayout', () => {
    it('should create project with custom layout', () => {
      const { createProjectWithLayout, projects } = useStore.getState()
      
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: '2', dimension: '30×50', area: 1500, row: 0, col: 1 },
        { plotNumber: '3', dimension: 'Odd', area: 1000, row: 1, col: 0 }
      ]
      
      createProjectWithLayout('Custom Project', 2, 2, plotDefinitions)
      
      const updatedState = useStore.getState()
      
      // Check project was created
      expect(updatedState.projects).toHaveLength(1)
      const project = updatedState.projects[0]
      expect(project.name).toBe('Custom Project')
      expect(project.totalPlots).toBe(3)
      expect(project.layoutTemplate).toBeDefined()
      expect(project.layoutTemplate?.rows).toBe(2)
      expect(project.layoutTemplate?.columns).toBe(2)
      expect(project.layoutTemplate?.plotDefinitions).toEqual(plotDefinitions)
      
      // Check layout was created
      expect(updatedState.layout.name).toBe('Custom Project')
      expect(updatedState.layout.plots).toHaveLength(3)
      expect(updatedState.layout.plots[0].dimension).toBe('30×40')
      expect(updatedState.layout.plots[0].area).toBe(1200)
      expect(updatedState.layout.plots[0].status).toBe('available')
      
      // Check current project is set
      expect(updatedState.currentProjectId).toBe(project.id)
    })

    it('should calculate total area correctly', () => {
      const { createProjectWithLayout } = useStore.getState()
      
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: '2', dimension: '30×50', area: 1500, row: 0, col: 1 }
      ]
      
      createProjectWithLayout('Test Project', 1, 2, plotDefinitions)
      
      const { layout } = useStore.getState()
      const expectedAcres = (1200 + 1500) / 43560 // Convert sq ft to acres
      expect(layout.totalArea).toBe(`${Math.ceil(expectedAcres)} acres`)
    })

    it('should not create project if user is not manager', () => {
      useStore.setState({ user: { id: '1', name: 'Viewer', role: 'viewer' } })
      
      const { createProjectWithLayout } = useStore.getState()
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '30×40', area: 1200, row: 0, col: 0 }
      ]
      
      createProjectWithLayout('Test Project', 1, 1, plotDefinitions)
      
      const { projects } = useStore.getState()
      expect(projects).toHaveLength(0)
    })

    it('should not create project if user is not authenticated', () => {
      useStore.setState({ user: null })
      
      const { createProjectWithLayout } = useStore.getState()
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '30×40', area: 1200, row: 0, col: 0 }
      ]
      
      createProjectWithLayout('Test Project', 1, 1, plotDefinitions)
      
      const { projects } = useStore.getState()
      expect(projects).toHaveLength(0)
    })
  })

  describe('updateProjectLayout', () => {
    beforeEach(() => {
      // Create initial project with layout
      const { createProjectWithLayout } = useStore.getState()
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: '2', dimension: '30×50', area: 1500, row: 0, col: 1 }
      ]
      createProjectWithLayout('Test Project', 1, 2, plotDefinitions)
    })

    it('should update project layout template', () => {
      const { updateProjectLayout } = useStore.getState()
      
      const newPlotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '40×40', area: 1600, row: 0, col: 0 },
        { plotNumber: '2', dimension: '30×50', area: 1500, row: 0, col: 1 },
        { plotNumber: '3', dimension: 'Odd', area: 1000, row: 1, col: 0 }
      ]
      
      updateProjectLayout(2, 2, newPlotDefinitions)
      
      const { projects, layout } = useStore.getState()
      
      // Check project template was updated
      const project = projects[0]
      expect(project.totalPlots).toBe(3)
      expect(project.layoutTemplate?.rows).toBe(2)
      expect(project.layoutTemplate?.columns).toBe(2)
      expect(project.layoutTemplate?.plotDefinitions).toEqual(newPlotDefinitions)
      
      // Check layout was updated
      expect(layout.totalPlots).toBe(3)
      expect(layout.plots).toHaveLength(3)
      expect(layout.plots[0].dimension).toBe('40×40')
      expect(layout.plots[0].area).toBe(1600)
    })

    it('should preserve existing plot statuses and bookings', () => {
      const { updatePlotStatus, updateProjectLayout } = useStore.getState()
      
      // Book a plot first
      const booking = createMockBooking('John Doe', '1234567890')
      updatePlotStatus('plot-test-1', 'booked', booking)
      
      // Update layout
      const newPlotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '40×40', area: 1600, row: 0, col: 0 },
        { plotNumber: '2', dimension: '30×50', area: 1500, row: 0, col: 1 }
      ]
      
      updateProjectLayout(1, 2, newPlotDefinitions)
      
      const { layout } = useStore.getState()
      
      // Check that plot 1 still has its booking
      const plot1 = layout.plots.find(p => p.plotNumber === '1')
      expect(plot1?.status).toBe('booked')
      expect(plot1?.bookings).toHaveLength(1)
      expect(plot1?.bookings?.[0].name).toBe('John Doe')
      
      // But dimension should be updated
      expect(plot1?.dimension).toBe('40×40')
      expect(plot1?.area).toBe(1600)
    })

    it('should handle plots being removed from layout', () => {
      const { updateProjectLayout } = useStore.getState()
      
      // Remove one plot from layout
      const newPlotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '40×40', area: 1600, row: 0, col: 0 }
      ]
      
      updateProjectLayout(1, 1, newPlotDefinitions)
      
      const { layout } = useStore.getState()
      
      expect(layout.plots).toHaveLength(1)
      expect(layout.plots[0].plotNumber).toBe('1')
    })

    it('should not update if user is not manager', () => {
      useStore.setState({ isManager: false })
      
      const { updateProjectLayout, projects } = useStore.getState()
      const originalProject = projects[0]
      
      const newPlotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '40×40', area: 1600, row: 0, col: 0 }
      ]
      
      updateProjectLayout(1, 1, newPlotDefinitions)
      
      const { projects: updatedProjects } = useStore.getState()
      expect(updatedProjects[0]).toEqual(originalProject)
    })

    it('should not update if no current project', () => {
      useStore.setState({ currentProjectId: null })
      
      const { updateProjectLayout, projects } = useStore.getState()
      const originalProjects = [...projects]
      
      const newPlotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '40×40', area: 1600, row: 0, col: 0 }
      ]
      
      updateProjectLayout(1, 1, newPlotDefinitions)
      
      const { projects: updatedProjects } = useStore.getState()
      expect(updatedProjects).toEqual(originalProjects)
    })
  })

  describe('selectProject with custom layouts', () => {
    beforeEach(() => {
      // Create multiple projects
      const { createProjectWithLayout } = useStore.getState()
      
      // Simple project without custom layout will be created differently
      useStore.setState({
        projects: [
          ...useStore.getState().projects,
          {
            id: 'simple-project-id',
            name: 'Simple Project',
            totalPlots: 50,
            createdAt: new Date().toISOString()
          }
        ]
      })
      
      // Custom layout project
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: '2', dimension: 'Odd', area: 1000, row: 0, col: 1 }
      ]
      createProjectWithLayout('Custom Project', 1, 2, plotDefinitions)
    })

    it('should load custom layout when selecting project with template', () => {
      const { projects, selectProject } = useStore.getState()
      const customProject = projects.find(p => p.name === 'Custom Project')!
      
      selectProject(customProject.id)
      
      const { layout, currentProjectId } = useStore.getState()
      
      expect(currentProjectId).toBe(customProject.id)
      expect(layout.name).toBe('Custom Project')
      expect(layout.plots).toHaveLength(2)
      expect(layout.plots[0].dimension).toBe('30×40')
      expect(layout.plots[1].dimension).toBe('Odd')
    })

    it('should load default layout when selecting project without template', () => {
      const { projects, selectProject } = useStore.getState()
      const simpleProject = projects.find(p => p.name === 'Simple Project')!
      
      selectProject(simpleProject.id)
      
      const { layout, currentProjectId } = useStore.getState()
      
      expect(currentProjectId).toBe(simpleProject.id)
      expect(layout.name).toBe('Simple Project')
      expect(layout.totalPlots).toBe(50)
      expect(layout.plots).toHaveLength(50)
    })

    it('should not switch if project does not exist', () => {
      const { selectProject, currentProjectId: originalProjectId } = useStore.getState()
      
      selectProject('non-existent-id')
      
      const { currentProjectId } = useStore.getState()
      expect(currentProjectId).toBe(originalProjectId)
    })
  })

  describe('Integration with plot status management', () => {
    beforeEach(() => {
      // Create project with custom layout
      const { createProjectWithLayout } = useStore.getState()
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: '2', dimension: '30×50', area: 1500, row: 0, col: 1 }
      ]
      createProjectWithLayout('Test Project', 1, 2, plotDefinitions)
    })

    it('should maintain plot bookings when layout dimensions change', () => {
      const { updatePlotStatus, updateProjectLayout } = useStore.getState()
      
      // Book plot 1
      const booking = createMockBooking('John Doe', '1234567890')
      updatePlotStatus('plot-test-1', 'booked', booking)
      
      // Change plot 1 dimension
      const newPlotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '40×60', area: 2400, row: 0, col: 0 },
        { plotNumber: '2', dimension: '30×50', area: 1500, row: 0, col: 1 }
      ]
      
      updateProjectLayout(1, 2, newPlotDefinitions)
      
      const { layout } = useStore.getState()
      const plot1 = layout.plots.find(p => p.plotNumber === '1')
      
      // Should keep booking but update dimension
      expect(plot1?.status).toBe('booked')
      expect(plot1?.bookings).toHaveLength(1)
      expect(plot1?.dimension).toBe('40×60')
      expect(plot1?.area).toBe(2400)
    })

    it('should handle plot renumbering correctly', () => {
      const { updatePlotStatus, updateProjectLayout } = useStore.getState()
      
      // Book plot 2
      const booking = createMockBooking('Jane Doe', '9876543210')
      updatePlotStatus('plot-test-2', 'booked', booking)
      
      // Renumber plots
      const newPlotDefinitions: PlotDefinition[] = [
        { plotNumber: '100', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: '101', dimension: '30×50', area: 1500, row: 0, col: 1 }
      ]
      
      updateProjectLayout(1, 2, newPlotDefinitions)
      
      const { layout } = useStore.getState()
      
      // Original plot 2 booking should be lost (since it's now plot 101)
      const plot101 = layout.plots.find(p => p.plotNumber === '101')
      expect(plot101?.status).toBe('available')
      expect(plot101?.bookings).toBeUndefined()
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle empty plot definitions array', () => {
      const { createProjectWithLayout } = useStore.getState()
      
      createProjectWithLayout('Empty Project', 0, 0, [])
      
      const { projects, layout } = useStore.getState()
      
      expect(projects).toHaveLength(1)
      expect(projects[0].totalPlots).toBe(0)
      expect(layout.plots).toHaveLength(0)
      expect(layout.totalArea).toBe('0 acres')
    })

    it('should handle large plot numbers correctly', () => {
      const { createProjectWithLayout } = useStore.getState()
      
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: '9999', dimension: '30×40', area: 1200, row: 0, col: 0 }
      ]
      
      createProjectWithLayout('Large Numbers', 1, 1, plotDefinitions)
      
      const { layout } = useStore.getState()
      expect(layout.plots[0].plotNumber).toBe('9999')
    })

    it('should handle special characters in dimensions', () => {
      const { createProjectWithLayout } = useStore.getState()
      
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: 'Irregular-Shape', area: 1500, row: 0, col: 0 }
      ]
      
      createProjectWithLayout('Special Chars', 1, 1, plotDefinitions)
      
      const { layout } = useStore.getState()
      expect(layout.plots[0].dimension).toBe('Irregular-Shape')
    })

    it('should handle zero area plots', () => {
      const { createProjectWithLayout } = useStore.getState()
      
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: 'Future', area: 0, row: 0, col: 0 }
      ]
      
      createProjectWithLayout('Zero Area', 1, 1, plotDefinitions)
      
      const { layout } = useStore.getState()
      expect(layout.plots[0].area).toBe(0)
      expect(layout.totalArea).toBe('0 acres')
    })
  })
})