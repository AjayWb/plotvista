import { Search, Filter, Users } from 'lucide-react'
import { useStore } from '../hooks/useStore'
import { PlotStatus } from '../types'
import clsx from 'clsx'

export function Filters() {
  const filters = useStore(state => state.filters)
  const setStatusFilter = useStore(state => state.setStatusFilter)
  const setSearchQuery = useStore(state => state.setSearchQuery)
  const setMultipleBookingsFilter = useStore(state => state.setMultipleBookingsFilter)

  const statusOptions: Array<{ value: PlotStatus | 'all'; label: string; color?: string }> = [
    { value: 'all', label: 'All Plots' },
    { value: 'available', label: 'Available', color: 'text-green-600 bg-green-100' },
    { value: 'booked', label: 'Booked', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'agreement', label: 'Agreement', color: 'text-orange-600 bg-orange-100' },
    { value: 'registration', label: 'Registration', color: 'text-blue-600 bg-blue-100' },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search plot number..."
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sizzle-red focus:border-transparent outline-none"
        />
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-gray-600" />
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                filters.status === option.value
                  ? option.color || 'text-white bg-gray-800'
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Multiple Bookings Filter */}
      <button
        onClick={() => setMultipleBookingsFilter(!filters.multipleBookings)}
        className={clsx(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          filters.multipleBookings
            ? 'text-purple-600 bg-purple-100'
            : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
        )}
      >
        <Users className="w-4 h-4" />
        Multiple Bookings
      </button>
    </div>
  )
}