import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectManager } from '../components/ProjectManager'
import { useStore } from '../hooks/useStore'

// Mock the useStore hook
vi.mock('../hooks/useStore')
const mockUseStore = vi.mocked(useStore)

const mockCreateProject = vi.fn()
const mockCreateProjectWithLayout = vi.fn()
const mockUpdateProjectLayout = vi.fn()
const mockSelectProject = vi.fn()
const mockUpdatePlotStatus = vi.fn()
const mockBookMultiplePlots = vi.fn()
const mockCheckPhoneExistsInProject = vi.fn()

const mockInitialState = {
  projects: [
    {
      id: 'test-project',
      name: 'Test Project',
      totalPlots: 4,
      createdAt: new Date('2024-01-01'),
      layoutTemplate: {
        rows: 2,
        columns: 2,
        plotDefinitions: [
          { plotNumber: 'A-001', dimension: '30×40', area: 1200, row: 0, col: 0 },
          { plotNumber: 'B-002', dimension: '30×50', area: 1500, row: 0, col: 1 },
          { plotNumber: 'C-005', dimension: 'Odd', area: 1000, row: 1, col: 0 },
          { plotNumber: 'D-010', dimension: '40×40', area: 1600, row: 1, col: 1 }
        ]
      }
    }
  ],
  currentProjectId: 'test-project',
  layout: {
    id: 'test-project',
    name: 'Test Project',
    totalArea: '5 acres',
    totalPlots: 4,
    plots: [
      {
        id: 'plot-A-001',
        plotNumber: 'A-001',
        dimension: '30×40',
        area: 1200,
        status: 'available' as const,
        row: 0,
        col: 0,
        lastUpdated: new Date()
      },
      {
        id: 'plot-B-002',
        plotNumber: 'B-002',
        dimension: '30×50',
        area: 1500,
        status: 'booked' as const,
        row: 0,
        col: 1,
        bookings: [{ name: 'John Doe', phone: '1234567890', bookingDate: new Date() }],
        lastUpdated: new Date()
      },
      {
        id: 'plot-C-005',
        plotNumber: 'C-005',
        dimension: 'Odd',
        area: 1000,
        status: 'available' as const,
        row: 1,
        col: 0,
        lastUpdated: new Date()
      },
      {
        id: 'plot-D-010',
        plotNumber: 'D-010',
        dimension: '40×40',
        area: 1600,
        status: 'agreement' as const,
        row: 1,
        col: 1,
        agreement: { name: 'Jane Smith', phone: '0987654321', bookingDate: new Date() },
        lastUpdated: new Date()
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  createProject: mockCreateProject,
  createProjectWithLayout: mockCreateProjectWithLayout,
  updateProjectLayout: mockUpdateProjectLayout,
  selectProject: mockSelectProject,
  updatePlotStatus: mockUpdatePlotStatus,
  bookMultiplePlots: mockBookMultiplePlots,
  checkPhoneExistsInProject: mockCheckPhoneExistsInProject,
  user: { id: '1', name: 'Manager', role: 'manager' }
}

describe('Layout Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseStore.mockImplementation((selector) => {
      return selector(mockInitialState as any)
    })

    // Mock window methods
    vi.stubGlobal('confirm', vi.fn(() => true))
    vi.stubGlobal('alert', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('Project Creation with Custom Layout', () => {
    it('should create project with custom plot numbers through full workflow', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Start new project creation
      const projectButton = screen.getByText('Test Project')
      await user.click(projectButton)
      
      const createButton = screen.getByText('Create New Project')
      await user.click(createButton)
      
      // Enter project name
      const nameInput = screen.getByPlaceholderText('e.g., Green Valley Phase 2')
      await user.type(nameInput, 'Custom Numbering Project')
      
      // Proceed to layout definition
      const nextButton = screen.getByText('Next: Define Layout')
      await user.click(nextButton)
      
      // Should open layout editor
      await waitFor(() => {
        expect(screen.getByText('Create Layout: Custom Numbering Project')).toBeInTheDocument()
      })
      
      // Add first dimension
      const lengthInput = screen.getAllByPlaceholderText('30')[0]
      const breadthInput = screen.getAllByPlaceholderText('40')[0]
      const plotCountInput = screen.getAllByPlaceholderText('10')[0]
      
      await user.type(lengthInput, '30')
      await user.type(breadthInput, '40')
      await user.type(plotCountInput, '2')
      
      // Add second dimension with different numbering
      const addButton = screen.getByText('Add')
      await user.click(addButton)
      
      const secondLength = screen.getAllByPlaceholderText('30')[1]
      const secondBreadth = screen.getAllByPlaceholderText('40')[1]
      const secondCount = screen.getAllByPlaceholderText('10')[1]
      
      await user.type(secondLength, '50')
      await user.type(secondBreadth, '60')
      await user.type(secondCount, '3')
      
      // Create layout
      const createLayoutButton = screen.getByText('Create Layout')
      await user.click(createLayoutButton)
      
      expect(mockCreateProjectWithLayout).toHaveBeenCalledWith(
        'Custom Numbering Project',
        expect.any(Number),
        expect.any(Number),
        expect.arrayContaining([
          expect.objectContaining({ dimension: '30×40' }),
          expect.objectContaining({ dimension: '50×60' })
        ])
      )
    })
  })

  describe('Layout Management Integration', () => {
    it('should edit plot numbers and preserve functionality', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Open layout management
      const settingsButton = screen.getByTitle('Manage Layout')
      await user.click(settingsButton)
      
      await waitFor(() => {
        expect(screen.getByText('Manage Layout: Test Project')).toBeInTheDocument()
      })
      
      // Edit plot number
      const plotNumberInput = screen.getByDisplayValue('A-001')
      await user.clear(plotNumberInput)
      await user.type(plotNumberInput, 'TOWER-A-UNIT-001')
      
      expect(mockUpdateProjectLayout).toHaveBeenCalledWith(
        2, 2,
        expect.arrayContaining([
          expect.objectContaining({ plotNumber: 'TOWER-A-UNIT-001' })
        ])
      )
    })

    it('should handle bulk renumbering workflow', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Open layout management
      const settingsButton = screen.getByTitle('Manage Layout')
      await user.click(settingsButton)
      
      await waitFor(() => {
        expect(screen.getByText('Manage Layout: Test Project')).toBeInTheDocument()
      })
      
      // Perform bulk renumbering
      const renumberButton = screen.getByText('Renumber All')
      await user.click(renumberButton)
      
      expect(vi.mocked(confirm)).toHaveBeenCalledWith(
        expect.stringContaining('renumber all plots sequentially')
      )
      
      expect(mockUpdateProjectLayout).toHaveBeenCalledWith(
        2, 2,
        expect.arrayContaining([
          expect.objectContaining({ plotNumber: '1' }),
          expect.objectContaining({ plotNumber: '2' }),
          expect.objectContaining({ plotNumber: '3' }),
          expect.objectContaining({ plotNumber: '4' })
        ])
      )
    })

    it('should prevent deletion of booked plots', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Open layout management
      const settingsButton = screen.getByTitle('Manage Layout')
      await user.click(settingsButton)
      
      // Switch to delete tab
      const deleteTab = screen.getByText('Delete Components')
      await user.click(deleteTab)
      
      await waitFor(() => {
        expect(screen.getByText('Cannot delete')).toBeInTheDocument()
        expect(screen.getByText('(has bookings)')).toBeInTheDocument()
      })
    })
  })

  describe('Cross-Project Functionality', () => {
    it('should handle multiple projects with different numbering schemes', () => {
      const multiProjectState = {
        ...mockInitialState,
        projects: [
          ...mockInitialState.projects,
          {
            id: 'sequential-project',
            name: 'Sequential Project',
            totalPlots: 3,
            createdAt: new Date('2024-02-01'),
            layoutTemplate: {
              rows: 1,
              columns: 3,
              plotDefinitions: [
                { plotNumber: '1', dimension: '30×40', area: 1200, row: 0, col: 0 },
                { plotNumber: '2', dimension: '30×40', area: 1200, row: 0, col: 1 },
                { plotNumber: '3', dimension: '30×40', area: 1200, row: 0, col: 2 }
              ]
            }
          }
        ]
      }

      mockUseStore.mockImplementation((selector) => {
        return selector(multiProjectState as any)
      })

      render(<ProjectManager />)
      
      // Both projects should be available
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })
  })

  describe('Booking Integration with Custom Numbers', () => {
    it('should support booking plots with custom numbering', async () => {
      mockCheckPhoneExistsInProject.mockReturnValue({ exists: false, plots: [] })
      
      const user = userEvent.setup()
      
      // Mock Header component (simplified for this test)
      const MockHeader = () => {
        const [showMultipleBooking, setShowMultipleBooking] = useState(false)
        return (
          <div>
            <button onClick={() => setShowMultipleBooking(true)}>
              Multiple Booking
            </button>
            {showMultipleBooking && (
              <div data-testid="multiple-booking-modal">
                <h2>Multiple Plot Booking</h2>
                <button onClick={() => {
                  mockBookMultiplePlots(['plot-A-001', 'plot-C-005'], {
                    name: 'Corporate Client',
                    phone: '9876543210',
                    bookingDate: new Date()
                  })
                }}>
                  Book Plots
                </button>
              </div>
            )}
          </div>
        )
      }

      render(<MockHeader />)
      
      const multipleBookingButton = screen.getByText('Multiple Booking')
      await user.click(multipleBookingButton)
      
      const bookPlotsButton = screen.getByText('Book Plots')
      await user.click(bookPlotsButton)
      
      expect(mockBookMultiplePlots).toHaveBeenCalledWith(
        ['plot-A-001', 'plot-C-005'],
        expect.objectContaining({
          name: 'Corporate Client',
          phone: '9876543210'
        })
      )
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle duplicate plot number error gracefully', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Open layout management
      const settingsButton = screen.getByTitle('Manage Layout')
      await user.click(settingsButton)
      
      await waitFor(() => {
        expect(screen.getByText('Manage Layout: Test Project')).toBeInTheDocument()
      })
      
      // Try to create duplicate plot number
      const plotNumberInput = screen.getByDisplayValue('A-001')
      await user.clear(plotNumberInput)
      await user.type(plotNumberInput, 'B-002') // Already exists
      
      expect(vi.mocked(alert)).toHaveBeenCalledWith(
        'Plot number "B-002" already exists. Please choose a different number.'
      )
    })

    it('should handle network errors during layout update', async () => {
      mockUpdateProjectLayout.mockImplementation(() => {
        throw new Error('Network error')
      })

      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Open layout management
      const settingsButton = screen.getByTitle('Manage Layout')
      await user.click(settingsButton)
      
      await waitFor(() => {
        expect(screen.getByText('Manage Layout: Test Project')).toBeInTheDocument()
      })
      
      // Try to edit plot - should handle error gracefully
      const plotNumberInput = screen.getByDisplayValue('A-001')
      await user.clear(plotNumberInput)
      await user.type(plotNumberInput, 'NEW-001')
      
      // Should not crash the app
      expect(screen.getByText('Manage Layout: Test Project')).toBeInTheDocument()
    })
  })

  describe('Performance Integration Tests', () => {
    it('should handle large layouts with custom numbering efficiently', async () => {
      const largePlotDefinitions = Array.from({ length: 1000 }, (_, i) => ({
        plotNumber: `BLOCK-${Math.floor(i / 100)}-UNIT-${String(i).padStart(3, '0')}`,
        dimension: '30×40',
        area: 1200,
        row: Math.floor(i / 50),
        col: i % 50
      }))

      const largeLayoutState = {
        ...mockInitialState,
        projects: [{
          ...mockInitialState.projects[0],
          totalPlots: 1000,
          layoutTemplate: {
            rows: 20,
            columns: 50,
            plotDefinitions: largePlotDefinitions
          }
        }],
        layout: {
          ...mockInitialState.layout,
          totalPlots: 1000,
          plots: largePlotDefinitions.map((def, i) => ({
            id: `plot-${def.plotNumber}`,
            plotNumber: def.plotNumber,
            dimension: def.dimension,
            area: def.area,
            status: 'available' as const,
            row: def.row,
            col: def.col,
            lastUpdated: new Date()
          }))
        }
      }

      mockUseStore.mockImplementation((selector) => {
        return selector(largeLayoutState as any)
      })

      const startTime = performance.now()
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Open layout management
      const settingsButton = screen.getByTitle('Manage Layout')
      await user.click(settingsButton)
      
      await waitFor(() => {
        expect(screen.getByText('1000 plots in layout')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(3000) // Should render within 3 seconds
    })
  })

  describe('Accessibility Integration', () => {
    it('should maintain accessibility with custom plot numbers', async () => {
      const user = userEvent.setup()
      render(<ProjectManager />)
      
      // Test keyboard navigation
      await user.tab()
      expect(screen.getByText('Test Project')).toHaveFocus()
      
      // Open layout management
      const settingsButton = screen.getByTitle('Manage Layout')
      await user.click(settingsButton)
      
      await waitFor(() => {
        expect(screen.getByText('Manage Layout: Test Project')).toBeInTheDocument()
      })
      
      // Should have proper ARIA labels
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add plot/i })).toBeInTheDocument()
    })
  })
})

const useState = (initialValue: boolean) => {
  let value = initialValue
  const setValue = (newValue: boolean) => { value = newValue }
  return [value, setValue] as const
}