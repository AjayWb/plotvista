import { useState, useRef, useEffect } from 'react'
import { 
  Grid, Plus, Minus, Save, Edit3, Trash2, 
  MousePointer, Square, Copy, Move, RotateCw,
  ChevronRight, Info, Maximize2, Package
} from 'lucide-react'
import { PlotDefinition } from '../types'
import clsx from 'clsx'

interface LayoutEditorProps {
  projectName: string
  initialRows?: number
  initialCols?: number
  initialPlots?: PlotDefinition[]
  isEditing?: boolean
  onSave: (rows: number, cols: number, plots: PlotDefinition[]) => void
  onCancel: () => void
}

type Tool = 'select' | 'draw' | 'dimension' | 'delete' | 'move'
type DimensionPreset = { width: number; height: number; label: string; color: string }

const DIMENSION_PRESETS: DimensionPreset[] = [
  { width: 30, height: 40, label: '30×40', color: 'bg-blue-500' },
  { width: 30, height: 50, label: '30×50', color: 'bg-green-500' },
  { width: 40, height: 40, label: '40×40', color: 'bg-purple-500' },
  { width: 60, height: 40, label: '60×40', color: 'bg-orange-500' },
  { width: 40, height: 60, label: '40×60', color: 'bg-pink-500' },
  { width: 50, height: 80, label: '50×80', color: 'bg-indigo-500' },
]

