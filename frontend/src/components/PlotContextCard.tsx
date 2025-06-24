import { useState } from 'react'
import { 
  X, User, Phone, Calendar, MapPin, Home, 
  ArrowRight, Plus, Settings, Eye, Trash2,
  CheckCircle, Clock, FileText
} from 'lucide-react'
import { Plot, PlotStatus, BookingInfo } from '../types'
import { useStore } from '../hooks/useStore'
import { BookingFlowModal } from './BookingFlowModal'
import { ClientSelectionModal } from './ClientSelectionModal'

interface PlotContextCardProps {
  plot: Plot
  onClose: () => void
}

export function PlotContextCard({ plot, onClose }: PlotContextCardProps) {
  const [showBookingFlow, setShowBookingFlow] = useState(false)
  const [showClientSelection, setShowClientSelection] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<PlotStatus | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const updatePlotStatus = useStore(state => state.updatePlotStatus)
  const addBooking = useStore(state => state.addBooking)
  const removeBooking = useStore(state => state.removeBooking)
  const isManager = useStore(state => state.user?.role === 'manager')
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date))
  }
  
  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  
  const handleBookingComplete = async (bookingInfo: BookingInfo) => {
    await updatePlotStatus(plot.id, 'booked', bookingInfo)
    setShowBookingFlow(false)
  }
  
  const handleStatusChange = (newStatus: PlotStatus) => {
    if (newStatus === 'available') {
      updatePlotStatus(plot.id, 'available')
      onClose()
      return
    }
    
    // Check if we need client selection
    if ((newStatus === 'agreement' || newStatus === 'registration') && 
        plot.status === 'booked' && 
        plot.bookings && 
        plot.bookings.length > 1) {
      setPendingStatus(newStatus)
      setShowClientSelection(true)
      return
    }
    
    // For single booking or direct status changes
    if (plot.bookings && plot.bookings.length === 1) {
      updatePlotStatus(plot.id, newStatus, plot.bookings[0])
      onClose()
    } else if (plot.agreement) {
      updatePlotStatus(plot.id, newStatus, plot.agreement)
      onClose()
    }
  }
  
  const handleClientSelection = (selectedBooking: BookingInfo) => {
    if (pendingStatus) {
      updatePlotStatus(plot.id, pendingStatus, selectedBooking)
      setShowClientSelection(false)
      setPendingStatus(null)
      onClose() // Close the main modal after status change
    }
  }
  
  const handleAddBooking = async (bookingInfo: BookingInfo) => {
    await addBooking(plot.id, bookingInfo)
    setShowBookingFlow(false)
  }
  
  const getStatusColor = (status: PlotStatus) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200'
      case 'booked': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'agreement': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'registration': return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }
  
  const getStatusIcon = (status: PlotStatus) => {
    switch (status) {
      case 'available': return <Home className="w-4 h-4" />
      case 'booked': return <Clock className="w-4 h-4" />
      case 'agreement': return <FileText className="w-4 h-4" />
      case 'registration': return <CheckCircle className="w-4 h-4" />
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <h2 className="text-xl font-semibold text-gray-900">Plot #{plot.plotNumber}</h2>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(plot.status)}`}>
                {getStatusIcon(plot.status)}
                <span className="capitalize">{plot.status}</span>
                {plot.bookings && plot.bookings.length > 1 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {plot.bookings.length}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close context card"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Plot Details */}
          <div className="p-6 border-b bg-gray-50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Dimensions</span>
                <p className="font-medium text-gray-900">{plot.dimension} ft</p>
              </div>
              <div>
                <span className="text-gray-600">Area</span>
                <p className="font-medium text-gray-900">{plot.area.toLocaleString()} sq ft</p>
              </div>
            </div>
          </div>

          {/* Status-Specific Content */}
          <div className="p-6">
            {/* Available Plot */}
            {plot.status === 'available' && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <Home className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Book</h3>
                  <p className="text-sm text-gray-600">This plot is available for new customers.</p>
                </div>
                
                {isManager && (
                  <button
                    onClick={() => setShowBookingFlow(true)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Book This Plot
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Booked Plot */}
            {plot.status === 'booked' && plot.bookings && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {plot.bookings.length === 1 ? 'Customer' : `${plot.bookings.length} Customers`}
                  </h3>
                  {plot.bookings.length > 1 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Multiple Interest
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {plot.bookings.slice(0, 2).map((booking, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{booking.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Phone className="w-3 h-3" />
                            <span>{formatPhone(booking.phone)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>Booked {formatDate(booking.bookingDate)}</span>
                          </div>
                        </div>
                        {isManager && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeBooking(plot.id, booking.phone)
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Remove booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {plot.bookings.length > 2 && (
                    <div className="text-center py-2">
                      <span className="text-sm text-gray-500">
                        +{plot.bookings.length - 2} more customer{plot.bookings.length > 3 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {isManager && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-900">Next Steps</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {plot.bookings.length === 1 ? (
                        <>
                          <button
                            onClick={() => handleStatusChange('agreement')}
                            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <FileText className="w-4 h-4" />
                            Move to Agreement
                          </button>
                          <button
                            onClick={() => setShowBookingFlow(true)}
                            className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Add Another Customer
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStatusChange('agreement')}
                            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <FileText className="w-4 h-4" />
                            Move to Agreement
                            <span className="text-xs font-normal">+{plot.bookings.length - 1} more</span>
                          </button>
                          <button
                            onClick={() => setShowBookingFlow(true)}
                            className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Add Another Customer
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Agreement Plot */}
            {plot.status === 'agreement' && plot.agreement && (
              <div className="space-y-4">
                <div className="text-center py-2">
                  <FileText className="w-10 h-10 text-orange-500 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900">Agreement Stage</h3>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-gray-900">{plot.agreement.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Phone className="w-3 h-3" />
                    <span>{formatPhone(plot.agreement.phone)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Agreement since {formatDate(plot.agreement.bookingDate)}</span>
                  </div>
                </div>

                {isManager && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-medium text-gray-900">Next Steps</h4>
                    <button
                      onClick={() => handleStatusChange('registration')}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Move to Registration
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Registration Plot */}
            {plot.status === 'registration' && plot.registration && (
              <div className="space-y-4">
                <div className="text-center py-2">
                  <CheckCircle className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900">Registration Complete</h3>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900">{plot.registration.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Phone className="w-3 h-3" />
                    <span>{formatPhone(plot.registration.phone)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Registered on {formatDate(plot.registration.bookingDate)}</span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-green-800 font-medium">🎉 Plot Successfully Sold!</p>
                </div>
              </div>
            )}

            {/* Advanced Actions */}
            {isManager && (
              <div className="pt-4 border-t mt-6">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => handleStatusChange('available')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Home className="inline w-4 h-4 mr-2" />
                      Reset to Available
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Eye className="inline w-4 h-4 mr-2" />
                      View Full History
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBookingFlow && (
        <BookingFlowModal
          plot={plot}
          onClose={() => setShowBookingFlow(false)}
          onComplete={plot.status === 'available' ? handleBookingComplete : handleAddBooking}
        />
      )}

      {showClientSelection && pendingStatus && plot.bookings && (
        <ClientSelectionModal
          bookings={plot.bookings}
          targetStatus={pendingStatus}
          plotNumber={plot.plotNumber}
          onConfirm={handleClientSelection}
          onCancel={() => {
            setShowClientSelection(false)
            setPendingStatus(null)
          }}
        />
      )}
    </>
  )
}