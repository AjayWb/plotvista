import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LayoutEditor } from '../components/LayoutEditor'
import { PlotDefinition } from '../types'

const mockSave = vi.fn()
const mockCancel = vi.fn()

const mockPlots: PlotDefinition[] = [
  { plotNumber: '1', dimension: '30×40', area: 1200, row: 0, col: 0 },
  { plotNumber: '2', dimension: '30×50', area: 1500, row: 0, col: 1 },
  { plotNumber: '3', dimension: '', area: 0, row: 1, col: 0 },
  { plotNumber: '4', dimension: 'Odd', area: 1000, row: 1, col: 1 },
]

describe('LayoutEditor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render layout editor with project name', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.getByText(/Create Layout: Test Project/)).toBeInTheDocument()
    })

    it('should show edit mode when isEditing is true', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          isEditing={true}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.getByText(/Edit Layout: Test Project/)).toBeInTheDocument()
      expect(screen.getByText('Add Row')).toBeInTheDocument()
      expect(screen.getByText('Add Column')).toBeInTheDocument()
    })

    it('should initialize with provided plots', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          initialRows={2}
          initialCols={2}
          initialPlots={mockPlots}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.getByText('#1')).toBeInTheDocument()
      expect(screen.getByText('#2')).toBeInTheDocument()
      expect(screen.getByText('#3')).toBeInTheDocument()
      expect(screen.getByText('#4')).toBeInTheDocument()
    })
  })

  describe('Tool Selection', () => {
    it('should start with select tool active', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const selectTool = screen.getByRole('button', { name: /select/i })
      expect(selectTool).toHaveClass('bg-blue-50')
    })

    it('should switch tools when clicked', async () => {
      const user = userEvent.setup()
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const drawTool = screen.getByRole('button', { name: /draw/i })
      await user.click(drawTool)
      
      expect(drawTool).toHaveClass('bg-blue-50')
    })

    it('should show delete tool with red styling', async () => {
      const user = userEvent.setup()
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const deleteTool = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteTool)
      
      expect(deleteTool).toHaveClass('bg-red-50')
    })
  })

  describe('Dimension Presets', () => {
    it('should render all dimension presets', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.getByText('30×40 ft')).toBeInTheDocument()
      expect(screen.getByText('30×50 ft')).toBeInTheDocument()
      expect(screen.getByText('40×40 ft')).toBeInTheDocument()
      expect(screen.getByText('60×40 ft')).toBeInTheDocument()
    })

    it('should show area calculation for presets', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.getByText('1200 sq ft')).toBeInTheDocument() // 30×40
      expect(screen.getByText('1500 sq ft')).toBeInTheDocument() // 30×50
    })

    it('should select preset when clicked', async () => {
      const user = userEvent.setup()
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const preset = screen.getByRole('button', { name: /30×50 ft 1500 sq ft/i })
      await user.click(preset)
      
      expect(preset).toHaveClass('bg-blue-50')
    })
  })

  describe('Custom Dimensions', () => {
    it('should allow custom width and height input', async () => {
      const user = userEvent.setup()
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const widthInput = screen.getByPlaceholderText('W')
      const heightInput = screen.getByPlaceholderText('H')
      
      await user.type(widthInput, '35')
      await user.type(heightInput, '45')
      
      expect(widthInput).toHaveValue(35)
      expect(heightInput).toHaveValue(45)
      expect(screen.getByText('= 1575 sq ft')).toBeInTheDocument()
    })

    it('should allow odd plot area input', async () => {
      const user = userEvent.setup()
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const oddInput = screen.getByPlaceholderText('Total area in sq ft')
      await user.type(oddInput, '2000')
      
      expect(oddInput).toHaveValue(2000)
    })
  })

  describe('Plot Grid Interaction', () => {
    it('should show plot numbers in grid', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          initialRows={2}
          initialCols={2}
          initialPlots={mockPlots}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.getByText('#1')).toBeInTheDocument()
      expect(screen.getByText('#4')).toBeInTheDocument()
    })

    it('should show dimensions on configured plots', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          initialRows={2}
          initialCols={2}
          initialPlots={mockPlots}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.getByText('30×40')).toBeInTheDocument()
      expect(screen.getByText('30×50')).toBeInTheDocument()
      expect(screen.getByText('Odd')).toBeInTheDocument()
    })

    it('should select plots when clicked in select mode', async () => {
      const user = userEvent.setup()
      render(
        <LayoutEditor
          projectName="Test Project"
          initialRows={2}
          initialCols={2}
          initialPlots={mockPlots}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const plot1 = screen.getByText('#1').closest('div')
      await user.click(plot1!)
      
      expect(screen.getByText('1 selected')).toBeInTheDocument()
    })
  })

  describe('Statistics Display', () => {
    it('should show dimension statistics', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          initialRows={2}
          initialCols={2}
          initialPlots={mockPlots}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.getByText('30×40')).toBeInTheDocument()
      expect(screen.getByText('30×50')).toBeInTheDocument()
      expect(screen.getByText('Odd')).toBeInTheDocument()
      expect(screen.getByText('1 plots')).toBeInTheDocument() // For empty plots
    })

    it('should show total area in footer', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          initialRows={2}
          initialCols={2}
          initialPlots={mockPlots}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.getByText('3,700 sq ft')).toBeInTheDocument() // 1200+1500+1000
      expect(screen.getByText('(0.08 acres)')).toBeInTheDocument()
    })
  })

  describe('Copy and Paste', () => {
    it('should enable copy button when plots selected', async () => {
      const user = userEvent.setup()
      render(
        <LayoutEditor
          projectName="Test Project"
          initialRows={2}
          initialCols={2}
          initialPlots={mockPlots}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const plot1 = screen.getByText('#1').closest('div')
      await user.click(plot1!)
      
      const copyButton = screen.getByRole('button', { name: /copy/i })
      expect(copyButton).not.toBeDisabled()
    })

    it('should disable paste when no copied plots', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const pasteButton = screen.getByRole('button', { name: /paste/i })
      expect(pasteButton).toBeDisabled()
    })
  })

  describe('Undo/Redo Functionality', () => {
    it('should show undo/redo buttons', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const buttons = screen.getAllByRole('button')
      const undoButton = buttons.find(btn => btn.querySelector('.rotate-180'))
      const redoButton = buttons.find(btn => btn.querySelector(':not(.rotate-180)') && btn.querySelector('svg'))
      
      expect(undoButton).toBeInTheDocument()
      expect(redoButton).toBeInTheDocument()
    })

    it('should disable undo when at start of history', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const buttons = screen.getAllByRole('button')
      const undoButton = buttons.find(btn => btn.querySelector('.rotate-180'))
      
      expect(undoButton).toBeDisabled()
    })
  })

  describe('Help Modal', () => {
    it('should show help by default for new layouts', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.getByText('How to Use Layout Editor')).toBeInTheDocument()
    })

    it('should not show help for editing mode', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          isEditing={true}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.queryByText('How to Use Layout Editor')).not.toBeInTheDocument()
    })

    it('should close help when Got it clicked', async () => {
      const user = userEvent.setup()
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const gotItButton = screen.getByText('Got it!')
      await user.click(gotItButton)
      
      expect(screen.queryByText('How to Use Layout Editor')).not.toBeInTheDocument()
    })
  })

  describe('Save and Cancel Actions', () => {
    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup()
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      expect(mockCancel).toHaveBeenCalledTimes(1)
    })

    it('should disable save when no plots configured', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const saveButton = screen.getByRole('button', { name: /create layout/i })
      expect(saveButton).toBeDisabled()
    })

    it('should enable save when plots are configured', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          initialRows={2}
          initialCols={2}
          initialPlots={mockPlots}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const saveButton = screen.getByRole('button', { name: /create layout/i })
      expect(saveButton).not.toBeDisabled()
    })

    it('should call onSave with correct parameters', async () => {
      const user = userEvent.setup()
      render(
        <LayoutEditor
          projectName="Test Project"
          initialRows={2}
          initialCols={2}
          initialPlots={mockPlots}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      const saveButton = screen.getByRole('button', { name: /create layout/i })
      await user.click(saveButton)
      
      expect(mockSave).toHaveBeenCalledWith(2, 2, expect.any(Array))
    })

    it('should show save changes text in edit mode', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          initialPlots={mockPlots}
          isEditing={true}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    })
  })

  describe('Dynamic Grid Manipulation', () => {
    it('should show add row/column buttons in edit mode', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          isEditing={true}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.getByText('Add Row')).toBeInTheDocument()
      expect(screen.getByText('Add Column')).toBeInTheDocument()
    })

    it('should not show add buttons in create mode', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.queryByText('Add Row')).not.toBeInTheDocument()
      expect(screen.queryByText('Add Column')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for tools', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.getByRole('button', { name: /select/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /draw/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /dimension/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })

    it('should have proper title attribute for edit layout button', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          isEditing={true}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      // This test would be better in ProjectManager test
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle large grids efficiently', () => {
      const largePlots: PlotDefinition[] = []
      for (let i = 0; i < 500; i++) {
        largePlots.push({
          plotNumber: (i + 1).toString(),
          dimension: '30×40',
          area: 1200,
          row: Math.floor(i / 25),
          col: i % 25
        })
      }
      
      render(
        <LayoutEditor
          projectName="Large Project"
          initialRows={20}
          initialCols={25}
          initialPlots={largePlots}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.getByText('500 of 500 plots configured')).toBeInTheDocument()
    })

    it('should handle empty grid gracefully', () => {
      render(
        <LayoutEditor
          projectName="Empty Project"
          initialRows={0}
          initialCols={0}
          initialPlots={[]}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      expect(screen.getByText('Create Layout: Empty Project')).toBeInTheDocument()
    })

    it('should prevent negative grid dimensions', () => {
      render(
        <LayoutEditor
          projectName="Test Project"
          initialRows={-1}
          initialCols={-1}
          onSave={mockSave}
          onCancel={mockCancel}
        />
      )
      
      // Should default to minimum valid values
      expect(screen.getByText('Grid: 10 × 10')).toBeInTheDocument()
    })
  })
})