export function LayoutEditor({
  projectName,
  initialRows = 10,
  initialCols = 10,
  initialPlots = [],
  isEditing = false,
  onSave,
  onCancel
}: LayoutEditorProps) {
  const [rows, setRows] = useState(initialRows)
  const [columns, setColumns] = useState(initialCols)
  const [plots, setPlots] = useState<PlotDefinition[]>([])
  const [selectedPlots, setSelectedPlots] = useState<Set<string>>(new Set())
  const [hoveredPlot, setHoveredPlot] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<Tool>('select')
  const [activePreset, setActivePreset] = useState<DimensionPreset>(DIMENSION_PRESETS[0])
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const [oddArea, setOddArea] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null)
  const [showHelp, setShowHelp] = useState(!isEditing)
  const [copiedPlots, setCopiedPlots] = useState<PlotDefinition[]>([])
  const [history, setHistory] = useState<PlotDefinition[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const gridRef = useRef<HTMLDivElement>(null)

  // Initialize plots
  useEffect(() => {
    if (initialPlots.length > 0) {
      setPlots(initialPlots)
      addToHistory(initialPlots)
    } else {
      initializePlots()
    }
  }, [])

  const initializePlots = () => {
    const newPlots: PlotDefinition[] = []
    let plotNumber = 1
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        newPlots.push({
          plotNumber: plotNumber.toString(),
          dimension: '',
          area: 0,
          row,
          col
        })
        plotNumber++
      }
    }
    
    setPlots(newPlots)
    addToHistory(newPlots)
  }

  const addToHistory = (newPlots: PlotDefinition[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newPlots])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setPlots([...history[historyIndex - 1]])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setPlots([...history[historyIndex + 1]])
    }
  }

  const getPlotKey = (row: number, col: number) => `${row}-${col}`

  const getPlotAtPosition = (row: number, col: number) => {
    return plots.find(p => p.row === row && p.col === col)
  }

  const handleCellClick = (row: number, col: number) => {
    const plot = getPlotAtPosition(row, col)
    if (!plot) return

    switch (activeTool) {
      case 'select':
        toggleSelection(plot.plotNumber)
        break
      case 'draw':
        if (plot.dimension === '') {
          applyDimensionToPlot(plot.plotNumber)
        }
        break
      case 'dimension':
        if (selectedPlots.size > 0) {
          applyDimensionToSelected()
        } else {
          applyDimensionToPlot(plot.plotNumber)
        }
        break
      case 'delete':
        deletePlot(plot.plotNumber)
        break
    }
  }

  const handleCellMouseDown = (row: number, col: number) => {
    if (activeTool === 'select') {
      setIsDragging(true)
      setDragStart({ row, col })
      setSelectedPlots(new Set())
    }
  }

  const handleCellMouseEnter = (row: number, col: number) => {
    const plot = getPlotAtPosition(row, col)
    if (plot) {
      setHoveredPlot(plot.plotNumber)
      
      if (isDragging && dragStart) {
        // Select all plots in rectangle
        const minRow = Math.min(dragStart.row, row)
        const maxRow = Math.max(dragStart.row, row)
        const minCol = Math.min(dragStart.col, col)
        const maxCol = Math.max(dragStart.col, col)
        
        const selected = new Set<string>()
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            const p = getPlotAtPosition(r, c)
            if (p) selected.add(p.plotNumber)
          }
        }
        setSelectedPlots(selected)
      }
      
      if (activeTool === 'draw' && isDragging) {
        if (plot.dimension === '') {
          applyDimensionToPlot(plot.plotNumber)
        }
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  const toggleSelection = (plotNumber: string) => {
    const newSelected = new Set(selectedPlots)
    if (newSelected.has(plotNumber)) {
      newSelected.delete(plotNumber)
    } else {
      newSelected.add(plotNumber)
    }
    setSelectedPlots(newSelected)
  }

  const applyDimensionToPlot = (plotNumber: string) => {
    const dimension = customWidth && customHeight 
      ? `${customWidth}×${customHeight}`
      : activePreset.label
    
    const area = customWidth && customHeight
      ? parseInt(customWidth) * parseInt(customHeight)
      : activePreset.width * activePreset.height
    
    const newPlots = plots.map(plot => 
      plot.plotNumber === plotNumber 
        ? { ...plot, dimension, area }
        : plot
    )
    
    setPlots(newPlots)
    addToHistory(newPlots)
  }

  const applyDimensionToSelected = () => {
    const dimension = customWidth && customHeight 
      ? `${customWidth}×${customHeight}`
      : oddArea 
        ? 'Odd'
        : activePreset.label
    
    const area = customWidth && customHeight
      ? parseInt(customWidth) * parseInt(customHeight)
      : oddArea
        ? parseInt(oddArea) || 0
        : activePreset.width * activePreset.height
    
    const newPlots = plots.map(plot => 
      selectedPlots.has(plot.plotNumber)
        ? { ...plot, dimension, area }
        : plot
    )
    
    setPlots(newPlots)
    addToHistory(newPlots)
    setSelectedPlots(new Set())
  }

  const deletePlot = (plotNumber: string) => {
    const newPlots = plots.map(plot => 
      plot.plotNumber === plotNumber 
        ? { ...plot, dimension: '', area: 0 }
        : plot
    )
    
    setPlots(newPlots)
    addToHistory(newPlots)
  }

  const addRow = () => {
    const newPlots = [...plots]
    const maxPlotNumber = Math.max(...plots.map(p => parseInt(p.plotNumber)))
    
    for (let col = 0; col < columns; col++) {
      newPlots.push({
        plotNumber: (maxPlotNumber + col + 1).toString(),
        dimension: '',
        area: 0,
        row: rows,
        col
      })
    }
    
    setRows(rows + 1)
    setPlots(newPlots)
    addToHistory(newPlots)
  }

  const addColumn = () => {
    const newPlots = [...plots]
    const maxPlotNumber = Math.max(...plots.map(p => parseInt(p.plotNumber)))
    
    for (let row = 0; row < rows; row++) {
      newPlots.push({
        plotNumber: (maxPlotNumber + row + 1).toString(),
        dimension: '',
        area: 0,
        row,
        col: columns
      })
    }
    
    setColumns(columns + 1)
    setPlots(newPlots)
    addToHistory(newPlots)
  }

  const copySelected = () => {
    const copied = plots.filter(p => selectedPlots.has(p.plotNumber))
    setCopiedPlots(copied)
  }

  const pasteClipboard = () => {
    if (copiedPlots.length === 0 || selectedPlots.size === 0) return
    
    const targetPlot = plots.find(p => selectedPlots.has(p.plotNumber))
    if (!targetPlot) return
    
    const offsetRow = targetPlot.row - copiedPlots[0].row
    const offsetCol = targetPlot.col - copiedPlots[0].col
    
    const newPlots = [...plots]
    copiedPlots.forEach(copied => {
      const targetRow = copied.row + offsetRow
      const targetCol = copied.col + offsetCol
      const target = newPlots.find(p => p.row === targetRow && p.col === targetCol)
      
      if (target) {
        target.dimension = copied.dimension
        target.area = copied.area
      }
    })
    
    setPlots(newPlots)
    addToHistory(newPlots)
    setSelectedPlots(new Set())
  }

  const getPlotColor = (plot: PlotDefinition) => {
    if (!plot.dimension) return 'bg-gray-100'
    if (plot.dimension === 'Odd') return 'bg-gray-500'
    
    const preset = DIMENSION_PRESETS.find(p => p.label === plot.dimension)
    return preset?.color || 'bg-cyan-500'
  }

  const getStats = () => {
    const stats = new Map<string, { count: number; area: number }>()
    let totalArea = 0
    let filledPlots = 0
    
    plots.forEach(plot => {
      if (plot.dimension) {
        filledPlots++
        totalArea += plot.area
        const current = stats.get(plot.dimension) || { count: 0, area: 0 }
        stats.set(plot.dimension, {
          count: current.count + 1,
          area: current.area + plot.area
        })
      }
    })
    
    return { stats, totalArea, filledPlots, emptyPlots: plots.length - filledPlots }
  }

  const { stats, totalArea, filledPlots, emptyPlots } = getStats()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-[1600px] h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Layout' : 'Create Layout'}: {projectName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {filledPlots} of {plots.length} plots configured • {totalArea.toLocaleString()} sq ft total
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Info className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-1 bg-gray-200 rounded-lg p-1">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 hover:bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RotateCw className="w-4 h-4 rotate-180" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 hover:bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Toolbar */}
          <div className="w-80 border-r bg-gray-50 flex flex-col">
            {/* Tools */}
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tools</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveTool('select')}
                  className={clsx(
                    "p-3 rounded-lg border transition-all flex flex-col items-center gap-1",
                    activeTool === 'select' 
                      ? "bg-blue-50 border-blue-500 text-blue-700" 
                      : "bg-white border-gray-300 hover:border-gray-400"
                  )}
                >
                  <MousePointer className="w-5 h-5" />
                  <span className="text-xs">Select</span>
                </button>
                <button
                  onClick={() => setActiveTool('draw')}
                  className={clsx(
                    "p-3 rounded-lg border transition-all flex flex-col items-center gap-1",
                    activeTool === 'draw' 
                      ? "bg-blue-50 border-blue-500 text-blue-700" 
                      : "bg-white border-gray-300 hover:border-gray-400"
                  )}
                >
                  <Edit3 className="w-5 h-5" />
                  <span className="text-xs">Draw</span>
                </button>
                <button
                  onClick={() => setActiveTool('dimension')}
                  className={clsx(
                    "p-3 rounded-lg border transition-all flex flex-col items-center gap-1",
                    activeTool === 'dimension' 
                      ? "bg-blue-50 border-blue-500 text-blue-700" 
                      : "bg-white border-gray-300 hover:border-gray-400"
                  )}
                >
                  <Square className="w-5 h-5" />
                  <span className="text-xs">Dimension</span>
                </button>
                <button
                  onClick={() => setActiveTool('delete')}
                  className={clsx(
                    "p-3 rounded-lg border transition-all flex flex-col items-center gap-1",
                    activeTool === 'delete' 
                      ? "bg-red-50 border-red-500 text-red-700" 
                      : "bg-white border-gray-300 hover:border-gray-400"
                  )}
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="text-xs">Delete</span>
                </button>
                <button
                  onClick={copySelected}
                  disabled={selectedPlots.size === 0}
                  className="p-3 rounded-lg border bg-white border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex flex-col items-center gap-1"
                >
                  <Copy className="w-5 h-5" />
                  <span className="text-xs">Copy</span>
                </button>
                <button
                  onClick={pasteClipboard}
                  disabled={copiedPlots.length === 0 || selectedPlots.size === 0}
                  className="p-3 rounded-lg border bg-white border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex flex-col items-center gap-1"
                >
                  <Package className="w-5 h-5" />
                  <span className="text-xs">Paste</span>
                </button>
              </div>
            </div>

            {/* Dimensions */}
            <div className="p-4 border-b flex-1 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Dimensions</h3>
              
              {/* Preset Dimensions */}
              <div className="space-y-2 mb-4">
                {DIMENSION_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setActivePreset(preset)
                      setCustomWidth('')
                      setCustomHeight('')
                      setOddArea('')
                    }}
                    className={clsx(
                      "w-full p-3 rounded-lg border transition-all flex items-center justify-between",
                      activePreset.label === preset.label && !customWidth && !oddArea
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={clsx("w-4 h-4 rounded", preset.color)} />
                      <span className="font-medium">{preset.label} ft</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {preset.width * preset.height} sq ft
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Dimension */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-600 mb-2">Custom Size</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => {
                      setCustomWidth(e.target.value)
                      setOddArea('')
                    }}
                    placeholder="W"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-gray-500">×</span>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => {
                      setCustomHeight(e.target.value)
                      setOddArea('')
                    }}
                    placeholder="H"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-xs text-gray-500">ft</span>
                </div>
                {customWidth && customHeight && (
                  <p className="text-xs text-gray-600 mt-1">
                    = {parseInt(customWidth) * parseInt(customHeight)} sq ft
                  </p>
                )}
              </div>

              {/* Odd Size */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-600 mb-2">Odd/Irregular</h4>
                <input
                  type="number"
                  value={oddArea}
                  onChange={(e) => {
                    setOddArea(e.target.value)
                    setCustomWidth('')
                    setCustomHeight('')
                  }}
                  placeholder="Total area in sq ft"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {selectedPlots.size > 0 && (
                <button
                  onClick={applyDimensionToSelected}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Apply to {selectedPlots.size} Selected
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="p-4 bg-white border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Statistics</h3>
              <div className="space-y-2 text-sm">
                {Array.from(stats).map(([dimension, stat]) => (
                  <div key={dimension} className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className={clsx(
                        "w-3 h-3 rounded",
                        DIMENSION_PRESETS.find(p => p.label === dimension)?.color || 
                        (dimension === 'Odd' ? 'bg-gray-500' : 'bg-cyan-500')
                      )} />
                      {dimension}
                    </span>
                    <span className="text-gray-600">{stat.count} plots</span>
                  </div>
                ))}
                {emptyPlots > 0 && (
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Empty</span>
                    <span>{emptyPlots} plots</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grid Area */}
          <div className="flex-1 flex flex-col">
            {/* Grid Controls */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Grid:</span>
                  <span className="font-medium">{rows} × {columns}</span>
                </div>
                {isEditing && (
                  <>
                    <button
                      onClick={addRow}
                      className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Row
                    </button>
                    <button
                      onClick={addColumn}
                      className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Column
                    </button>
                  </>
                )}
              </div>
              
              {selectedPlots.size > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {selectedPlots.size} selected
                  </span>
                  <button
                    onClick={() => setSelectedPlots(new Set())}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>

            {/* Grid */}
            <div 
              ref={gridRef}
              className="flex-1 p-6 overflow-auto bg-gray-100"
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div 
                className="inline-grid gap-1 bg-white p-4 rounded-lg shadow-sm"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: rows }, (_, row) => 
                  Array.from({ length: columns }, (_, col) => {
                    const plot = getPlotAtPosition(row, col)
                    if (!plot) return null
                    
                    const isSelected = selectedPlots.has(plot.plotNumber)
                    const isHovered = hoveredPlot === plot.plotNumber
                    
                    return (
                      <div
                        key={getPlotKey(row, col)}
                        onMouseDown={() => handleCellMouseDown(row, col)}
                        onMouseEnter={() => handleCellMouseEnter(row, col)}
                        onClick={() => handleCellClick(row, col)}
                        className={clsx(
                          "relative p-2 rounded cursor-pointer transition-all min-w-[60px] min-h-[50px] flex flex-col items-center justify-center",
                          plot.dimension ? getPlotColor(plot) : 'bg-gray-100 border-2 border-dashed border-gray-300',
                          plot.dimension && 'text-white',
                          isSelected && 'ring-2 ring-blue-500 ring-offset-2',
                          isHovered && !isSelected && 'ring-2 ring-gray-400 ring-offset-1',
                          activeTool === 'delete' && isHovered && 'opacity-50'
                        )}
                      >
                        <div className="text-xs font-bold">#{plot.plotNumber}</div>
                        {plot.dimension && (
                          <div className="text-xs">{plot.dimension}</div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Help Overlay */}
        {showHelp && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-8 z-10">
            <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">How to Use Layout Editor</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Tools:</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• <strong>Select:</strong> Click plots or drag to select multiple</li>
                    <li>• <strong>Draw:</strong> Click and drag to apply dimensions</li>
                    <li>• <strong>Dimension:</strong> Apply to selected plots</li>
                    <li>• <strong>Delete:</strong> Click to remove plot dimensions</li>
                    <li>• <strong>Copy/Paste:</strong> Duplicate plot configurations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Quick Tips:</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Drag to select multiple plots at once</li>
                    <li>• Use Draw tool for quick filling</li>
                    <li>• Custom dimensions update in real-time</li>
                    <li>• Undo/Redo with arrow buttons</li>
                    <li>• Add rows/columns in edit mode</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <span className="text-gray-600">Total Area:</span>
              <span className="ml-2 font-semibold">{totalArea.toLocaleString()} sq ft</span>
              <span className="ml-1 text-gray-500">({(totalArea / 43560).toFixed(2)} acres)</span>
            </div>
            
            <button
              onClick={() => onSave(rows, columns, plots)}
              disabled={filledPlots === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Save Changes' : 'Create Layout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}