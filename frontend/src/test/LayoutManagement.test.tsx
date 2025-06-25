import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LayoutManagementModal } from '../components/LayoutManagementModal'
import { useStore } from '../hooks/useStore'
import { PlotDefinition } from '../types'

// Mock the useStore hook
vi.mock('../hooks/useStore')
const mockUseStore = vi.mocked(useStore)

const mockUpdateProjectLayout = vi.fn()

const mockProject = {
  id: 'test-project',
  name: 'Test Project',
  totalPlots: 4,
  createdAt: new Date('2024-01-01'),
  layoutTemplate: {
    rows: 2,
    columns: 2,
    plotDefinitions: [
      { plotNumber: '1', dimension: '30×40', area: 1200, row: 0, col: 0 },
      { plotNumber: '2', dimension: '30×50', area: 1500, row: 0, col: 1 },
      { plotNumber: '5', dimension: 'Odd', area: 1000, row: 1, col: 0 },
      { plotNumber: '10', dimension: '40×40', area: 1600, row: 1, col: 1 }
    ] as PlotDefinition[]
  }
}

const mockLayout = {
  id: 'test-project',
  name: 'Test Project',
  totalArea: '5 acres',
  totalPlots: 4,
  plots: [
    {
      id: 'plot-1',
      plotNumber: '1',
      dimension: '30×40',
      area: 1200,
      status: 'available' as const,
      row: 0,
      col: 0,
      lastUpdated: new Date()
    },
    {
      id: 'plot-2',
      plotNumber: '2',
      dimension: '30×50',
      area: 1500,
      status: 'booked' as const,
      row: 0,
      col: 1,
      bookings: [{ name: 'John Doe', phone: '1234567890', bookingDate: new Date() }],
      lastUpdated: new Date()
    },
    {
      id: 'plot-5',
      plotNumber: '5',
      dimension: 'Odd',
      area: 1000,
      status: 'available' as const,
      row: 1,
      col: 0,
      lastUpdated: new Date()
    },
    {
      id: 'plot-10',
      plotNumber: '10',
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
}

describe('LayoutManagementModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseStore.mockImplementation((selector) => {
      const state = {
        layout: mockLayout,
        currentProjectId: 'test-project',
        projects: [mockProject],
        updateProjectLayout: mockUpdateProjectLayout,
        user: { id: '1', name: 'Manager', role: 'manager' }
      }
      return selector(state as any)
    })

    // Mock window.confirm
    vi.stubGlobal('confirm', vi.fn(() => true))
    vi.stubGlobal('alert', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('Modal Rendering', () => {
    it('should render modal when open', () => {
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      expect(screen.getByText('Manage Layout: Test Project')).toBeInTheDocument()
      expect(screen.getByText('Edit Plots')).toBeInTheDocument()
      expect(screen.getByText('Delete Components')).toBeInTheDocument()
    })

    it('should not render when closed', () => {
      render(<LayoutManagementModal isOpen={false} onClose={vi.fn()} />)
      
      expect(screen.queryByText('Manage Layout: Test Project')).not.toBeInTheDocument()
    })

    it('should not render without current project', () => {
      mockUseStore.mockImplementation((selector) => {
        const state = {
          layout: mockLayout,
          currentProjectId: null,
          projects: [],
          updateProjectLayout: mockUpdateProjectLayout,
          user: { id: '1', name: 'Manager', role: 'manager' }
        }
        return selector(state as any)
      })

      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      expect(screen.queryByText('Manage Layout:')).not.toBeInTheDocument()
    })
  })

  describe('Edit Plots Tab', () => {
    it('should show all plots for editing by default', () => {
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      expect(screen.getByDisplayValue('1')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2')).toBeInTheDocument()
      expect(screen.getByDisplayValue('5')).toBeInTheDocument()
      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    })

    it('should allow editing plot numbers', async () => {
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const plot1Input = screen.getByDisplayValue('1')
      await user.clear(plot1Input)
      await user.type(plot1Input, 'P-001')
      
      expect(mockUpdateProjectLayout).toHaveBeenCalledWith(
        2, 2,
        expect.arrayContaining([
          expect.objectContaining({ plotNumber: 'P-001' })
        ])
      )
    })

    it('should prevent duplicate plot numbers', async () => {
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const plot1Input = screen.getByDisplayValue('1')
      await user.clear(plot1Input)
      await user.type(plot1Input, '2') // Already exists
      
      expect(vi.mocked(alert)).toHaveBeenCalledWith(
        'Plot number "2" already exists. Please choose a different number.'
      )
      expect(mockUpdateProjectLayout).not.toHaveBeenCalled()
    })

    it('should auto-calculate area for standard dimensions', async () => {
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const dimensionInputs = screen.getAllByDisplayValue('30×40')
      await user.clear(dimensionInputs[0])
      await user.type(dimensionInputs[0], '50×60')
      
      expect(mockUpdateProjectLayout).toHaveBeenCalledWith(
        2, 2,
        expect.arrayContaining([
          expect.objectContaining({ 
            dimension: '50×60',
            area: 3000 
          })
        ])
      )
    })

    it('should allow manual area editing', async () => {
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const areaInputs = screen.getAllByDisplayValue('1200')
      await user.clear(areaInputs[0])
      await user.type(areaInputs[0], '1500')
      
      expect(mockUpdateProjectLayout).toHaveBeenCalledWith(
        2, 2,
        expect.arrayContaining([
          expect.objectContaining({ area: 1500 })
        ])
      )
    })

    it('should add new plot with next available number', async () => {
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const addButton = screen.getByText('Add Plot')
      await user.click(addButton)
      
      expect(mockUpdateProjectLayout).toHaveBeenCalledWith(
        3, 2, // Expanded rows
        expect.arrayContaining([
          ...mockProject.layoutTemplate!.plotDefinitions,
          expect.objectContaining({ 
            plotNumber: '3', // Next available number
            dimension: '30×40',
            area: 1200
          })
        ])
      )
    })

    it('should perform bulk renumbering', async () => {
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const renumberButton = screen.getByText('Renumber All')
      await user.click(renumberButton)
      
      expect(vi.mocked(confirm)).toHaveBeenCalledWith(
        expect.stringContaining('renumber all plots sequentially')
      )
      
      expect(mockUpdateProjectLayout).toHaveBeenCalledWith(
        2, 2,
        [
          expect.objectContaining({ plotNumber: '1' }),
          expect.objectContaining({ plotNumber: '2' }),
          expect.objectContaining({ plotNumber: '3' }),
          expect.objectContaining({ plotNumber: '4' })
        ]
      )
    })

    it('should show plot status for each plot', () => {
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      expect(screen.getByText('available')).toBeInTheDocument()
      expect(screen.getByText('booked')).toBeInTheDocument()
      expect(screen.getByText('agreement')).toBeInTheDocument()
    })
  })

  describe('Delete Components Tab', () => {
    it('should switch to delete tab', async () => {
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const deleteTab = screen.getByText('Delete Components')
      await user.click(deleteTab)
      
      expect(screen.getByText('Deletion Warning')).toBeInTheDocument()
      expect(screen.getByText('Delete Entire Layout')).toBeInTheDocument()
    })

    it('should show available plots as deletable', async () => {
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const deleteTab = screen.getByText('Delete Components')
      await user.click(deleteTab)
      
      // Plot 1 and 5 are available, should show delete buttons
      const deleteButtons = screen.getAllByText('Delete')
      expect(deleteButtons.length).toBeGreaterThan(0)
    })

    it('should prevent deleting plots with bookings', async () => {
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const deleteTab = screen.getByText('Delete Components')
      await user.click(deleteTab)
      
      expect(screen.getByText('Cannot delete')).toBeInTheDocument()
      expect(screen.getByText('(has bookings)')).toBeInTheDocument()
    })

    it('should delete available plot with confirmation', async () => {
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const deleteTab = screen.getByText('Delete Components')
      await user.click(deleteTab)
      
      const deleteButtons = screen.getAllByText('Delete')
      await user.click(deleteButtons[0])
      
      // Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByText(/Delete Plot #/)).toBeInTheDocument()
      })
      
      const confirmButton = screen.getByRole('button', { name: 'Delete Plot' })
      await user.click(confirmButton)
      
      expect(mockUpdateProjectLayout).toHaveBeenCalledWith(
        2, 2,
        expect.not.arrayContaining([
          expect.objectContaining({ plotNumber: '1' })
        ])
      )
    })

    it('should delete entire layout with confirmation', async () => {
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const deleteTab = screen.getByText('Delete Components')
      await user.click(deleteTab)
      
      const deleteLayoutButton = screen.getByText('Delete Layout')
      await user.click(deleteLayoutButton)
      
      await waitFor(() => {
        expect(screen.getByText('Delete Entire Layout?')).toBeInTheDocument()
      })
      
      const confirmButton = screen.getByRole('button', { name: 'Delete Layout' })
      await user.click(confirmButton)
      
      expect(mockUpdateProjectLayout).toHaveBeenCalledWith(1, 1, [])
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty plot list', () => {
      mockUseStore.mockImplementation((selector) => {
        const state = {
          layout: { ...mockLayout, plots: [] },
          currentProjectId: 'test-project',
          projects: [{
            ...mockProject,
            layoutTemplate: {
              rows: 1,
              columns: 1,
              plotDefinitions: []
            }
          }],
          updateProjectLayout: mockUpdateProjectLayout,
          user: { id: '1', name: 'Manager', role: 'manager' }
        }
        return selector(state as any)
      })

      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      expect(screen.getByText('0 plots in layout')).toBeInTheDocument()
    })

    it('should handle project without layout template', () => {
      mockUseStore.mockImplementation((selector) => {
        const state = {
          layout: mockLayout,
          currentProjectId: 'test-project',
          projects: [{
            id: 'test-project',
            name: 'Test Project',
            totalPlots: 4,
            createdAt: new Date('2024-01-01')
            // No layoutTemplate
          }],
          updateProjectLayout: mockUpdateProjectLayout,
          user: { id: '1', name: 'Manager', role: 'manager' }
        }
        return selector(state as any)
      })

      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      // Should render without crashing
      expect(screen.getByText('Manage Layout: Test Project')).toBeInTheDocument()
    })

    it('should handle very long plot numbers', async () => {
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const plot1Input = screen.getByDisplayValue('1')
      await user.clear(plot1Input)
      await user.type(plot1Input, 'PLOT-SECTION-A-BLOCK-1-UNIT-001')
      
      expect(mockUpdateProjectLayout).toHaveBeenCalledWith(
        2, 2,
        expect.arrayContaining([
          expect.objectContaining({ plotNumber: 'PLOT-SECTION-A-BLOCK-1-UNIT-001' })
        ])
      )
    })

    it('should handle special characters in plot numbers', async () => {
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const plot1Input = screen.getByDisplayValue('1')
      await user.clear(plot1Input)
      await user.type(plot1Input, 'A-1_V2.0')
      
      expect(mockUpdateProjectLayout).toHaveBeenCalledWith(
        2, 2,
        expect.arrayContaining([
          expect.objectContaining({ plotNumber: 'A-1_V2.0' })
        ])
      )
    })

    it('should handle negative coordinates', async () => {
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const rowInputs = screen.getAllByDisplayValue('0')
      await user.clear(rowInputs[0])
      await user.type(rowInputs[0], '-1')
      
      expect(mockUpdateProjectLayout).toHaveBeenCalledWith(
        2, 2,
        expect.arrayContaining([
          expect.objectContaining({ row: -1 })
        ])
      )
    })

    it('should handle bulk renumber cancellation', async () => {
      vi.mocked(confirm).mockReturnValue(false)
      
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const renumberButton = screen.getByText('Renumber All')
      await user.click(renumberButton)
      
      expect(mockUpdateProjectLayout).not.toHaveBeenCalled()
    })
  })

  describe('Performance', () => {
    it('should handle large number of plots efficiently', () => {
      const largePlotList = Array.from({ length: 1000 }, (_, i) => ({
        plotNumber: (i + 1).toString(),
        dimension: '30×40',
        area: 1200,
        row: Math.floor(i / 50),
        col: i % 50
      }))

      mockUseStore.mockImplementation((selector) => {
        const state = {
          layout: { ...mockLayout, plots: [] },
          currentProjectId: 'test-project',
          projects: [{
            ...mockProject,
            layoutTemplate: {
              rows: 20,
              columns: 50,
              plotDefinitions: largePlotList
            }
          }],
          updateProjectLayout: mockUpdateProjectLayout,
          user: { id: '1', name: 'Manager', role: 'manager' }
        }
        return selector(state as any)
      })

      const startTime = performance.now()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(1000) // Should render within 1 second
      expect(screen.getByText('1000 plots in layout')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add plot/i })).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<LayoutManagementModal isOpen={true} onClose={vi.fn()} />)
      
      const plot1Input = screen.getByDisplayValue('1')
      await user.tab()
      
      expect(plot1Input).toHaveFocus()
    })
  })
})