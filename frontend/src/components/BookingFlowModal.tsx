import { useState } from 'react'
import { X, User, Phone, Calendar, ArrowRight, CheckCircle } from 'lucide-react'
import { Plot, BookingInfo } from '../types'
import { useStore } from '../hooks/useStore'

interface BookingFlowModalProps {
  plot: Plot
  onClose: () => void
  onComplete: (bookingInfo: BookingInfo) => void
}

type FlowStep = 'details' | 'confirm' | 'success'

export function BookingFlowModal({ plot, onClose, onComplete }: BookingFlowModalProps) {
  const [step, setStep] = useState<FlowStep>('details')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const validatePhoneNumber = useStore(state => state.validatePhoneNumber)
  
  const handleNext = () => {
    setError('')
    
    if (!customerName.trim()) {
      setError('Customer name is required')
      return
    }
    
    if (!customerPhone.trim()) {
      setError('Phone number is required')
      return
    }
    
    if (!validatePhoneNumber(customerPhone)) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    
    setStep('confirm')
  }
  
  const handleConfirm = async () => {
    setIsSubmitting(true)
    
    try {
      const bookingInfo: BookingInfo = {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        bookingDate: new Date()
      }
      
      await onComplete(bookingInfo)
      setStep('success')
      
      // Auto-close after success
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
      setStep('details')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  
  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '')
    if (cleaned.length <= 10) {
      setCustomerPhone(cleaned)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Book Plot #{plot.plotNumber}</h2>
            <p className="text-sm text-gray-600">{plot.dimension} ft • {plot.area.toLocaleString()} sq ft</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${step === 'details' ? 'text-blue-600' : step === 'confirm' || step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 'details' ? 'bg-blue-100 text-blue-600' : step === 'confirm' || step === 'success' ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                {step === 'confirm' || step === 'success' ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Details</span>
            </div>
            
            <ArrowRight className="w-4 h-4 text-gray-400" />
            
            <div className={`flex items-center gap-2 ${step === 'confirm' ? 'text-blue-600' : step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 'confirm' ? 'bg-blue-100 text-blue-600' : step === 'success' ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                {step === 'success' ? <CheckCircle className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Confirm</span>
            </div>
            
            <ArrowRight className="w-4 h-4 text-gray-400" />
            
            <div className={`flex items-center gap-2 ${step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 'success' ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                {step === 'success' ? <CheckCircle className="w-4 h-4" /> : '3'}
              </div>
              <span className="text-sm font-medium">Done</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                <p className="text-sm text-gray-600 mb-4">Enter the customer details to book this plot.</p>
              </div>
              
              <div>
                <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Customer Name *
                </label>
                <input
                  id="customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  autoFocus
                  aria-required="true"
                />
              </div>
              
              <div>
                <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Phone Number *
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="Enter 10-digit phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  aria-required="true"
                  aria-describedby={customerPhone ? "phone-preview" : undefined}
                />
                {customerPhone && (
                  <p id="phone-preview" className="text-xs text-gray-500 mt-1">
                    Preview: {formatPhone(customerPhone.padEnd(10, 'X'))}
                  </p>
                )}
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          )}
          
          {step === 'confirm' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Confirm Booking</h3>
                <p className="text-sm text-gray-600 mb-4">Please review the booking details before confirming.</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Plot Number:</span>
                  <span className="font-medium">#{plot.plotNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dimensions:</span>
                  <span className="font-medium">{plot.dimension} ft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Area:</span>
                  <span className="font-medium">{plot.area.toLocaleString()} sq ft</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer:</span>
                  <span className="font-medium">{customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="font-medium">{formatPhone(customerPhone)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Booking Date:</span>
                  <span className="font-medium">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Confirmed!</h3>
                <p className="text-sm text-gray-600">
                  Plot #{plot.plotNumber} has been successfully booked for {customerName}.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  Booking ID: #BK{Date.now().toString().slice(-6)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {step !== 'success' && (
          <div className="flex gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={step === 'details' ? onClose : () => setStep('details')}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {step === 'details' ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={step === 'details' ? handleNext : handleConfirm}
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Booking...' : step === 'details' ? 'Next' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}