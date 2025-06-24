import { useState } from 'react'
import { Plus, Trash2, Save, X } from 'lucide-react'
import { PlotDefinition } from '../types'
import clsx from 'clsx'

interface SimpleLayoutEditorProps {
  projectName: string
  initialPlots?: PlotDefinition[]
  isEditing?: boolean
  onSave: (rows: number, cols: number, plots: PlotDefinition[]) => void
  onCancel: () => void
}

interface DimensionEntry {
  id: string
  length: string
  breadth: string
  plotCount: string
  isOdd: boolean
  oddArea?: string
}

export function SimpleLayoutEditor({
  projectName,
  initialPlots = [],
  isEditing = false,
  onSave,
  onCancel
}: SimpleLayoutEditorProps) {
  // Initialize dimensions from existing plots
  const initializeDimensions = () => {
    if (initialPlots.length === 0) {
      return [{ id: '1', length: '', breadth: '', plotCount: '', isOdd: false, oddArea: '' }]
    }
    
    const dimensionGroups = new Map<string, PlotDefinition[]>()
    initialPlots.forEach(plot => {
      const key = plot.dimension
      if (!dimensionGroups.has(key)) {
        dimensionGroups.set(key, [])
      }
      dimensionGroups.get(key)!.push(plot)
    })
    
    return Array.from(dimensionGroups.entries()).map(([dimension, plots], index) => {
      const isOdd = dimension === 'Odd' || !dimension.includes('×')
      if (isOdd) {
        return {
          id: (index + 1).toString(),
          length: '',
          breadth: '',
          plotCount: plots.length.toString(),
          isOdd: true,
          oddArea: plots[0]?.area.toString() || ''
        }
      } else {
        const [length, breadth] = dimension.split('×')
        return {
          id: (index + 1).toString(),
          length: length || '',
          breadth: breadth || '',
          plotCount: plots.length.toString(),
          isOdd: false,
          oddArea: ''
        }
      }
    })
  }

  const [dimensions, setDimensions] = useState<DimensionEntry[]>(initializeDimensions())
  const [plots, setPlots] = useState<PlotDefinition[]>(() => {
    // Generate plots from dimensions or use initial plots
    if (initialPlots.length > 0) {
      return initialPlots
    }
    return []
  })

  const addDimension = () => {
    const newId = (dimensions.length + 1).toString()
    const updated = [{ 
      id: newId, 
      length: '', 
      breadth: '', 
      plotCount: '', 
      isOdd: false,
      oddArea: ''
    }, ...dimensions]
    console.log('Adding dimension, updated array:', updated)
    setDimensions(updated)
    // Don't regenerate plots for empty dimension
  }

  const removeDimension = (id: string) => {
    const updated = dimensions.filter(d => d.id !== id)
    setDimensions(updated)
    // Regenerate plots with remaining dimensions
    setTimeout(() => regeneratePlots(updated), 0)
  }

  const updateDimension = (id: string, field: keyof DimensionEntry, value: string | boolean) => {
    console.log(`Updating dimension ${id}, field: ${field}, value: ${value}`)
    const updated = dimensions.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    )
    console.log('Updated dimensions array:', updated)
    setDimensions(updated)
    // Regenerate plots whenever dimensions change
    setTimeout(() => regeneratePlots(updated), 0)
  }

  const regeneratePlots = (currentDimensions: DimensionEntry[]) => {
    console.log('Regenerating plots with dimensions:', currentDimensions)
    let plotNumber = 1
    const newPlots: PlotDefinition[] = []
    
    currentDimensions.forEach((dim, dimIndex) => {
      const count = parseInt(dim.plotCount) || 0
      console.log(`Dimension ${dimIndex + 1}: ${dim.length}×${dim.breadth}, count: ${count}, isOdd: ${dim.isOdd}`)
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          let dimension: string
          let area: number
          
          if (dim.isOdd) {
            // For odd plots, check if dimensions are provided
            const length = parseInt(dim.length) || 0
            const breadth = parseInt(dim.breadth) || 0
            const oddArea = parseInt(dim.oddArea || '') || 0
            
            if (length > 0 && breadth > 0) {
              // Has dimensions - show them
              dimension = `${length}×${breadth} (Odd)`
              area = length * breadth
            } else if (oddArea > 0) {
              // Has area but no dimensions
              dimension = 'Odd'
              area = oddArea
            } else {
              // No dimensions or area - still create plot
              dimension = 'Odd'
              area = 0
            }
          } else {
            const length = parseInt(dim.length) || 0
            const breadth = parseInt(dim.breadth) || 0
            if (length > 0 && breadth > 0) {
              dimension = `${length}×${breadth}`
              area = length * breadth
            } else {
              // Skip plots without proper dimensions for regular plots
              console.log(`Skipping plot ${plotNumber} - incomplete dimensions`)
              continue
            }
          }
          
          newPlots.push({
            plotNumber: plotNumber.toString(),
            dimension,
            area,
            row: Math.floor((plotNumber - 1) / 10),
            col: (plotNumber - 1) % 10
          })
          plotNumber++
        }
      }
    })
    
    console.log('Generated plots:', newPlots)
    setPlots(newPlots)
  }

  const updatePlotNumber = (oldNumber: string, newNumber: string) => {
    if (!newNumber.trim() || plots.some(p => p.plotNumber === newNumber && p.plotNumber !== oldNumber)) {
      return // Invalid or duplicate number
    }
    
    setPlots(plots.map(p => 
      p.plotNumber === oldNumber 
        ? { ...p, plotNumber: newNumber }
        : p
    ))
  }

  const deletePlot = (plotNumber: string) => {
    setPlots(plots.filter(p => p.plotNumber !== plotNumber))
  }

  const getTotalArea = () => {
    return plots.reduce((sum, plot) => sum + plot.area, 0)
  }

  const getGridDimensions = () => {
    const maxRow = Math.max(...plots.map(p => p.row), 0)
    const maxCol = Math.max(...plots.map(p => p.col), 0)
    return { rows: maxRow + 1, cols: maxCol + 1 }
  }

  const handleSave = () => {
    if (plots.length === 0) return
    
    const { rows, cols } = getGridDimensions()
    onSave(rows, cols, plots)
  }

  const canSave = plots.length > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full h-full max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Layout' : 'Create Layout'}: {projectName}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Define plot dimensions and quantities
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Dimensions */}
          <div className="w-1/3 border-r bg-gray-50 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Plot Dimensions</h3>
                <button
                  onClick={addDimension}
                  className="flex items-center gap-1 px-3 py-1 bg-sizzle-red text-white text-sm rounded hover:bg-red-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {dimensions.map((dim, index) => (
                <div key={dim.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">
                      Dimension {index + 1}
                    </span>
                    {dimensions.length > 1 && (
                      <button
                        onClick={() => removeDimension(dim.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`odd-${dim.id}`}
                        checked={dim.isOdd}
                        onChange={(e) => updateDimension(dim.id, 'isOdd', e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor={`odd-${dim.id}`} className="text-sm text-gray-600">
                        Odd shaped plot
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Length (ft) {dim.isOdd ? '(optional)' : ''}
                        </label>
                        <input
                          type="number"
                          value={dim.length}
                          onChange={(e) => updateDimension(dim.id, 'length', e.target.value)}
                          placeholder="30"
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-sizzle-red focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Breadth (ft) {dim.isOdd ? '(optional)' : ''}
                        </label>
                        <input
                          type="number"
                          value={dim.breadth}
                          onChange={(e) => updateDimension(dim.id, 'breadth', e.target.value)}
                          placeholder="40"
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-sizzle-red focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    {dim.isOdd && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Total Area (sq ft) - optional
                        </label>
                        <input
                          type="number"
                          value={dim.oddArea || ''}
                          onChange={(e) => updateDimension(dim.id, 'oddArea', e.target.value)}
                          placeholder="1500"
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-sizzle-red focus:border-transparent outline-none"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Leave empty if area is unknown
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Number of plots
                      </label>
                      <input
                        type="number"
                        value={dim.plotCount}
                        onChange={(e) => updateDimension(dim.id, 'plotCount', e.target.value)}
                        placeholder="10"
                        min="0"
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-sizzle-red focus:border-transparent outline-none"
                      />
                    </div>

                    {dim.length && dim.breadth && (
                      <div className="text-sm text-gray-600">
                        Area: {parseInt(dim.length) * parseInt(dim.breadth)} sq ft
                        {dim.isOdd && ' (from dimensions)'}
                      </div>
                    )}
                    {dim.isOdd && dim.oddArea && !dim.length && !dim.breadth && (
                      <div className="text-sm text-gray-600">
                        Area: {dim.oddArea} sq ft (specified)
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                <div className="text-sm space-y-1">
                  <div>Dimensions Count: {dimensions.length}</div>
                  <div>Total Plots: {plots.length}</div>
                  <div>Total Area: {getTotalArea().toLocaleString()} sq ft</div>
                  <div>({(getTotalArea() / 43560).toFixed(2)} acres)</div>
                </div>
              </div>

              {/* Debug Info */}
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <h5 className="font-medium text-yellow-800 mb-2">Debug Info</h5>
                <div className="text-xs space-y-1">
                  {dimensions.map(dim => (
                    <div key={dim.id}>
                      Dim {dim.id}: {dim.length}×{dim.breadth} ({dim.plotCount} plots) 
                      {dim.isOdd ? `[ODD${dim.oddArea ? `, area: ${dim.oddArea}` : ''}]` : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Visual Layout */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Visual Layout</h3>
              
              {plots.length > 0 ? (
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(10, 1fr)` }}>
                  {plots.map((plot) => (
                    <div
                      key={plot.plotNumber}
                      className="relative group bg-gray-100 border border-gray-300 rounded p-2 hover:bg-gray-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={plot.plotNumber}
                          onChange={(e) => updatePlotNumber(plot.plotNumber, e.target.value)}
                          className="w-8 text-xs font-medium bg-transparent border-none outline-none"
                        />
                        <button
                          onClick={() => deletePlot(plot.plotNumber)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {plot.dimension}
                      </div>
                      {plot.area > 0 && (
                        <div className="text-xs text-gray-500">
                          {plot.area} sq ft
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-lg mb-2">No plots defined</div>
                  <div className="text-sm">Add dimensions on the left to see plots here</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {plots.length} plots configured
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={clsx(
                "px-6 py-2 rounded-lg font-medium transition-colors",
                canSave
                  ? "bg-sizzle-red text-white hover:bg-red-700"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              )}
            >
              <Save className="w-4 h-4 inline mr-2" />
              {isEditing ? 'Save Changes' : 'Create Layout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}