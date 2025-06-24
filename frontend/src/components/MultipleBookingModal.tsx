import { useState, useEffect } from 'react'
import { X, Plus, Minus, AlertCircle, Check } from 'lucide-react'
import { useStore } from '../hooks/useStore'
import { BookingInfo } from '../types'

interface MultipleBookingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MultipleBookingModal({ isOpen, onClose }: MultipleBookingModalProps) {
  const [selectedPlots, setSelectedPlots] = useState<Set<string>>(new Set())
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0])
  const [showExistingCustomer, setShowExistingCustomer] = useState(false)
  const [existingPlots, setExistingPlots] = useState<string[]>([])

  const layout = useStore(state => state.layout)
  const bookMultiplePlots = useStore(state => state.bookMultiplePlots)
  const checkPhoneExistsInProject = useStore(state => state.checkPhoneExistsInProject)
  const validatePhoneNumber = useStore(state => state.validatePhoneNumber)

  // Get available plots
  const availablePlots = layout.plots.filter(plot => plot.status === 'available')

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedPlots(new Set())
      setCustomerName('')
      setCustomerPhone('')
      setBookingDate(new Date().toISOString().split('T')[0])
      setShowExistingCustomer(false)
      setExistingPlots([])
    }
  }, [isOpen])

  // Check for existing customer when phone changes
  useEffect(() => {
    if (customerPhone.length === 10) {
      const phoneCheck = checkPhoneExistsInProject(customerPhone)
      if (phoneCheck.exists) {
        setShowExistingCustomer(true)
        setExistingPlots(phoneCheck.plots)
      } else {
        setShowExistingCustomer(false)
        setExistingPlots([])
      }
    } else {
      setShowExistingCustomer(false)
      setExistingPlots([])
    }
  }, [customerPhone, checkPhoneExistsInProject])

  const togglePlotSelection = (plotId: string) => {
    const newSelection = new Set(selectedPlots)
    if (newSelection.has(plotId)) {
      newSelection.delete(plotId)
    } else {
      newSelection.add(plotId)
    }
    setSelectedPlots(newSelection)
  }

  const selectAllPlots = () => {
    setSelectedPlots(new Set(availablePlots.map(p => p.id)))
  }

  const clearSelection = () => {
    setSelectedPlots(new Set())
  }

  const handleSubmit = () => {
    if (selectedPlots.size === 0) {
      alert('Please select at least one plot')
      return
    }

    if (!customerName.trim()) {
      alert('Please enter customer name')
      return
    }

    if (!validatePhoneNumber(customerPhone)) {
      alert('Please enter a valid 10-digit phone number')
      return
    }

    try {
      const bookingInfo: BookingInfo = {
        name: customerName.trim(),
        phone: customerPhone,
        bookingDate: new Date(bookingDate)
      }

      bookMultiplePlots(Array.from(selectedPlots), bookingInfo)
      onClose()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to book plots')
    }
  }

  const canSubmit = selectedPlots.size > 0 && customerName.trim() && validatePhoneNumber(customerPhone)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Multiple Plot Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Plot Selection */}
          <div className="w-1/2 border-r p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">Select Plots ({selectedPlots.size} selected)</h3>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllPlots}
                    className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-sm px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {availablePlots.map(plot => (
                  <button
                    key={plot.id}
                    onClick={() => togglePlotSelection(plot.id)}
                    className={`p-2 border rounded text-sm font-medium transition-colors ${
                      selectedPlots.has(plot.id)
                        ? 'bg-sizzle-red text-white border-sizzle-red'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div>{plot.plotNumber}</div>
                    <div className="text-xs opacity-75">{plot.dimension}</div>
                  </button>
                ))}
              </div>

              {availablePlots.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No available plots to book
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Customer Details */}
          <div className="w-1/2 p-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Customer Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sizzle-red focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sizzle-red focus:border-transparent outline-none"
                />
              </div>

              {showExistingCustomer && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-800">Existing Customer</div>
                      <div className="text-sm text-yellow-700 mt-1">
                        This phone number already has bookings for plots: {existingPlots.join(', ')}
                      </div>
                      <div className="text-sm text-yellow-700 mt-1">
                        You can proceed to book additional plots for this customer.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Date *
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sizzle-red focus:border-transparent outline-none"
                />
              </div>

              {/* Selected Plots Summary */}
              {selectedPlots.size > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="font-medium text-blue-800 mb-2">
                    Selected Plots ({selectedPlots.size})
                  </div>
                  <div className="text-sm text-blue-700">
                    {Array.from(selectedPlots)
                      .map(plotId => {
                        const plot = availablePlots.find(p => p.id === plotId)
                        return plot ? `${plot.plotNumber} (${plot.dimension})` : ''
                      })
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                  <div className="text-sm text-blue-700 mt-2">
                    Total Area: {Array.from(selectedPlots)
                      .reduce((total, plotId) => {
                        const plot = availablePlots.find(p => p.id === plotId)
                        return total + (plot?.area || 0)
                      }, 0)
                      .toLocaleString()} sq ft
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedPlots.size} plots selected for booking
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                canSubmit
                  ? 'bg-sizzle-red text-white hover:bg-red-700'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4 inline mr-2" />
              Book {selectedPlots.size} Plot{selectedPlots.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}