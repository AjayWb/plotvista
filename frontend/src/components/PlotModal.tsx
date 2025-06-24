import { X, Plus, Trash2, Calendar, Phone, User } from 'lucide-react'
import { Plot, PlotStatus, BookingInfo } from '../types'
import { useStore } from '../hooks/useStore'
import { useState } from 'react'
import { ClientSelectionModal } from './ClientSelectionModal'
import { StatusChangeConfirmationModal } from './StatusChangeConfirmationModal'
import clsx from 'clsx'

interface PlotModalProps {
  plot: Plot
  onClose: () => void
  onStatusChange: (status: PlotStatus, bookingInfo?: BookingInfo) => void
}

export function PlotModal({ plot, onClose, onStatusChange }: PlotModalProps) {
  const [newBookingName, setNewBookingName] = useState('')
  const [newBookingPhone, setNewBookingPhone] = useState('')
  const [statusChangeBookingName, setStatusChangeBookingName] = useState('')
  const [statusChangeBookingPhone, setStatusChangeBookingPhone] = useState('')
  const [error, setError] = useState('')
  const [showClientSelection, setShowClientSelection] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<PlotStatus | null>(null)
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false)
  const [confirmationNewStatus, setConfirmationNewStatus] = useState<PlotStatus>('available')
  const [selectedBookingForStatus, setSelectedBookingForStatus] = useState<BookingInfo | undefined>()
  
  const addBooking = useStore(state => state.addBooking)
  const removeBooking = useStore(state => state.removeBooking)
  const validatePhoneNumber = useStore(state => state.validatePhoneNumber)
  
  const statusOptions: Array<{ value: PlotStatus; label: string; color: string }> = [
    { value: 'available', label: 'Available', color: 'bg-green-500 hover:bg-green-600' },
    { value: 'booked', label: 'Booked', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { value: 'agreement', label: 'Agreement', color: 'bg-orange-500 hover:bg-orange-600' },
    { value: 'registration', label: 'Registration', color: 'bg-blue-500 hover:bg-blue-600' },
  ]
  
  const handleAddBooking = () => {
    setError('')
    if (!newBookingName.trim() || !newBookingPhone.trim()) {
      setError('Both name and phone number are required')
      return
    }
    
    if (!validatePhoneNumber(newBookingPhone)) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    
    try {
      const bookingInfo: BookingInfo = {
        name: newBookingName.trim(),
        phone: newBookingPhone.trim(),
        bookingDate: new Date()
      }
      addBooking(plot.id, bookingInfo)
      setNewBookingName('')
      setNewBookingPhone('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add booking')
    }
  }
  
  const handleRemoveBooking = (phone: string) => {
    try {
      removeBooking(plot.id, phone)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove booking')
    }
  }
  
  const handleStatusChange = (newStatus: PlotStatus) => {
    setError('')
    
    if (newStatus === 'available') {
      onStatusChange(newStatus)
      return
    }
    
    // For agreement/registration, show confirmation dialog
    if (newStatus === 'agreement' || newStatus === 'registration') {
      // Check if we need client selection for multiple bookings first
      if (plot.status === 'booked' && plot.bookings && plot.bookings.length > 1) {
        setPendingStatus(newStatus)
        setShowClientSelection(true)
        return
      }
      
      // Determine the booking info to use
      let bookingInfo: BookingInfo | undefined
      if (plot.agreement) {
        bookingInfo = plot.agreement
      } else if (plot.bookings && plot.bookings.length > 0) {
        bookingInfo = plot.bookings[0]
      } else if (statusChangeBookingName.trim() && statusChangeBookingPhone.trim()) {
        if (!validatePhoneNumber(statusChangeBookingPhone)) {
          setError('Please enter a valid 10-digit phone number')
          return
        }
        bookingInfo = {
          name: statusChangeBookingName.trim(),
          phone: statusChangeBookingPhone.trim(),
          bookingDate: new Date()
        }
      } else {
        setError('Customer information is required for this status change')
        return
      }
      
      // Show confirmation dialog
      setConfirmationNewStatus(newStatus)
      setSelectedBookingForStatus(bookingInfo)
      setShowStatusConfirmation(true)
      return
    }
    
    // For booked status, require booking info
    if (!statusChangeBookingName.trim() || !statusChangeBookingPhone.trim()) {
      setError('Name and phone number are required for this status change')
      return
    }
    
    if (!validatePhoneNumber(statusChangeBookingPhone)) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    
    const bookingInfo: BookingInfo = {
      name: statusChangeBookingName.trim(),
      phone: statusChangeBookingPhone.trim(),
      bookingDate: new Date()
    }
    
    try {
      onStatusChange(newStatus, bookingInfo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change status')
    }
  }
  
  const handleClientSelection = (selectedBooking: BookingInfo) => {
    if (pendingStatus) {
      // For agreement/registration, show confirmation dialog
      if (pendingStatus === 'agreement' || pendingStatus === 'registration') {
        setConfirmationNewStatus(pendingStatus)
        setSelectedBookingForStatus(selectedBooking)
        setShowClientSelection(false)
        setShowStatusConfirmation(true)
        setPendingStatus(null)
        return
      }
      
      try {
        onStatusChange(pendingStatus, selectedBooking)
        setShowClientSelection(false)
        setPendingStatus(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to change status')
      }
    }
  }

  const handleConfirmStatusChange = () => {
    try {
      onStatusChange(confirmationNewStatus, selectedBookingForStatus)
      setShowStatusConfirmation(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change status')
    }
  }

  const handleCancelStatusChange = () => {
    setShowStatusConfirmation(false)
    setConfirmationNewStatus('available')
    setSelectedBookingForStatus(undefined)
  }
  
  const handleClientSelectionCancel = () => {
    setShowClientSelection(false)
    setPendingStatus(null)
  }
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }
  
  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Plot #{plot.plotNumber}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Plot Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Dimension</p>
              <p className="font-medium">{plot.dimension} ft</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Area</p>
              <p className="font-medium">{plot.area.toLocaleString()} sq ft</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Current Status</p>
            <p className="font-medium capitalize text-lg">{plot.status}</p>
          </div>

          {/* Current Bookings Display */}
          {plot.bookings && plot.bookings.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Bookings ({plot.bookings.length})
                </h3>
                {plot.status === 'booked' && (
                  <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                    Multiple bookings allowed
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {plot.bookings.map((booking, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{booking.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{formatPhone(booking.phone)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{formatDate(booking.bookingDate)}</span>
                        </div>
                      </div>
                      {plot.status === 'booked' && (
                        <button
                          onClick={() => handleRemoveBooking(booking.phone)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agreement Display */}
          {plot.agreement && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Agreement</h3>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-orange-600" />
                  <span className="font-medium">{plot.agreement.name}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-700">{formatPhone(plot.agreement.phone)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-600">{formatDate(plot.agreement.bookingDate)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Registration Display */}
          {plot.registration && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Registration</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{plot.registration.name}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">{formatPhone(plot.registration.phone)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">{formatDate(plot.registration.bookingDate)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Add New Booking (only for booked status) */}
          {plot.status === 'booked' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Booking</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={newBookingName}
                    onChange={(e) => setNewBookingName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newBookingPhone}
                    onChange={(e) => setNewBookingPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleAddBooking}
                  disabled={!newBookingName.trim() || !newBookingPhone.trim()}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Booking
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Status Change Section */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Status</h3>
            
            {/* Booking Info for Status Change - Show when changing from available OR when not dealing with multiple bookings */}
            {!(
              (plot.status === 'booked' && plot.bookings && plot.bookings.length > 1)
            ) && (
              <div className="mb-4 space-y-3">
                <p className="text-sm text-gray-600">
                  {plot.status === 'available' 
                    ? 'Customer details required for booking/agreement/registration:'
                    : 'Customer details required for status change:'
                  }
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={statusChangeBookingName}
                      onChange={(e) => setStatusChangeBookingName(e.target.value)}
                      placeholder="Enter customer name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={statusChangeBookingPhone}
                      onChange={(e) => setStatusChangeBookingPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="10-digit phone"
                      maxLength={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Special message for multiple bookings */}
            {plot.status === 'booked' && plot.bookings && plot.bookings.length > 1 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 This plot has {plot.bookings.length} bookings. For Agreement or Registration, you'll be asked to select which client to keep.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={plot.status === option.value}
                  className={clsx(
                    'py-3 px-4 rounded-lg text-white font-medium transition-colors',
                    plot.status === option.value
                      ? 'bg-gray-300 cursor-not-allowed'
                      : option.color
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Client Selection Modal */}
      {showClientSelection && pendingStatus && plot.bookings && (
        <ClientSelectionModal
          bookings={plot.bookings}
          targetStatus={pendingStatus}
          plotNumber={plot.plotNumber}
          onConfirm={handleClientSelection}
          onCancel={handleClientSelectionCancel}
        />
      )}

      {/* Status Change Confirmation Modal */}
      <StatusChangeConfirmationModal
        isOpen={showStatusConfirmation}
        plot={plot}
        newStatus={confirmationNewStatus}
        selectedBooking={selectedBookingForStatus}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
      />
    </div>
  )
}