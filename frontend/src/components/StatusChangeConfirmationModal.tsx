import { useState } from 'react'
import { X, AlertTriangle, CheckCircle, MapPin, Calendar, User, Phone } from 'lucide-react'
import { Plot, PlotStatus, BookingInfo } from '../types'

interface StatusChangeConfirmationModalProps {
  isOpen: boolean
  plot: Plot | null
  newStatus: PlotStatus
  selectedBooking?: BookingInfo
  onConfirm: () => void
  onCancel: () => void
}

export function StatusChangeConfirmationModal({ 
  isOpen, 
  plot, 
  newStatus, 
  selectedBooking,
  onConfirm, 
  onCancel 
}: StatusChangeConfirmationModalProps) {
  const [hasConfirmed, setHasConfirmed] = useState(false)

  if (!isOpen || !plot) return null

  const getStatusText = (status: PlotStatus) => {
    switch (status) {
      case 'agreement': return 'Agreement'
      case 'registration': return 'Registration'
      default: return status
    }
  }

  const getStatusColor = (status: PlotStatus) => {
    switch (status) {
      case 'agreement': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'registration': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCurrentBooking = () => {
    if (selectedBooking) return selectedBooking
    if (plot.agreement) return plot.agreement
    if (plot.bookings && plot.bookings.length > 0) return plot.bookings[0]
    return null
  }

  const currentBooking = getCurrentBooking()

  const handleConfirm = () => {
    if (!hasConfirmed) {
      alert('Please confirm that you have verified all site details')
      return
    }
    onConfirm()
    setHasConfirmed(false)
  }

  const handleCancel = () => {
    onCancel()
    setHasConfirmed(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-xl">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Confirm Status Change
            </h2>
          </div>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Change Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-center">
              <div className="text-sm text-blue-600 mb-2">Moving plot to</div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(newStatus)}`}>
                {getStatusText(newStatus)}
              </div>
            </div>
          </div>

          {/* Plot Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Site Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Plot Number:</span>
                <div className="font-medium text-gray-900">#{plot.plotNumber}</div>
              </div>
              <div>
                <span className="text-gray-600">Dimensions:</span>
                <div className="font-medium text-gray-900">{plot.dimension}</div>
              </div>
              <div>
                <span className="text-gray-600">Area:</span>
                <div className="font-medium text-gray-900">{plot.area.toLocaleString()} sq ft</div>
              </div>
              <div>
                <span className="text-gray-600">Position:</span>
                <div className="font-medium text-gray-900">Row {plot.row + 1}, Col {plot.col + 1}</div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          {currentBooking && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{currentBooking.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{currentBooking.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Booked on {new Date(currentBooking.bookingDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-medium text-amber-800 mb-2">Important Verification Required</h3>
            <div className="text-sm text-amber-700 space-y-1">
              <div>• Confirm plot location and boundaries with customer</div>
              <div>• Verify all measurements and dimensions are accurate</div>
              <div>• Ensure customer understands plot position and access</div>
              {newStatus === 'agreement' && (
                <>
                  <div>• All payment terms have been discussed and agreed</div>
                  <div>• Legal documentation is ready for execution</div>
                </>
              )}
              {newStatus === 'registration' && (
                <>
                  <div>• All payments have been completed as per agreement</div>
                  <div>• Registration documents are prepared and verified</div>
                  <div>• Government approvals and clearances are in place</div>
                </>
              )}
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="confirm-details"
              checked={hasConfirmed}
              onChange={(e) => setHasConfirmed(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-sizzle-red focus:ring-sizzle-red"
            />
            <label htmlFor="confirm-details" className="text-sm text-gray-700 cursor-pointer">
              <span className="font-medium">I confirm that:</span>
              <br />
              • All site details have been verified with the customer
              <br />
              • Plot location, dimensions, and boundaries are accurate
              <br />
              • Customer has been informed about all relevant details
              {newStatus === 'agreement' && (
                <>
                  <br />
                  • Payment terms and legal requirements are confirmed
                </>
              )}
              {newStatus === 'registration' && (
                <>
                  <br />
                  • All payments are complete and documents are ready
                </>
              )}
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasConfirmed}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              hasConfirmed
                ? 'bg-sizzle-red text-white hover:bg-red-700'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Confirm {getStatusText(newStatus)}
          </button>
        </div>
      </div>
    </div>
  )
}