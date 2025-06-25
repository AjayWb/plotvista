import { useState, useEffect } from 'react'
import { 
  Grid, Ruler, AlertCircle, Check, 
  Plus, Minus, Zap, Edit3, Square
} from 'lucide-react'
import { PlotDefinition } from '../types'
import clsx from 'clsx'

interface LayoutBuilderV2Props {
  projectName: string
  onSave: (rows: number, cols: number, plots: PlotDefinition[]) => void
  onCancel: () => void
}

interface QuickTemplate {
  name: string
  width: number
  height: number
  percentage: number
  color: string
}

const quickTemplates: QuickTemplate[] = [
  { name: '30×40', width: 30, height: 40, percentage: 35, color: 'bg-blue-500' },
  { name: '30×50', width: 30, height: 50, percentage: 20, color: 'bg-green-500' },
  { name: '40×40', width: 40, height: 40, percentage: 10, color: 'bg-purple-500' },
  { name: '60×40', width: 60, height: 40, percentage: 10, color: 'bg-orange-500' },
]

export function LayoutBuilderV2({ projectName, onSave, onCancel }: LayoutBuilderV2Props) {
  const [rows, setRows] = useState(10)
  const [columns, setColumns] = useState(10)
  const [plots, setPlots] = useState<PlotDefinition[]>([])
  const [selectedPlots, setSelectedPlots] = useState<Set<string>>(new Set())
  const [selectedTemplate, setSelectedTemplate] = useState<QuickTemplate | null>(quickTemplates[0])
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const [oddPlotArea, setOddPlotArea] = useState('')
  const [step, setStep] = useState<'grid' | 'assign' | 'confirm'>('grid')
  const [brushMode, setBrushMode] = useState(false)
  
  // Initialize plots when grid changes
  useEffect(() => {
    if (step === 'assign' && plots.length === 0) {
      initializePlots()
    }
  }, [step, rows, columns])
  
  const initializePlots = () => {
    const newPlots: PlotDefinition[] = []
    let plotNumber = 1
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Default to most common size
        const defaultTemplate = quickTemplates[0]
        newPlots.push({
          plotNumber: plotNumber.toString(),
          dimension: defaultTemplate.name,
          area: defaultTemplate.width * defaultTemplate.height,
          row,
          col
        })
        plotNumber++
      }
    }
    
    setPlots(newPlots)
  }
  
  const handlePlotClick = (plotNumber: string) => {
    if (!brushMode) {
      const newSelected = new Set(selectedPlots)
      if (newSelected.has(plotNumber)) {
        newSelected.delete(plotNumber)
      } else {
        newSelected.add(plotNumber)
      }
      setSelectedPlots(newSelected)
    }
  }
  
  const handlePlotHover = (plotNumber: string) => {
    if (brushMode && selectedTemplate) {
      applyTemplateToPplot(plotNumber)
    }
  }
  
  const applyTemplateToPplot = (plotNumber: string) => {
    setPlots(plots.map(plot => {
      if (plot.plotNumber === plotNumber) {
        if (selectedTemplate) {
          return {
            ...plot,
            dimension: selectedTemplate.name,
            area: selectedTemplate.width * selectedTemplate.height
          }
        }
      }
      return plot
    }))
  }
  
  const applyTemplateToSelected = () => {
    if (!selectedTemplate && !customWidth) return
    
    const dimension = selectedTemplate 
      ? selectedTemplate.name 
      : customWidth && customHeight 
        ? `${customWidth}×${customHeight}`
        : 'Odd'
    
    const area = selectedTemplate
      ? selectedTemplate.width * selectedTemplate.height
      : customWidth && customHeight
        ? parseInt(customWidth) * parseInt(customHeight)
        : parseInt(oddPlotArea) || 0
    
    setPlots(plots.map(plot => {
      if (selectedPlots.has(plot.plotNumber)) {
        return { ...plot, dimension, area }
      }
      return plot
    }))
    
    setSelectedPlots(new Set())
  }
  
  const selectAllWithDimension = (dimension: string) => {
    const matchingPlots = plots.filter(p => p.dimension === dimension)
    setSelectedPlots(new Set(matchingPlots.map(p => p.plotNumber)))
  }
  
  const getPlotStats = () => {
    const stats = new Map<string, { count: number, area: number }>()
    plots.forEach(plot => {
      const current = stats.get(plot.dimension) || { count: 0, area: 0 }
      stats.set(plot.dimension, {
        count: current.count + 1,
        area: current.area + plot.area
      })
    })
    return stats
  }
  
  const getTotalArea = () => {
    return plots.reduce((sum, plot) => sum + plot.area, 0)
  }
  
  const getPlotColor = (dimension: string) => {
    const template = quickTemplates.find(t => t.name === dimension)
    return template?.color || 'bg-gray-500'
  }
  
  const confirmAndSave = () => {
    onSave(rows, columns, plots)
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-sizzle-red to-red-700">
          <h2 className="text-2xl font-bold text-white">Create Layout for {projectName}</h2>
          <div className="flex items-center gap-6 mt-2">
            <div className={clsx("flex items-center gap-2", step === 'grid' ? 'text-white' : 'text-red-200')}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                {step === 'grid' ? '1' : <Check className="w-4 h-4" />}
              </div>
              <span className="text-sm font-medium">Define Grid</span>
            </div>
            <div className={clsx("flex items-center gap-2", step === 'assign' ? 'text-white' : step === 'confirm' ? 'text-red-200' : 'text-red-300')}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                {step === 'confirm' ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Assign Dimensions</span>
            </div>
            <div className={clsx("flex items-center gap-2", step === 'confirm' ? 'text-white' : 'text-red-300')}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">3</div>
              <span className="text-sm font-medium">Review & Confirm</span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {step === 'grid' && (
            <div className="p-8 space-y-6">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Grid className="w-6 h-6 text-sizzle-red" />
                  Define Your Layout Grid
                </h3>
                
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Number of Rows
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setRows(Math.max(1, rows - 1))}
                        className="p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <input
                        type="number"
                        value={rows}
                        onChange={(e) => setRows(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                        className="w-24 px-4 py-3 text-center text-xl font-semibold border-2 rounded-lg focus:border-sizzle-red focus:outline-none"
                      />
                      <button
                        onClick={() => setRows(Math.min(50, rows + 1))}
                        className="p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Number of Columns
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setColumns(Math.max(1, columns - 1))}
                        className="p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <input
                        type="number"
                        value={columns}
                        onChange={(e) => setColumns(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                        className="w-24 px-4 py-3 text-center text-xl font-semibold border-2 rounded-lg focus:border-sizzle-red focus:outline-none"
                      />
                      <button
                        onClick={() => setColumns(Math.min(50, columns + 1))}
                        className="p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Total Plots</h4>
                  <p className="text-3xl font-bold text-blue-600">{rows * columns} plots</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Arranged in a {rows} × {columns} grid
                  </p>
                </div>
                
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <AlertCircle className="inline w-4 h-4 mr-1" />
                    Next, you'll assign dimensions to each plot. 75% of plots typically use standard sizes.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {step === 'assign' && (
            <div className="flex h-full">
              {/* Left Panel - Tools */}
              <div className="w-80 border-r bg-gray-50 p-6 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Plot Dimensions</h3>
                
                {/* Quick Templates */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Quick Templates (75% of plots)
                  </h4>
                  <div className="space-y-2">
                    {quickTemplates.map(template => (
                      <button
                        key={template.name}
                        onClick={() => {
                          setSelectedTemplate(template)
                          setCustomWidth('')
                          setCustomHeight('')
                        }}
                        className={clsx(
                          "w-full p-3 rounded-lg border-2 transition-all flex items-center justify-between",
                          selectedTemplate?.name === template.name
                            ? "border-sizzle-red bg-red-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={clsx("w-4 h-4 rounded", template.color)} />
                          <span className="font-medium">{template.name} ft</span>
                        </div>
                        <span className="text-sm text-gray-500">{template.percentage}%</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Custom Dimensions */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Custom Dimensions
                  </h4>
                  <div className="space-y-3">
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={customWidth}
                        onChange={(e) => {
                          setCustomWidth(e.target.value)
                          setSelectedTemplate(null)
                        }}
                        placeholder="Width"
                        className="flex-1 px-3 py-2 border rounded-lg focus:border-sizzle-red focus:outline-none"
                      />
                      <span className="text-gray-500">×</span>
                      <input
                        type="number"
                        value={customHeight}
                        onChange={(e) => {
                          setCustomHeight(e.target.value)
                          setSelectedTemplate(null)
                        }}
                        placeholder="Height"
                        className="flex-1 px-3 py-2 border rounded-lg focus:border-sizzle-red focus:outline-none"
                      />
                      <span className="text-sm text-gray-500">ft</span>
                    </div>
                  </div>
                </div>
                
                {/* Odd Plots */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Square className="w-4 h-4" />
                    Odd/Irregular Plots
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedTemplate(null)
                      setCustomWidth('')
                      setCustomHeight('')
                    }}
                    className={clsx(
                      "w-full p-3 rounded-lg border-2 transition-all",
                      !selectedTemplate && !customWidth && !customHeight
                        ? "border-sizzle-red bg-red-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    <span className="font-medium">Odd Shape</span>
                  </button>
                  <input
                    type="number"
                    value={oddPlotArea}
                    onChange={(e) => setOddPlotArea(e.target.value)}
                    placeholder="Total area (sq ft)"
                    className="w-full mt-2 px-3 py-2 border rounded-lg focus:border-sizzle-red focus:outline-none"
                  />
                </div>
                
                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={applyTemplateToSelected}
                    disabled={selectedPlots.size === 0}
                    className="w-full py-2 px-4 bg-sizzle-red text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Apply to {selectedPlots.size} Selected
                  </button>
                  
                  <button
                    onClick={() => setBrushMode(!brushMode)}
                    className={clsx(
                      "w-full py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2",
                      brushMode
                        ? "bg-purple-600 text-white"
                        : "border border-purple-600 text-purple-600 hover:bg-purple-50"
                    )}
                  >
                    <Edit3 className="w-4 h-4" />
                    {brushMode ? 'Brush Mode On' : 'Enable Brush Mode'}
                  </button>
                </div>
                
                {/* Stats */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Current Distribution</h4>
                  <div className="space-y-2 text-sm">
                    {Array.from(getPlotStats()).map(([dimension, stats]) => (
                      <button
                        key={dimension}
                        onClick={() => selectAllWithDimension(dimension)}
                        className="w-full flex justify-between items-center p-2 hover:bg-gray-100 rounded"
                      >
                        <span className="flex items-center gap-2">
                          <div className={clsx("w-3 h-3 rounded", getPlotColor(dimension))} />
                          {dimension}
                        </span>
                        <span className="text-gray-600">{stats.count} plots</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Area:</span>
                      <span className="font-bold">{getTotalArea().toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                      <span>Approx:</span>
                      <span>{(getTotalArea() / 43560).toFixed(2)} acres</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Panel - Grid */}
              <div className="flex-1 p-6 overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Click to select plots • {selectedPlots.size} selected
                  </h3>
                  <button
                    onClick={() => setSelectedPlots(new Set(plots.map(p => p.plotNumber)))}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {selectedPlots.size === plots.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <div 
                  className="inline-grid gap-1 p-4 bg-gray-100 rounded-lg"
                  style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                >
                  {plots.map(plot => (
                    <div
                      key={plot.plotNumber}
                      onClick={() => handlePlotClick(plot.plotNumber)}
                      onMouseEnter={() => handlePlotHover(plot.plotNumber)}
                      className={clsx(
                        "p-2 rounded cursor-pointer transition-all text-center",
                        selectedPlots.has(plot.plotNumber)
                          ? "ring-2 ring-sizzle-red ring-offset-1"
                          : "",
                        getPlotColor(plot.dimension),
                        "text-white hover:opacity-90"
                      )}
                    >
                      <div className="text-xs font-bold">#{plot.plotNumber}</div>
                      <div className="text-xs">{plot.dimension}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {step === 'confirm' && (
            <div className="p-8 space-y-6">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold mb-6">Review Your Layout</h3>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-blue-700 mb-2">Total Plots</h4>
                    <p className="text-3xl font-bold text-blue-900">{plots.length}</p>
                    <p className="text-sm text-blue-600 mt-1">{rows} × {columns} grid</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-green-700 mb-2">Total Area</h4>
                    <p className="text-3xl font-bold text-green-900">{getTotalArea().toLocaleString()}</p>
                    <p className="text-sm text-green-600 mt-1">sq ft ({(getTotalArea() / 43560).toFixed(2)} acres)</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-purple-700 mb-2">Plot Types</h4>
                    <p className="text-3xl font-bold text-purple-900">{getPlotStats().size}</p>
                    <p className="text-sm text-purple-600 mt-1">unique dimensions</p>
                  </div>
                </div>
                
                {/* Distribution Chart */}
                <div className="bg-white border rounded-lg p-6 mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Plot Distribution</h4>
                  <div className="space-y-3">
                    {Array.from(getPlotStats()).map(([dimension, stats]) => {
                      const percentage = (stats.count / plots.length) * 100
                      return (
                        <div key={dimension}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <div className={clsx("w-3 h-3 rounded", getPlotColor(dimension))} />
                              {dimension}
                            </span>
                            <span className="text-sm text-gray-600">
                              {stats.count} plots ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={clsx("h-2 rounded-full", getPlotColor(dimension))}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {/* Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Important</h4>
                    <p className="text-sm text-amber-800 mt-1">
                      Once created, the layout structure cannot be changed. You can only modify plot status and bookings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <button
            onClick={step === 'grid' ? onCancel : () => setStep(step === 'assign' ? 'grid' : 'assign')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {step === 'grid' ? 'Cancel' : 'Back'}
          </button>
          
          {step === 'grid' && (
            <button
              onClick={() => setStep('assign')}
              className="px-6 py-2 bg-sizzle-red text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              Next: Assign Dimensions
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          
          {step === 'assign' && (
            <button
              onClick={() => setStep('confirm')}
              className="px-6 py-2 bg-sizzle-red text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              Review Layout
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          
          {step === 'confirm' && (
            <button
              onClick={confirmAndSave}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Create Layout
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Add missing import
import { ArrowRight } from 'lucide-react'