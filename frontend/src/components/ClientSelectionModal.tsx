import { X, User, Phone, Calendar, AlertTriangle } from 'lucide-react'
import { BookingInfo, PlotStatus } from '../types'
import { useState } from 'react'

interface ClientSelectionModalProps {
  bookings: BookingInfo[]
  targetStatus: PlotStatus
  plotNumber: string
  onConfirm: (selectedBooking: BookingInfo) => void
  onCancel: () => void
}

export function ClientSelectionModal({ 
  bookings, 
  targetStatus, 
  plotNumber, 
  onConfirm, 
  onCancel 
}: ClientSelectionModalProps) {
  const [selectedBooking, setSelectedBooking] = useState<BookingInfo | null>(null)
  
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
  
  const handleConfirm = () => {
    if (selectedBooking) {
      onConfirm(selectedBooking)
    }
  }
  
  const othersCount = bookings.length - 1

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Client for {targetStatus === 'agreement' ? 'Agreement' : 'Registration'}
            </h2>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-900 mb-1">
                  Important: Client Selection Required
                </h3>
                <p className="text-sm text-amber-700">
                  Plot #{plotNumber} has {bookings.length} booked clients. Moving to{' '}
                  <span className="font-medium">
                    {targetStatus === 'agreement' ? 'Agreement' : 'Registration'}
                  </span>{' '}
                  allows only <span className="font-medium">1 client</span>.
                </p>
                <p className="text-sm text-amber-700 mt-2">
                  ⚠️ <span className="font-medium">{othersCount} other client{othersCount > 1 ? 's' : ''} will be removed</span> from this plot.
                </p>
              </div>
            </div>
          </div>

          {/* Client Selection */}
          <div>
            <h3 id="client-selection-heading" className="text-lg font-medium text-gray-900 mb-4">
              Select which client to move to {targetStatus === 'agreement' ? 'Agreement' : 'Registration'}:
            </h3>
            
            <div className="space-y-3" role="radiogroup" aria-labelledby="client-selection-heading">
              {bookings.map((booking, index) => (
                <label
                  key={index}
                  className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedBooking === booking
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="client-selection"
                    value={index}
                    checked={selectedBooking === booking}
                    onChange={() => setSelectedBooking(booking)}
                    className="sr-only"
                    aria-describedby={`client-details-${index}`}
                    aria-label={`Select ${booking.name} (${formatPhone(booking.phone)})`}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedBooking === booking
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`} aria-hidden="true">
                          {selectedBooking === booking && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <User className="w-4 h-4 text-gray-500" aria-hidden="true" />
                        <span className="font-medium text-gray-900">{booking.name}</span>
                      </div>
                      
                      <div id={`client-details-${index}`} className="ml-7 space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" aria-hidden="true" />
                          <span className="text-gray-700">{formatPhone(booking.phone)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
                          <span className="text-sm text-gray-600">
                            Booked on {formatDate(booking.bookingDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedBooking === booking && (
                      <div className="text-blue-600 font-medium text-sm" aria-hidden="true">
                        Selected
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Summary */}
          {selectedBooking && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Summary of Changes:</h4>
              <ul className="text-sm space-y-1">
                <li className="text-green-700">
                  ✓ {selectedBooking.name} ({formatPhone(selectedBooking.phone)}) will be moved to{' '}
                  {targetStatus === 'agreement' ? 'Agreement' : 'Registration'}
                </li>
                {othersCount > 0 && (
                  <li className="text-red-700">
                    ✗ {othersCount} other client{othersCount > 1 ? 's' : ''} will be removed from this plot
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onCancel}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedBooking}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                selectedBooking
                  ? targetStatus === 'agreement'
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Move to {targetStatus === 'agreement' ? 'Agreement' : 'Registration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}