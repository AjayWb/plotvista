import { useState } from 'react'
import { X, Download, FileSpreadsheet } from 'lucide-react'
import { useStore } from '../hooks/useStore'
import { Plot, Project, BookingInfo } from '../types'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ExportData {
  projectName: string
  plotNumber: string
  plotDimension: string
  plotArea: number
  plotPosition: string
  status: string
  customerName: string
  customerPhone: string
  bookingDate: string
  agreementDate: string
  registrationDate: string
  multipleBookings: string
  totalBookings: number
  plotValue: string
  remarks: string
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv')
  const [includeMultipleBookings, setIncludeMultipleBookings] = useState(true)
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'quarter' | 'year'>('all')
  const [isExporting, setIsExporting] = useState(false)

  const projects = useStore(state => state.projects)
  const currentProjectId = useStore(state => state.currentProjectId)
  const layout = useStore(state => state.layout)

  const handleProjectToggle = (projectId: string) => {
    const newSelected = new Set(selectedProjects)
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId)
    } else {
      newSelected.add(projectId)
    }
    setSelectedProjects(newSelected)
  }

  const selectAllProjects = () => {
    setSelectedProjects(new Set(projects.map(p => p.id)))
  }

  const clearSelection = () => {
    setSelectedProjects(new Set())
  }

  const generateExportData = (): ExportData[] => {
    const exportData: ExportData[] = []
    const targetProjects = selectedProjects.size > 0 
      ? projects.filter(p => selectedProjects.has(p.id))
      : projects

    targetProjects.forEach(project => {
      // Get plots for this project
      const projectPlots = project.id === currentProjectId 
        ? layout.plots 
        : [] // Would need to load other project layouts

      if (project.id === currentProjectId) {
        projectPlots.forEach(plot => {
          // Create base entry for each plot
          const baseEntry = {
            projectName: project.name,
            plotNumber: plot.plotNumber,
            plotDimension: plot.dimension,
            plotArea: plot.area,
            plotPosition: `Row ${plot.row + 1}, Col ${plot.col + 1}`,
            status: plot.status.charAt(0).toUpperCase() + plot.status.slice(1),
            plotValue: `₹${(plot.area * 500).toLocaleString()}`, // Example pricing
            remarks: ''
          }

          if (plot.status === 'available') {
            exportData.push({
              ...baseEntry,
              customerName: '',
              customerPhone: '',
              bookingDate: '',
              agreementDate: '',
              registrationDate: '',
              multipleBookings: '',
              totalBookings: 0
            })
          } else if (plot.status === 'booked' && plot.bookings) {
            // Handle multiple bookings
            if (includeMultipleBookings && plot.bookings.length > 1) {
              plot.bookings.forEach((booking, index) => {
                exportData.push({
                  ...baseEntry,
                  customerName: booking.name,
                  customerPhone: booking.phone,
                  bookingDate: new Date(booking.bookingDate).toLocaleDateString(),
                  agreementDate: '',
                  registrationDate: '',
                  multipleBookings: `Booking ${index + 1} of ${plot.bookings!.length}`,
                  totalBookings: plot.bookings!.length,
                  remarks: plot.bookings!.length > 1 ? 'Multiple interested customers' : ''
                })
              })
            } else {
              const primaryBooking = plot.bookings[0]
              exportData.push({
                ...baseEntry,
                customerName: primaryBooking.name,
                customerPhone: primaryBooking.phone,
                bookingDate: new Date(primaryBooking.bookingDate).toLocaleDateString(),
                agreementDate: '',
                registrationDate: '',
                multipleBookings: plot.bookings.length > 1 ? `Primary (${plot.bookings.length} total)` : '',
                totalBookings: plot.bookings.length,
                remarks: plot.bookings.length > 1 ? `${plot.bookings.length - 1} other interested customers` : ''
              })
            }
          } else if (plot.status === 'agreement' && plot.agreement) {
            exportData.push({
              ...baseEntry,
              customerName: plot.agreement.name,
              customerPhone: plot.agreement.phone,
              bookingDate: plot.bookings?.[0] ? new Date(plot.bookings[0].bookingDate).toLocaleDateString() : '',
              agreementDate: new Date(plot.agreement.bookingDate).toLocaleDateString(),
              registrationDate: '',
              multipleBookings: '',
              totalBookings: 1,
              remarks: 'Agreement executed'
            })
          } else if (plot.status === 'registration' && plot.registration) {
            exportData.push({
              ...baseEntry,
              customerName: plot.registration.name,
              customerPhone: plot.registration.phone,
              bookingDate: plot.bookings?.[0] ? new Date(plot.bookings[0].bookingDate).toLocaleDateString() : '',
              agreementDate: plot.agreement ? new Date(plot.agreement.bookingDate).toLocaleDateString() : '',
              registrationDate: new Date(plot.registration.bookingDate).toLocaleDateString(),
              multipleBookings: '',
              totalBookings: 1,
              remarks: 'Registration completed'
            })
          }
        })
      } else {
        // For other projects, add placeholder entry
        exportData.push({
          projectName: project.name,
          plotNumber: 'N/A',
          plotDimension: 'N/A',
          plotArea: 0,
          plotPosition: 'N/A',
          status: 'Project Not Loaded',
          customerName: '',
          customerPhone: '',
          bookingDate: '',
          agreementDate: '',
          registrationDate: '',
          multipleBookings: '',
          totalBookings: 0,
          plotValue: '',
          remarks: 'Switch to this project to export detailed data'
        })
      }
    })

    return exportData
  }

  const downloadCSV = (data: ExportData[]) => {
    const headers = [
      'Project Name',
      'Plot Number',
      'Dimensions',
      'Area (sq ft)',
      'Position',
      'Status',
      'Customer Name',
      'Phone Number',
      'Booking Date',
      'Agreement Date',
      'Registration Date',
      'Multiple Bookings',
      'Total Bookings',
      'Plot Value',
      'Remarks'
    ]

    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        `"${row.projectName}"`,
        `"${row.plotNumber}"`,
        `"${row.plotDimension}"`,
        row.plotArea,
        `"${row.plotPosition}"`,
        `"${row.status}"`,
        `"${row.customerName}"`,
        `"${row.customerPhone}"`,
        `"${row.bookingDate}"`,
        `"${row.agreementDate}"`,
        `"${row.registrationDate}"`,
        `"${row.multipleBookings}"`,
        row.totalBookings,
        `"${row.plotValue}"`,
        `"${row.remarks}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `plotvista-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const data = generateExportData()
      
      if (exportFormat === 'csv') {
        downloadCSV(data)
      } else {
        // For Excel format, we'll use CSV for now as a fallback
        // In production, you'd use a library like xlsx
        downloadCSV(data)
        alert('Excel format export coming soon! Downloaded as CSV for now.')
      }
      
      onClose()
    } catch (error) {
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const getExportStats = () => {
    const data = generateExportData()
    const stats = {
      totalPlots: data.length,
      customers: new Set(data.map(d => d.customerPhone).filter(Boolean)).size,
      projects: selectedProjects.size || projects.length,
      multipleBookings: data.filter(d => d.totalBookings > 1).length
    }
    return stats
  }

  const stats = getExportStats()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Export Customer Data</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Projects to Export
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={selectAllProjects}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Clear All
                </button>
              </div>
              {projects.map(project => (
                <label key={project.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProjects.has(project.id)}
                    onChange={() => handleProjectToggle(project.id)}
                    className="rounded border-gray-300 text-sizzle-red focus:ring-sizzle-red"
                  />
                  <span className="text-sm text-gray-700">
                    {project.name} ({project.totalPlots} plots)
                    {project.id === currentProjectId && (
                      <span className="text-green-600 text-xs ml-1">(Current)</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'excel')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sizzle-red focus:border-transparent"
              >
                <option value="csv">CSV (Excel Compatible)</option>
                <option value="excel">Excel (.xlsx) - Coming Soon</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Filter
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sizzle-red focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMultipleBookings}
                onChange={(e) => setIncludeMultipleBookings(e.target.checked)}
                className="rounded border-gray-300 text-sizzle-red focus:ring-sizzle-red"
              />
              <span className="text-sm text-gray-700">
                Include all multiple bookings (separate rows for each interested customer)
              </span>
            </label>
          </div>

          {/* Export Preview Stats */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Export Preview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Total Plots:</span>
                <span className="font-medium text-blue-800 ml-2">{stats.totalPlots}</span>
              </div>
              <div>
                <span className="text-blue-600">Unique Customers:</span>
                <span className="font-medium text-blue-800 ml-2">{stats.customers}</span>
              </div>
              <div>
                <span className="text-blue-600">Projects:</span>
                <span className="font-medium text-blue-800 ml-2">{stats.projects}</span>
              </div>
              <div>
                <span className="text-blue-600">Multiple Bookings:</span>
                <span className="font-medium text-blue-800 ml-2">{stats.multipleBookings}</span>
              </div>
            </div>
          </div>

          {/* Export Data Columns Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Exported Columns</h3>
            <div className="text-xs text-gray-600 grid grid-cols-2 gap-1">
              <div>• Project Name</div>
              <div>• Plot Number</div>
              <div>• Dimensions</div>
              <div>• Area (sq ft)</div>
              <div>• Position (Row, Col)</div>
              <div>• Status</div>
              <div>• Customer Name</div>
              <div>• Phone Number</div>
              <div>• Booking Date</div>
              <div>• Agreement Date</div>
              <div>• Registration Date</div>
              <div>• Multiple Bookings Info</div>
              <div>• Total Bookings Count</div>
              <div>• Plot Value</div>
              <div>• Remarks</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedProjects.size > 0 ? `${selectedProjects.size} projects selected` : 'All projects selected'}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || (selectedProjects.size === 0 && projects.length === 0)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isExporting
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Download className="w-4 h-4 inline mr-2" />
              {isExporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}