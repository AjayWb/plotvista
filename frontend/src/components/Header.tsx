import { useState } from 'react'
import { Building2, LogIn, LogOut, Users, Download } from 'lucide-react'
import { ProjectManager } from './ProjectManager'
import { MultipleBookingModal } from './MultipleBookingModal'
import { ExportModal } from './ExportModal'

interface HeaderProps {
  onLoginClick: () => void
  isAdmin: boolean
  onLogout: () => void
}

export function Header({ onLoginClick, isAdmin, onLogout }: HeaderProps) {
  const [showMultipleBooking, setShowMultipleBooking] = useState(false)
  const [showExport, setShowExport] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-sizzle-red" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PlotVista</h1>
              <p className="text-sm text-gray-600">Sizzle Properties Plot Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isAdmin && (
              <>
                <ProjectManager />
                <button
                  onClick={() => setShowMultipleBooking(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Multiple Booking
                </button>
                <button
                  onClick={() => setShowExport(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Manager</p>
                  <p className="text-xs text-gray-600">Admin Access</p>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
            {!isAdmin && (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sizzle-red rounded-lg hover:bg-sizzle-dark transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Manager Login
              </button>
            )}
          </div>
        </div>
      </div>
      
      <MultipleBookingModal 
        isOpen={showMultipleBooking}
        onClose={() => setShowMultipleBooking(false)}
      />
      
      <ExportModal 
        isOpen={showExport}
        onClose={() => setShowExport(false)}
      />
    </header>
  )
}