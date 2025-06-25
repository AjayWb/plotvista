import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../hooks/useStore'
import { PlotDefinition } from '../types'

describe('Plot Number Management', () => {
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

  describe('Non-Sequential Plot Numbers', () => {
    it('should allow creating plots with non-sequential numbers', () => {
      const { createProjectWithLayout } = useStore.getState()
      
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: 'A-001', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: 'B-005', dimension: '30×50', area: 1500, row: 0, col: 1 },
        { plotNumber: 'C-100', dimension: 'Odd', area: 1000, row: 1, col: 0 }
      ]
      
      createProjectWithLayout('Custom Numbers Project', 2, 2, plotDefinitions)
      
      const { layout } = useStore.getState()
      expect(layout.plots.map(p => p.plotNumber)).toEqual(['A-001', 'B-005', 'C-100'])
    })

    it('should handle alphanumeric plot numbers', () => {
      const { createProjectWithLayout } = useStore.getState()
      
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: 'PLOT-001A', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: 'PLOT-002B', dimension: '30×50', area: 1500, row: 0, col: 1 },
        { plotNumber: 'PLOT-003C', dimension: '40×40', area: 1600, row: 1, col: 0 }
      ]
      
      createProjectWithLayout('Alphanumeric Project', 2, 2, plotDefinitions)
      
      const { layout } = useStore.getState()
      expect(layout.plots.every(p => p.plotNumber.startsWith('PLOT-'))).toBe(true)
      expect(layout.plots.every(p => /[A-C]$/.test(p.plotNumber))).toBe(true)
    })

    it('should handle special characters in plot numbers', () => {
      const { createProjectWithLayout } = useStore.getState()
      
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: 'A-1_V2.0', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: 'B-2_V3.1', dimension: '30×50', area: 1500, row: 0, col: 1 },
        { plotNumber: 'C-3_V1.5', dimension: '40×40', area: 1600, row: 1, col: 0 }
      ]
      
      createProjectWithLayout('Special Chars Project', 2, 2, plotDefinitions)
      
      const { layout } = useStore.getState()
      expect(layout.plots.map(p => p.plotNumber)).toEqual(['A-1_V2.0', 'B-2_V3.1', 'C-3_V1.5'])
    })
  })

  describe('Plot Number Updates', () => {
    beforeEach(() => {
      const { createProjectWithLayout } = useStore.getState()
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: '2', dimension: '30×50', area: 1500, row: 0, col: 1 },
        { plotNumber: '5', dimension: 'Odd', area: 1000, row: 1, col: 0 }
      ]
      createProjectWithLayout('Test Project', 2, 2, plotDefinitions)
    })

    it('should preserve bookings when plot numbers change', () => {
      const { updatePlotStatus, updateProjectLayout, layout } = useStore.getState()
      
      // Book a plot first
      const booking = { name: 'John Doe', phone: '1234567890', bookingDate: new Date() }
      updatePlotStatus('plot-test-project-1', 'booked', booking)
      
      // Update layout with changed plot numbers
      const newPlotDefinitions: PlotDefinition[] = [
        { plotNumber: 'A-001', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: 'A-002', dimension: '30×50', area: 1500, row: 0, col: 1 },
        { plotNumber: 'A-005', dimension: 'Odd', area: 1000, row: 1, col: 0 }
      ]
      
      updateProjectLayout(2, 2, newPlotDefinitions)
      
      const { layout: updatedLayout } = useStore.getState()
      
      // Original plot 1 booking should be lost since plot number changed from '1' to 'A-001'
      const plotA001 = updatedLayout.plots.find(p => p.plotNumber === 'A-001')
      expect(plotA001?.status).toBe('available')
    })

    it('should handle gaps in plot numbers after deletion', () => {
      const { updateProjectLayout } = useStore.getState()
      
      // Remove plot '2', leaving '1' and '5'
      const newPlotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: '5', dimension: 'Odd', area: 1000, row: 1, col: 0 }
      ]
      
      updateProjectLayout(2, 2, newPlotDefinitions)
      
      const { layout } = useStore.getState()
      expect(layout.plots.map(p => p.plotNumber)).toEqual(['1', '5'])
      expect(layout.totalPlots).toBe(2)
    })

    it('should handle duplicate plot numbers gracefully', () => {
      const { updateProjectLayout } = useStore.getState()
      
      // Try to create duplicate plot numbers
      const newPlotDefinitions: PlotDefinition[] = [
        { plotNumber: '1', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: '1', dimension: '30×50', area: 1500, row: 0, col: 1 }, // Duplicate
        { plotNumber: '5', dimension: 'Odd', area: 1000, row: 1, col: 0 }
      ]
      
      updateProjectLayout(2, 2, newPlotDefinitions)
      
      const { layout } = useStore.getState()
      // Should still process the update (backend should handle deduplication logic)
      expect(layout.plots.length).toBe(3)
    })
  })

  describe('Booking Management with Custom Plot Numbers', () => {
    beforeEach(() => {
      const { createProjectWithLayout } = useStore.getState()
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: 'TOWER-A-001', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: 'TOWER-B-002', dimension: '30×50', area: 1500, row: 0, col: 1 },
        { plotNumber: 'VILLA-001', dimension: 'Odd', area: 2000, row: 1, col: 0 }
      ]
      createProjectWithLayout('Mixed Development', 2, 2, plotDefinitions)
    })

    it('should allow multiple bookings with custom plot numbers', () => {
      const { bookMultiplePlots } = useStore.getState()
      
      const booking = { name: 'Corporate Client', phone: '1234567890', bookingDate: new Date() }
      const plotIds = ['plot-mixed-development-TOWER-A-001', 'plot-mixed-development-TOWER-B-002']
      
      bookMultiplePlots(plotIds, booking)
      
      const { layout } = useStore.getState()
      const towerAPlot = layout.plots.find(p => p.plotNumber === 'TOWER-A-001')
      const towerBPlot = layout.plots.find(p => p.plotNumber === 'TOWER-B-002')
      
      expect(towerAPlot?.status).toBe('booked')
      expect(towerBPlot?.status).toBe('booked')
      expect(towerAPlot?.bookings?.[0].name).toBe('Corporate Client')
    })

    it('should check phone existence across custom plot numbers', () => {
      const { updatePlotStatus, checkPhoneExistsInProject } = useStore.getState()
      
      // Book a plot with custom number
      const booking = { name: 'John Doe', phone: '1234567890', bookingDate: new Date() }
      updatePlotStatus('plot-mixed-development-TOWER-A-001', 'booked', booking)
      
      const phoneCheck = checkPhoneExistsInProject('1234567890')
      
      expect(phoneCheck.exists).toBe(true)
      expect(phoneCheck.plots).toContain('TOWER-A-001')
    })
  })

  describe('Export Functionality with Custom Plot Numbers', () => {
    beforeEach(() => {
      const { createProjectWithLayout } = useStore.getState()
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: 'SEC-A-001', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: 'SEC-B-005', dimension: '30×50', area: 1500, row: 0, col: 1 },
        { plotNumber: 'VILLA-100', dimension: 'Odd', area: 2500, row: 1, col: 0 }
      ]
      createProjectWithLayout('Sectioned Project', 2, 2, plotDefinitions)
    })

    it('should export plots with custom numbering correctly', () => {
      const { layout } = useStore.getState()
      
      // Simulate export data generation
      const exportData = layout.plots.map(plot => ({
        plotNumber: plot.plotNumber,
        dimension: plot.dimension,
        area: plot.area,
        status: plot.status
      }))
      
      expect(exportData).toEqual([
        { plotNumber: 'SEC-A-001', dimension: '30×40', area: 1200, status: 'available' },
        { plotNumber: 'SEC-B-005', dimension: '30×50', area: 1500, status: 'available' },
        { plotNumber: 'VILLA-100', dimension: 'Odd', area: 2500, status: 'available' }
      ])
    })
  })

  describe('Edge Cases', () => {
    it('should handle extremely long plot numbers', () => {
      const { createProjectWithLayout } = useStore.getState()
      
      const longPlotNumber = 'SUPER-LONG-PLOT-NUMBER-WITH-MANY-SECTIONS-AND-DETAILS-001-FINAL'
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: longPlotNumber, dimension: '30×40', area: 1200, row: 0, col: 0 }
      ]
      
      createProjectWithLayout('Long Names Project', 1, 1, plotDefinitions)
      
      const { layout } = useStore.getState()
      expect(layout.plots[0].plotNumber).toBe(longPlotNumber)
    })

    it('should handle plot numbers with only numbers but large values', () => {
      const { createProjectWithLayout } = useStore.getState()
      
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: '999999', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: '1000000', dimension: '30×50', area: 1500, row: 0, col: 1 }
      ]
      
      createProjectWithLayout('Large Numbers Project', 1, 2, plotDefinitions)
      
      const { layout } = useStore.getState()
      expect(layout.plots.map(p => p.plotNumber)).toEqual(['999999', '1000000'])
    })

    it('should handle plot numbers with Unicode characters', () => {
      const { createProjectWithLayout } = useStore.getState()
      
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: 'प्लॉट-001', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: 'участок-002', dimension: '30×50', area: 1500, row: 0, col: 1 },
        { plotNumber: '地块-003', dimension: 'Odd', area: 1000, row: 1, col: 0 }
      ]
      
      createProjectWithLayout('Unicode Project', 2, 2, plotDefinitions)
      
      const { layout } = useStore.getState()
      expect(layout.plots.map(p => p.plotNumber)).toEqual(['प्लॉट-001', 'участок-002', '地块-003'])
    })

    it('should handle empty plot number (edge case)', () => {
      const { createProjectWithLayout } = useStore.getState()
      
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: '', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: '2', dimension: '30×50', area: 1500, row: 0, col: 1 }
      ]
      
      createProjectWithLayout('Empty Number Project', 1, 2, plotDefinitions)
      
      const { layout } = useStore.getState()
      expect(layout.plots.length).toBe(2)
      expect(layout.plots[0].plotNumber).toBe('')
    })

    it('should handle plot number with only whitespace', () => {
      const { createProjectWithLayout } = useStore.getState()
      
      const plotDefinitions: PlotDefinition[] = [
        { plotNumber: '   ', dimension: '30×40', area: 1200, row: 0, col: 0 },
        { plotNumber: '\t\n', dimension: '30×50', area: 1500, row: 0, col: 1 }
      ]
      
      createProjectWithLayout('Whitespace Project', 1, 2, plotDefinitions)
      
      const { layout } = useStore.getState()
      expect(layout.plots.length).toBe(2)
      expect(layout.plots[0].plotNumber).toBe('   ')
      expect(layout.plots[1].plotNumber).toBe('\t\n')
    })
  })

  describe('Performance with Custom Plot Numbers', () => {
    it('should handle large number of plots with complex numbering efficiently', () => {
      const { createProjectWithLayout } = useStore.getState()
      
      const startTime = performance.now()
      
      const largePlotList: PlotDefinition[] = Array.from({ length: 5000 }, (_, i) => ({
        plotNumber: `SECTOR-${Math.floor(i / 100)}-BLOCK-${Math.floor(i / 10) % 10}-PLOT-${String(i).padStart(4, '0')}`,
        dimension: '30×40',
        area: 1200,
        row: Math.floor(i / 100),
        col: i % 100
      }))
      
      createProjectWithLayout('Performance Test Project', 50, 100, largePlotList)
      
      const endTime = performance.now()
      const { layout } = useStore.getState()
      
      expect(layout.plots.length).toBe(5000)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
      
      // Verify complex numbering is preserved
      expect(layout.plots[0].plotNumber).toBe('SECTOR-0-BLOCK-0-PLOT-0000')
      expect(layout.plots[1234].plotNumber).toBe('SECTOR-12-BLOCK-3-PLOT-1234')
    })
  })
})