import { useState, useRef } from 'react'
import { 
  Grid, Upload, AlertCircle, Check, 
  FileSpreadsheet, Plus, Minus, Save
} from 'lucide-react'
import { PlotDefinition } from '../types'
// import * as XLSX from 'xlsx' // TODO: Install xlsx package
import clsx from 'clsx'

interface LayoutBuilderProps {
  onSave: (rows: number, cols: number, plots: PlotDefinition[]) => void
  onCancel: () => void
}

export function LayoutBuilder({ onSave, onCancel }: LayoutBuilderProps) {
  const [rows, setRows] = useState(10)
  const [columns, setColumns] = useState(10)
  const [plots, setPlots] = useState<PlotDefinition[]>([])
  const [selectedPlots, setSelectedPlots] = useState<Set<string>>(new Set())
  const [defaultDimension, setDefaultDimension] = useState('30×40')
  const [customDimension, setCustomDimension] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Generate initial plots
  const generatePlots = () => {
    const newPlots: PlotDefinition[] = []
    let plotNumber = 1
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const dimension = defaultDimension === 'custom' ? (customDimension || 'Odd') : defaultDimension
        const [width, height] = dimension.includes('×') 
          ? dimension.split('×').map(n => parseInt(n)) 
          : [0, 0]
        
        newPlots.push({
          plotNumber: plotNumber.toString(),
          dimension: dimension,
          area: width * height || 0,
          row,
          col
        })
        plotNumber++
      }
    }
    
    setPlots(newPlots)
    setError('')
  }
  
  const handleDimensionChange = (dimension: string) => {
    const updatedPlots = plots.map(plot => {
      if (selectedPlots.has(plot.plotNumber)) {
        const [width, height] = dimension.includes('×') 
          ? dimension.split('×').map(n => parseInt(n)) 
          : [0, 0]
        return {
          ...plot,
          dimension,
          area: width * height || 0
        }
      }
      return plot
    })
    setPlots(updatedPlots)
  }
  
  const togglePlotSelection = (plotNumber: string) => {
    const newSelected = new Set(selectedPlots)
    if (newSelected.has(plotNumber)) {
      newSelected.delete(plotNumber)
    } else {
      newSelected.add(plotNumber)
    }
    setSelectedPlots(newSelected)
  }
  
  const selectAllPlots = () => {
    if (selectedPlots.size === plots.length) {
      setSelectedPlots(new Set())
    } else {
      setSelectedPlots(new Set(plots.map(p => p.plotNumber)))
    }
  }
  
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implement Excel upload after installing xlsx package
    setError('Excel import coming soon. Please use manual configuration.')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  const downloadTemplate = () => {
    // TODO: Implement template download after installing xlsx package
    const template = `PlotNumber,Dimension,Row,Column
1,30×40,0,0
2,30×40,0,1
3,30×50,0,2
4,Odd,1,0`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'layout_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }
  
  const handleSave = () => {
    if (plots.length === 0) {
      setError('Please generate plots first')
      return
    }
    
    setShowPreview(true)
  }
  
  const confirmSave = () => {
    onSave(rows, columns, plots)
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Create New Layout</h2>
          <p className="text-sm text-gray-600 mt-1">Define plot arrangement and dimensions</p>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showPreview ? (
            <div className="space-y-6">
              {/* Grid Configuration */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Grid className="w-5 h-5" />
                  Grid Configuration
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Rows
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRows(Math.max(1, rows - 1))}
                        className="p-2 border rounded hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={rows}
                        onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-3 py-2 border rounded text-center"
                        min="1"
                        max="50"
                      />
                      <button
                        onClick={() => setRows(Math.min(50, rows + 1))}
                        className="p-2 border rounded hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Columns
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setColumns(Math.max(1, columns - 1))}
                        className="p-2 border rounded hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={columns}
                        onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-3 py-2 border rounded text-center"
                        min="1"
                        max="50"
                      />
                      <button
                        onClick={() => setColumns(Math.min(50, columns + 1))}
                        className="p-2 border rounded hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Plot Dimension
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      value={defaultDimension}
                      onChange={(e) => setDefaultDimension(e.target.value)}
                      className="px-3 py-2 border rounded"
                    >
                      <option value="30×40">30×40 ft</option>
                      <option value="30×50">30×50 ft</option>
                      <option value="40×60">40×60 ft</option>
                      <option value="50×80">50×80 ft</option>
                      <option value="custom">Custom</option>
                      <option value="Odd">Odd (Irregular)</option>
                    </select>
                    
                    {defaultDimension === 'custom' && (
                      <input
                        type="text"
                        value={customDimension}
                        onChange={(e) => setCustomDimension(e.target.value)}
                        placeholder="e.g., 35×45"
                        className="px-3 py-2 border rounded"
                      />
                    )}
                  </div>
                </div>
                
                <button
                  onClick={generatePlots}
                  className="mt-4 px-4 py-2 bg-sizzle-red text-white rounded hover:bg-red-700 transition-colors"
                >
                  Generate Plots
                </button>
              </div>
              
              {/* Excel Import */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Excel Import (Optional)
                </h3>
                
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Upload an Excel file with columns: PlotNumber, Dimension, Row, Column
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Excel
                    </button>
                    
                    <button
                      onClick={downloadTemplate}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                      Download Template
                    </button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    className="hidden"
                  />
                </div>
              </div>
              
              {/* Plot Preview/Editor */}
              {plots.length > 0 && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">
                      Plot Configuration ({plots.length} plots)
                    </h3>
                    <button
                      onClick={selectAllPlots}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {selectedPlots.size === plots.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  
                  {selectedPlots.size > 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded flex items-center gap-3">
                      <span className="text-sm text-gray-700">
                        {selectedPlots.size} plots selected. Set dimension:
                      </span>
                      <select
                        onChange={(e) => handleDimensionChange(e.target.value)}
                        className="px-3 py-1 border rounded text-sm"
                        defaultValue=""
                      >
                        <option value="" disabled>Choose dimension</option>
                        <option value="30×40">30×40 ft</option>
                        <option value="30×50">30×50 ft</option>
                        <option value="40×60">40×60 ft</option>
                        <option value="50×80">50×80 ft</option>
                        <option value="Odd">Odd (Irregular)</option>
                      </select>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-10 gap-1 max-h-96 overflow-auto">
                    {plots.map(plot => (
                      <div
                        key={plot.plotNumber}
                        onClick={() => togglePlotSelection(plot.plotNumber)}
                        className={clsx(
                          "p-2 border rounded cursor-pointer text-xs text-center transition-colors",
                          selectedPlots.has(plot.plotNumber)
                            ? "bg-blue-100 border-blue-500"
                            : "hover:bg-gray-50"
                        )}
                      >
                        <div className="font-medium">#{plot.plotNumber}</div>
                        <div className="text-gray-600">{plot.dimension}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}
            </div>
          ) : (
            /* Preview Mode */
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Confirm Layout Creation
                </h3>
                <p className="text-sm text-amber-800">
                  You are about to create a layout with <strong>{plots.length} plots</strong> arranged in 
                  a <strong>{rows} × {columns}</strong> grid. This will define the structure for your project.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Layout Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Plots:</span>
                    <span className="ml-2 font-medium">{plots.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Grid Size:</span>
                    <span className="ml-2 font-medium">{rows} × {columns}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="ml-2 font-medium">
                      {[...new Set(plots.map(p => p.dimension))].join(', ')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 max-h-96 overflow-auto">
                <h4 className="font-medium text-gray-900 mb-3">Plot Preview</h4>
                <div 
                  className="grid gap-1"
                  style={{ 
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    fontSize: '10px'
                  }}
                >
                  {plots.map(plot => (
                    <div
                      key={plot.plotNumber}
                      className="p-1 border rounded bg-gray-50 text-center"
                    >
                      <div className="font-medium">#{plot.plotNumber}</div>
                      <div className="text-gray-600">{plot.dimension}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          
          {!showPreview ? (
            <button
              onClick={handleSave}
              disabled={plots.length === 0}
              className="px-6 py-2 bg-sizzle-red text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Preview & Save
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Back to Edit
              </button>
              <button
                onClick={confirmSave}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirm & Create
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}