import { Plot, Layout, BookingInfo } from '../types'

export function generateMockLayout(): Layout {
  const plots: Plot[] = []
  const totalRows = 18
  const plotsPerRow = 20
  
  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < plotsPerRow; col++) {
      const plotNumber = (row * plotsPerRow + col + 1).toString()
      const dimension = Math.random() > 0.5 ? '30×40' : '30×50'
      const area = dimension === '30×40' ? 1200 : 1500
      
      // Randomly assign status
      let status: Plot['status'] = 'available'
      const rand = Math.random()
      if (rand > 0.8) status = 'registration'
      else if (rand > 0.6) status = 'agreement'
      else if (rand > 0.4) status = 'booked'
      
      const plot: Plot = {
        id: `plot-${plotNumber}`,
        plotNumber,
        dimension,
        area,
        status,
        row,
        col,
        lastUpdated: new Date(),
      }
      
      // Add additional data based on status
      if (status === 'booked') {
        const bookings: BookingInfo[] = [{
          name: `Customer ${Math.floor(Math.random() * 100)}`,
          phone: `98${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
          bookingDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
        }]
        
        // 40% chance of multiple bookings
        if (Math.random() > 0.6) {
          bookings.push({
            name: `Customer ${Math.floor(Math.random() * 100)}`,
            phone: `97${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
            bookingDate: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000)
          })
          // 20% chance of 3 bookings
          if (Math.random() > 0.8) {
            bookings.push({
              name: `Customer ${Math.floor(Math.random() * 100)}`,
              phone: `96${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
              bookingDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
            })
          }
        }
        plot.bookings = bookings
      } else if (status === 'agreement') {
        plot.agreement = {
          name: `Customer ${Math.floor(Math.random() * 100)}`,
          phone: `95${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
          bookingDate: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000)
        }
      } else if (status === 'registration') {
        plot.registration = {
          name: `Customer ${Math.floor(Math.random() * 100)}`,
          phone: `94${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
          bookingDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000)
        }
      }
      
      plots.push(plot)
    }
  }
  
  return {
    id: 'ruby-sizzle-heritage',
    name: 'Ruby Sizzle Heritage',
    totalArea: '22 acres',
    totalPlots: plots.length,
    plots,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  }
}