import { useState, useEffect } from 'react'
import { X, Edit3, Trash2, AlertTriangle, Grid, Plus, Settings, Save } from 'lucide-react'
import { useStore } from '../hooks/useStore'
import { PlotDefinition } from '../types'

interface LayoutManagementModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LayoutManagementModal({ isOpen, onClose }: LayoutManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'delete'>('edit')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [plotToDelete, setPlotToDelete] = useState<string | null>(null)
  const [showLayoutDeleteConfirm, setShowLayoutDeleteConfirm] = useState(false)
  const [showRenumberDialog, setShowRenumberDialog] = useState(false)
  const [renumberStartFrom, setRenumberStartFrom] = useState('1')
  const [editedPlots, setEditedPlots] = useState<{ [key: string]: PlotDefinition }>({})
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [isSaving, setIsSaving] = useState(false)

  const layout = useStore(state => state.layout)
  const currentProjectId = useStore(state => state.currentProjectId)
  const projects = useStore(state => state.projects)
  const updateProjectLayout = useStore(state => state.updateProjectLayout)

  const currentProject = projects.find(p => p.id === currentProjectId)

  const handleDeletePlot = (plotNumber: string) => {
    setPlotToDelete(plotNumber)
    setShowDeleteConfirm(true)
  }

  const confirmDeletePlot = () => {
    if (!plotToDelete || !currentProject?.layoutTemplate) return

    // Remove from edited plots
    const newEditedPlots = { ...editedPlots }
    delete newEditedPlots[plotToDelete]
    setEditedPlots(newEditedPlots)

    const updatedPlots = Object.values(newEditedPlots)

    // Keep original plot numbers - don't renumber automatically
    updateProjectLayout(
      currentProject.layoutTemplate.rows,
      currentProject.layoutTemplate.columns,
      updatedPlots
    )

    setShowDeleteConfirm(false)
    setPlotToDelete(null)
  }

  const handleDeleteEntireLayout = () => {
    setShowLayoutDeleteConfirm(true)
  }

  const confirmDeleteLayout = () => {
    // Reset to a basic 1x1 layout with no plots
    updateProjectLayout(1, 1, [])
    setShowLayoutDeleteConfirm(false)
    onClose()
  }

  // Initialize edited plots when modal opens or project changes
  useEffect(() => {
    if (isOpen && currentProject?.layoutTemplate) {
      const initialEdited: { [key: string]: PlotDefinition } = {}
      currentProject.layoutTemplate.plotDefinitions.forEach(plot => {
        initialEdited[plot.plotNumber] = { ...plot }
      })
      setEditedPlots(initialEdited)
      setValidationErrors({})
    }
  }, [isOpen, currentProject])

  const handleEditPlot = (originalPlotNumber: string, field: keyof PlotDefinition, value: string | number) => {
    if (!currentProject?.layoutTemplate) return

    const currentPlot = editedPlots[originalPlotNumber] || 
      currentProject.layoutTemplate.plotDefinitions.find(p => p.plotNumber === originalPlotNumber)
    
    if (!currentPlot) return

    const updatedPlot = { ...currentPlot }

    if (field === 'dimension' && typeof value === 'string') {
      // Auto-calculate area for standard dimensions
      const dimensionMatch = value.match(/(\d+)[xX](\d+)/)
      if (dimensionMatch) {
        const width = parseInt(dimensionMatch[1])
        const height = parseInt(dimensionMatch[2])
        updatedPlot.dimension = value
        updatedPlot.area = width * height
      } else {
        updatedPlot[field] = value
      }
    } else {
      if (field === 'plotNumber' || field === 'dimension') {
        (updatedPlot[field] as string) = value as string
      } else if (field === 'area' || field === 'row' || field === 'col') {
        (updatedPlot[field] as number) = value as number
      }
    }

    setEditedPlots(prev => ({
      ...prev,
      [originalPlotNumber]: updatedPlot
    }))

    // Clear validation error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[`${originalPlotNumber}-${field}`]
      return newErrors
    })
  }

  const validateAndSaveChanges = () => {
    if (!currentProject?.layoutTemplate) return

    const errors: { [key: string]: string } = {}
    const allPlotNumbers = new Set<string>()
    const plotsArray = Object.values(editedPlots)

    // Check for duplicate plot numbers
    plotsArray.forEach((plot, index) => {
      if (plot.plotNumber.trim() === '') {
        errors[`${Object.keys(editedPlots)[index]}-plotNumber`] = 'Plot number cannot be empty'
      } else if (allPlotNumbers.has(plot.plotNumber)) {
        errors[`${Object.keys(editedPlots)[index]}-plotNumber`] = `Duplicate plot number: ${plot.plotNumber}`
      } else {
        allPlotNumbers.add(plot.plotNumber)
      }
    })

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      alert('Please fix validation errors before saving')
      return
    }

    setIsSaving(true)
    updateProjectLayout(
      currentProject.layoutTemplate.rows,
      currentProject.layoutTemplate.columns,
      plotsArray
    )
    setIsSaving(false)
    alert('Changes saved successfully!')
  }

  const addNewPlot = () => {
    if (!currentProject?.layoutTemplate) return

    const existingPlotsArray = Object.values(editedPlots)
    
    // Find the next available plot number
    const existingNumbers = new Set(existingPlotsArray.map(p => p.plotNumber))
    let newPlotNumber = '1'
    let counter = 1
    while (existingNumbers.has(counter.toString())) {
      counter++
    }
    newPlotNumber = counter.toString()

    // Find the best position for the new plot
    let maxRow = 0
    let maxCol = 0
    existingPlotsArray.forEach(p => {
      if (p.row > maxRow) maxRow = p.row
      if (p.col > maxCol) maxCol = p.col
    })

    // Try to find an empty spot in the existing grid first
    let foundEmptySpot = false
    let newRow = 0
    let newCol = 0

    for (let r = 0; r <= maxRow; r++) {
      for (let c = 0; c <= maxCol; c++) {
        const occupied = existingPlotsArray.some(p => p.row === r && p.col === c)
        if (!occupied) {
          newRow = r
          newCol = c
          foundEmptySpot = true
          break
        }
      }
      if (foundEmptySpot) break
    }

    // If no empty spot, add to the end
    if (!foundEmptySpot) {
      if (maxCol < currentProject.layoutTemplate.columns - 1) {
        newRow = 0
        newCol = maxCol + 1
      } else {
        newRow = maxRow + 1
        newCol = 0
      }
    }

    const newPlot: PlotDefinition = {
      plotNumber: newPlotNumber,
      dimension: '30x40',
      area: 1200,
      row: newRow,
      col: newCol
    }

    // Add to edited plots
    setEditedPlots(prev => ({
      ...prev,
      [newPlotNumber]: newPlot
    }))

    // Immediately save
    const updatedPlots = [...existingPlotsArray, newPlot]
    const newRows = Math.max(currentProject.layoutTemplate.rows, newRow + 1)
    const newCols = Math.max(currentProject.layoutTemplate.columns, newCol + 1)
    
    updateProjectLayout(newRows, newCols, updatedPlots)
    alert(`Plot ${newPlotNumber} added successfully at position Row ${newRow + 1}, Column ${newCol + 1}`)
  }

  const getPlotStatus = (plotNumber: string) => {
    const plot = layout.plots.find(p => p.plotNumber === plotNumber)
    return plot?.status || 'available'
  }

  const getPlotBookings = (plotNumber: string) => {
    const plot = layout.plots.find(p => p.plotNumber === plotNumber)
    if (plot?.status === 'booked' && plot.bookings) {
      return plot.bookings.length
    }
    return 0
  }

  const canDeletePlot = (plotNumber: string) => {
    const status = getPlotStatus(plotNumber)
    return status === 'available'
  }

  const handleBulkRenumber = () => {
    setShowRenumberDialog(true)
  }

  const applyBulkRenumber = () => {
    if (!currentProject?.layoutTemplate) return
    
    const startNum = parseInt(renumberStartFrom)
    if (isNaN(startNum) || startNum < 0) {
      alert('Please enter a valid starting number')
      return
    }

    const plotsArray = Object.values(editedPlots)
    const renumberedPlots = plotsArray.map((plot, index) => ({
      ...plot,
      plotNumber: (startNum + index).toString()
    }))

    // Update edited plots with new numbers
    const newEditedPlots: { [key: string]: PlotDefinition } = {}
    renumberedPlots.forEach(plot => {
      newEditedPlots[plot.plotNumber] = plot
    })
    setEditedPlots(newEditedPlots)

    // Save immediately
    updateProjectLayout(
      currentProject.layoutTemplate.rows,
      currentProject.layoutTemplate.columns,
      renumberedPlots
    )
    
    setShowRenumberDialog(false)
    setRenumberStartFrom('1')
    alert(`Plots renumbered starting from ${startNum}`)
  }

  if (!isOpen || !currentProject) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full h-full max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Layout: {currentProject.name}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'edit'
                  ? 'border-sizzle-red text-sizzle-red'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Edit3 className="w-4 h-4 inline mr-2" />
              Edit Plots
            </button>
            <button
              onClick={() => setActiveTab('delete')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'delete'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Delete Components
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'edit' && (
            <div className="p-6 h-full overflow-y-auto">
              <div className="space-y-6">
                {/* Add New Plot */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-green-800">Add New Plot</h3>
                      <p className="text-sm text-green-600">Add a new plot to the current layout</p>
                    </div>
                    <button
                      onClick={addNewPlot}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Plot
                    </button>
                  </div>
                </div>

                {/* Bulk Operations */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-blue-800">Bulk Operations</h3>
                      <p className="text-sm text-blue-600">Renumber all plots sequentially starting from a custom number</p>
                    </div>
                    <button
                      onClick={handleBulkRenumber}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Grid className="w-4 h-4" />
                      Renumber All
                    </button>
                  </div>
                </div>

                {/* Save Changes Button */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-yellow-800">Save Changes</h3>
                      <p className="text-sm text-yellow-600">Apply all changes made to plots</p>
                    </div>
                    <button
                      onClick={validateAndSaveChanges}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-yellow-400"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save All Changes'}
                    </button>
                  </div>
                </div>

                {/* Edit Existing Plots */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Edit Existing Plots</h3>
                  <div className="space-y-3">
                    {Object.keys(editedPlots).map(originalPlotNumber => {
                      const plot = editedPlots[originalPlotNumber]
                      return (
                        <div key={originalPlotNumber} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="grid grid-cols-6 gap-4 items-center">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Plot Number</label>
                              <input
                                type="text"
                                value={plot.plotNumber}
                                onChange={(e) => handleEditPlot(originalPlotNumber, 'plotNumber', e.target.value)}
                                className={`w-full px-3 py-2 border rounded text-sm ${
                                  validationErrors[`${originalPlotNumber}-plotNumber`] 
                                    ? 'border-red-500' 
                                    : 'border-gray-300'
                                }`}
                              />
                              {validationErrors[`${originalPlotNumber}-plotNumber`] && (
                                <p className="text-xs text-red-500 mt-1">
                                  {validationErrors[`${originalPlotNumber}-plotNumber`]}
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Dimensions</label>
                              <input
                                type="text"
                                value={plot.dimension}
                                onChange={(e) => handleEditPlot(originalPlotNumber, 'dimension', e.target.value)}
                                placeholder="30x40 or Odd"
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Area (sq ft)</label>
                              <input
                                type="number"
                                value={plot.area}
                                onChange={(e) => handleEditPlot(originalPlotNumber, 'area', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Row</label>
                              <input
                                type="number"
                                value={plot.row}
                                onChange={(e) => handleEditPlot(originalPlotNumber, 'row', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Column</label>
                              <input
                                type="number"
                                value={plot.col}
                                onChange={(e) => handleEditPlot(originalPlotNumber, 'col', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Status</label>
                              <div className="text-sm">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  getPlotStatus(originalPlotNumber) === 'available' 
                                    ? 'bg-green-100 text-green-800'
                                    : getPlotStatus(originalPlotNumber) === 'booked'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : getPlotStatus(originalPlotNumber) === 'agreement'
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {getPlotStatus(originalPlotNumber)}
                                </span>
                                {getPlotBookings(originalPlotNumber) > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {getPlotBookings(originalPlotNumber)} booking(s)
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'delete' && (
            <div className="p-6 h-full overflow-y-auto">
              <div className="space-y-6">
                {/* Warning */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-800">Deletion Warning</h3>
                      <p className="text-sm text-red-700 mt-1">
                        • Only available plots can be deleted
                        • Plots with bookings, agreements, or registrations cannot be deleted
                        • Deleting plots will renumber remaining plots
                        • This action cannot be undone
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delete Entire Layout */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-red-800">Delete Entire Layout</h3>
                      <p className="text-sm text-red-600">This will remove all plots and reset the layout</p>
                    </div>
                    <button
                      onClick={handleDeleteEntireLayout}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Layout
                    </button>
                  </div>
                </div>

                {/* Delete Individual Plots */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Delete Individual Plots</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.values(editedPlots).map(plot => {
                      const status = getPlotStatus(plot.plotNumber)
                      const canDelete = canDeletePlot(plot.plotNumber)
                      
                      return (
                        <div key={plot.plotNumber} className={`border rounded-lg p-3 ${
                          canDelete ? 'border-gray-200' : 'border-red-200 bg-red-50'
                        }`}>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">#{plot.plotNumber}</div>
                            <div className="text-sm text-gray-600">{plot.dimension}</div>
                            <div className={`text-xs mt-1 px-2 py-1 rounded ${
                              status === 'available' 
                                ? 'bg-green-100 text-green-800'
                                : status === 'booked'
                                ? 'bg-yellow-100 text-yellow-800'
                                : status === 'agreement'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {status}
                            </div>
                            
                            {canDelete ? (
                              <button
                                onClick={() => handleDeletePlot(plot.plotNumber)}
                                className="mt-2 w-full px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                <Trash2 className="w-3 h-3 inline mr-1" />
                                Delete
                              </button>
                            ) : (
                              <div className="mt-2 text-xs text-red-600">
                                Cannot delete<br />
                                (has bookings)
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {Object.keys(editedPlots).length} plots in layout
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Delete Plot Confirmation */}
      {showDeleteConfirm && plotToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Delete Plot #{plotToDelete}?</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    This will permanently remove plot #{plotToDelete} from the layout. 
                    Remaining plots will be renumbered. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePlot}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Plot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Layout Confirmation */}
      {showLayoutDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Delete Entire Layout?</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    This will permanently remove ALL plots from the layout and reset it to empty. 
                    All plot data including bookings will be lost. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowLayoutDeleteConfirm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteLayout}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Layout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renumber Dialog */}
      {showRenumberDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Renumber All Plots</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter the starting number for renumbering all plots sequentially.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start from number:
                </label>
                <input
                  type="number"
                  value={renumberStartFrom}
                  onChange={(e) => setRenumberStartFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sizzle-red focus:border-transparent outline-none"
                  placeholder="e.g., 100, 300, etc."
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                For example: If you have 20 plots and start from 100, they will be numbered 100-119.
              </p>
            </div>
            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowRenumberDialog(false)
                  setRenumberStartFrom('1')
                }}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={applyBulkRenumber}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply Renumbering
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}