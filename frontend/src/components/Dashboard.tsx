import { TrendingUp, Home, FileText, CheckCircle, Package, Users } from 'lucide-react'
import { useStore } from '../hooks/useStore'
import clsx from 'clsx'

export function Dashboard() {
  const stats = useStore(state => state.getDashboardStats())
  const layout = useStore(state => state.layout)
  
  // Calculate multiple bookings count
  const multipleBookingsCount = layout.plots.filter(plot => 
    plot.status === 'booked' && plot.bookings && plot.bookings.length > 1
  ).length

  const cards = [
    {
      title: 'Total Plots',
      value: stats.totalPlots,
      icon: Package,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      title: 'Available',
      value: stats.available,
      icon: Home,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Booked',
      value: stats.booked,
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Agreement',
      value: stats.agreement,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Registration',
      value: stats.registration,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Multiple Interest',
      value: multipleBookingsCount,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Sold %',
      value: `${stats.percentageSold.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-sizzle-red',
      bgColor: 'bg-red-100',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={clsx('p-2 rounded-lg', card.bgColor)}>
                <Icon className={clsx('w-5 h-5', card.color)} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
            <p className={clsx('text-2xl font-bold mt-1', card.color)}>
              {card.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}