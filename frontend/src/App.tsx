import { useState, useEffect, Suspense, lazy } from 'react'
import { Header } from './components/Header'
import { Filters } from './components/Filters'
import { StatusLegend } from './components/StatusLegend'
import { useStore } from './hooks/useStore'
import { adminApi } from './utils/api'

// Lazy load heavy components for better performance
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })))
const PlotGrid = lazy(() => import('./components/PlotGrid').then(m => ({ default: m.PlotGrid })))
const AdminLogin = lazy(() => import('./components/AdminLogin').then(m => ({ default: m.AdminLogin })))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
)

function App() {
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Initialize the store with API data
  const initializeStore = useStore(state => state.initializeFromAPI)
  
  useEffect(() => {
    // Check if admin is already logged in
    setIsAdmin(adminApi.checkAuth())
    
    // Initialize store with API data
    initializeStore().finally(() => setIsLoading(false))
  }, [])

  const handleAdminLogin = () => {
    setIsAdmin(true)
    setShowAdminLogin(false)
  }
  
  const handleAdminLogout = async () => {
    await adminApi.logout()
    setIsAdmin(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sizzle-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading PlotVista...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onLoginClick={() => setShowAdminLogin(true)}
        isAdmin={isAdmin}
        onLogout={handleAdminLogout}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Dashboard Stats */}
        <Suspense fallback={<LoadingSpinner />}>
          <Dashboard />
        </Suspense>
        
        {/* Filters and Legend */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <Filters />
          <StatusLegend />
        </div>
        
        {/* Plot Grid */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Plot Layout</h2>
            <p className="text-sm text-gray-600 mt-1">
              {isAdmin 
                ? 'Click on any plot to change its status'
                : 'View-only mode. Contact manager for bookings.'}
            </p>
          </div>
          <Suspense fallback={<LoadingSpinner />}>
            <PlotGrid isAdmin={isAdmin} />
          </Suspense>
        </div>
      </main>
      
      {showAdminLogin && (
        <Suspense fallback={<LoadingSpinner />}>
          <AdminLogin onLoginSuccess={handleAdminLogin} />
        </Suspense>
      )}
    </div>
  )
}

export default App