import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../hooks/useStore'
import { BookingInfo, PlotStatus } from '../types'

// Test utilities
const createMockBooking = (name: string, phone: string): BookingInfo => ({
  name,
  phone,
  bookingDate: new Date('2024-01-01T10:00:00Z')
})

describe('PlotVista Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.setState((state) => ({
      ...state,
      user: null,
      isAuthenticated: false,
      layout: {
        ...state.layout,
        plots: state.layout.plots.map(plot => ({
          ...plot,
          status: 'available' as PlotStatus,
          bookings: undefined,
          agreement: undefined,
          registration: undefined,
        }))
      }
    }))
  })

  describe('Authentication', () => {
    it('should login with correct password', () => {
      const { login } = useStore.getState()
      const result = login('plotvista123')
      
      expect(result).toBe(true)
      expect(useStore.getState().isAuthenticated).toBe(true)
      expect(useStore.getState().user?.role).toBe('manager')
    })

    it('should reject incorrect password', () => {
      const { login } = useStore.getState()
      const result = login('wrongpassword')
      
      expect(result).toBe(false)
      expect(useStore.getState().isAuthenticated).toBe(false)
      expect(useStore.getState().user).toBe(null)
    })

    it('should logout user', () => {
      const { login, logout } = useStore.getState()
      
      // Login first
      login('plotvista123')
      expect(useStore.getState().isAuthenticated).toBe(true)
      
      // Then logout
      logout()
      expect(useStore.getState().isAuthenticated).toBe(false)
      expect(useStore.getState().user).toBe(null)
    })
  })

  describe('Phone Number Validation', () => {
    it('should validate correct phone numbers', () => {
      const { validatePhoneNumber } = useStore.getState()
      
      expect(validatePhoneNumber('1234567890')).toBe(true)
      expect(validatePhoneNumber('9876543210')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      const { validatePhoneNumber } = useStore.getState()
      
      expect(validatePhoneNumber('123456789')).toBe(false) // 9 digits
      expect(validatePhoneNumber('12345678901')).toBe(false) // 11 digits
      expect(validatePhoneNumber('abcdefghij')).toBe(false) // letters
      expect(validatePhoneNumber('123-456-7890')).toBe(true) // with dashes - should be valid after stripping
      expect(validatePhoneNumber('')).toBe(false) // empty
    })
  })

  describe('Status Transitions - Available to Other States', () => {
    beforeEach(() => {
      // Login as manager for these tests
      useStore.getState().login('plotvista123')
    })

    it('should update available plot to booked with booking info', () => {
      const { updatePlotStatus, layout } = useStore.getState()
      const plotId = layout.plots[0].id
      const bookingInfo = createMockBooking('John Doe', '1234567890')
      
      updatePlotStatus(plotId, 'booked', bookingInfo)
      
      const updatedPlot = useStore.getState().layout.plots.find(p => p.id === plotId)
      expect(updatedPlot?.status).toBe('booked')
      expect(updatedPlot?.bookings).toHaveLength(1)
      expect(updatedPlot?.bookings?.[0].name).toBe('John Doe')
      expect(updatedPlot?.bookings?.[0].phone).toBe('1234567890')
    })

    it('should update available plot to agreement with booking info', () => {
      const { updatePlotStatus, layout } = useStore.getState()
      const plotId = layout.plots[0].id
      const bookingInfo = createMockBooking('Jane Smith', '9876543210')
      
      updatePlotStatus(plotId, 'agreement', bookingInfo)
      
      const updatedPlot = useStore.getState().layout.plots.find(p => p.id === plotId)
      expect(updatedPlot?.status).toBe('agreement')
      expect(updatedPlot?.agreement?.name).toBe('Jane Smith')
      expect(updatedPlot?.agreement?.phone).toBe('9876543210')
      expect(updatedPlot?.bookings).toBeUndefined()
    })

    it('should update available plot to registration with booking info', () => {
      const { updatePlotStatus, layout } = useStore.getState()
      const plotId = layout.plots[0].id
      const bookingInfo = createMockBooking('Bob Johnson', '5555555555')
      
      updatePlotStatus(plotId, 'registration', bookingInfo)
      
      const updatedPlot = useStore.getState().layout.plots.find(p => p.id === plotId)
      expect(updatedPlot?.status).toBe('registration')
      expect(updatedPlot?.registration?.name).toBe('Bob Johnson')
      expect(updatedPlot?.registration?.phone).toBe('5555555555')
      expect(updatedPlot?.bookings).toBeUndefined()
      expect(updatedPlot?.agreement).toBeUndefined()
    })

    it('should require booking info for status changes from available', () => {
      const { updatePlotStatus, layout } = useStore.getState()
      const plotId = layout.plots[0].id
      
      expect(() => {
        updatePlotStatus(plotId, 'booked')
      }).toThrow('Booking information is required for this status change')
      
      expect(() => {
        updatePlotStatus(plotId, 'agreement')
      }).toThrow('Booking information is required for this status change')
      
      expect(() => {
        updatePlotStatus(plotId, 'registration')
      }).toThrow('Booking information is required for this status change')
    })

    it('should allow available to available without booking info', () => {
      const { updatePlotStatus, layout } = useStore.getState()
      const plotId = layout.plots[0].id
      
      // This should not throw
      updatePlotStatus(plotId, 'available')
      
      const updatedPlot = useStore.getState().layout.plots.find(p => p.id === plotId)
      expect(updatedPlot?.status).toBe('available')
    })
  })

  describe('Multiple Bookings Management', () => {
    beforeEach(() => {
      useStore.getState().login('plotvista123')
    })

    it('should add multiple bookings to a booked plot', () => {
      const { updatePlotStatus, addBooking, layout } = useStore.getState()
      const plotId = layout.plots[0].id
      
      // First, make it booked
      const firstBooking = createMockBooking('John Doe', '1234567890')
      updatePlotStatus(plotId, 'booked', firstBooking)
      
      // Add second booking
      const secondBooking = createMockBooking('Jane Smith', '9876543210')
      addBooking(plotId, secondBooking)
      
      const updatedPlot = useStore.getState().layout.plots.find(p => p.id === plotId)
      expect(updatedPlot?.bookings).toHaveLength(2)
      expect(updatedPlot?.bookings?.[0].name).toBe('John Doe')
      expect(updatedPlot?.bookings?.[1].name).toBe('Jane Smith')
    })

    it('should prevent duplicate phone numbers in bookings', () => {
      const { updatePlotStatus, addBooking, layout } = useStore.getState()
      const plotId = layout.plots[0].id
      
      // First, make it booked
      const firstBooking = createMockBooking('John Doe', '1234567890')
      updatePlotStatus(plotId, 'booked', firstBooking)
      
      // Try to add booking with same phone
      const duplicateBooking = createMockBooking('Jane Smith', '1234567890')
      
      expect(() => {
        addBooking(plotId, duplicateBooking)
      }).toThrow('Phone number already exists for this plot')
    })

    it('should remove booking by phone number', () => {
      const { updatePlotStatus, addBooking, removeBooking, layout } = useStore.getState()
      const plotId = layout.plots[0].id
      
      // Add two bookings
      const firstBooking = createMockBooking('John Doe', '1234567890')
      updatePlotStatus(plotId, 'booked', firstBooking)
      
      const secondBooking = createMockBooking('Jane Smith', '9876543210')
      addBooking(plotId, secondBooking)
      
      // Remove first booking
      removeBooking(plotId, '1234567890')
      
      const updatedPlot = useStore.getState().layout.plots.find(p => p.id === plotId)
      expect(updatedPlot?.bookings).toHaveLength(1)
      expect(updatedPlot?.bookings?.[0].name).toBe('Jane Smith')
    })

    it('should change status to available when all bookings removed', () => {
      const { updatePlotStatus, removeBooking, layout } = useStore.getState()
      const plotId = layout.plots[0].id
      
      // Add booking
      const booking = createMockBooking('John Doe', '1234567890')
      updatePlotStatus(plotId, 'booked', booking)
      
      // Remove the booking
      removeBooking(plotId, '1234567890')
      
      const updatedPlot = useStore.getState().layout.plots.find(p => p.id === plotId)
      expect(updatedPlot?.status).toBe('available')
      expect(updatedPlot?.bookings).toBeUndefined()
    })
  })

  describe('Status Transitions - Booked to Agreement/Registration', () => {
    beforeEach(() => {
      useStore.getState().login('plotvista123')
    })

    it('should move single booking to agreement', () => {
      const { updatePlotStatus, layout } = useStore.getState()
      const plotId = layout.plots[0].id
      
      // First, make it booked
      const booking = createMockBooking('John Doe', '1234567890')
      updatePlotStatus(plotId, 'booked', booking)
      
      // Move to agreement with new booking info
      const agreementBooking = createMockBooking('Jane Smith', '9876543210')
      updatePlotStatus(plotId, 'agreement', agreementBooking)
      
      const updatedPlot = useStore.getState().layout.plots.find(p => p.id === plotId)
      expect(updatedPlot?.status).toBe('agreement')
      expect(updatedPlot?.agreement?.name).toBe('Jane Smith')
      expect(updatedPlot?.bookings).toBeUndefined()
    })

    it('should use first booking when moving to agreement without new booking info', () => {
      const { updatePlotStatus, layout } = useStore.getState()
      const plotId = layout.plots[0].id
      
      // First, make it booked with specific booking
      const booking = createMockBooking('John Doe', '1234567890')
      updatePlotStatus(plotId, 'booked', booking)
      
      // Move to agreement without new booking info
      updatePlotStatus(plotId, 'agreement')
      
      const updatedPlot = useStore.getState().layout.plots.find(p => p.id === plotId)
      expect(updatedPlot?.status).toBe('agreement')
      expect(updatedPlot?.agreement?.name).toBe('John Doe')
      expect(updatedPlot?.agreement?.phone).toBe('1234567890')
      expect(updatedPlot?.bookings).toBeUndefined()
    })
  })

  describe('Dashboard Statistics', () => {
    beforeEach(() => {
      useStore.getState().login('plotvista123')
    })

    it('should calculate correct dashboard stats', () => {
      const { updatePlotStatus, getDashboardStats, layout } = useStore.getState()
      const plots = layout.plots.slice(0, 4) // Use first 4 plots for testing
      
      // Set up different statuses
      updatePlotStatus(plots[0].id, 'booked', createMockBooking('User1', '1111111111'))
      updatePlotStatus(plots[1].id, 'agreement', createMockBooking('User2', '2222222222'))
      updatePlotStatus(plots[2].id, 'registration', createMockBooking('User3', '3333333333'))
      // plots[3] remains available
      
      const stats = getDashboardStats()
      
      expect(stats.totalPlots).toBe(layout.totalPlots)
      expect(stats.available).toBeGreaterThan(0)
      expect(stats.booked).toBeGreaterThan(0)
      expect(stats.agreement).toBeGreaterThan(0)
      expect(stats.registration).toBeGreaterThan(0)
      expect(stats.percentageSold).toBeGreaterThan(0)
    })
  })

  describe('Permission Checks', () => {
    it('should not allow plot updates without manager role', () => {
      // Don't login (no manager role)
      const { updatePlotStatus, layout } = useStore.getState()
      const plotId = layout.plots[0].id
      const booking = createMockBooking('John Doe', '1234567890')
      
      // Should not update plot
      updatePlotStatus(plotId, 'booked', booking)
      
      const plot = useStore.getState().layout.plots.find(p => p.id === plotId)
      expect(plot?.status).toBe('available') // Should remain unchanged
    })

    it('should not allow adding bookings without manager role', () => {
      const { addBooking, layout } = useStore.getState()
      const plotId = layout.plots[0].id
      const booking = createMockBooking('John Doe', '1234567890')
      
      // Should not add booking
      addBooking(plotId, booking)
      
      const plot = useStore.getState().layout.plots.find(p => p.id === plotId)
      expect(plot?.bookings).toBeUndefined()
    })
  })

  describe('Filtering', () => {
    it('should filter plots by status', () => {
      const { setStatusFilter, getFilteredPlots, updatePlotStatus, layout } = useStore.getState()
      
      // Login and set up some plots
      useStore.getState().login('plotvista123')
      updatePlotStatus(layout.plots[0].id, 'booked', createMockBooking('User1', '1111111111'))
      
      // Filter by booked status
      setStatusFilter('booked')
      const filteredPlots = getFilteredPlots()
      
      expect(filteredPlots.every(plot => plot.status === 'booked')).toBe(true)
      expect(filteredPlots.length).toBeGreaterThan(0)
    })

    it('should filter plots by search query', () => {
      const { setSearchQuery, getFilteredPlots } = useStore.getState()
      
      // Search for plot number "1"
      setSearchQuery('1')
      const filteredPlots = getFilteredPlots()
      
      expect(filteredPlots.every(plot => plot.plotNumber.includes('1'))).toBe(true)
    })

    it('should show all plots when filter is "all"', () => {
      const { setStatusFilter, setSearchQuery, getFilteredPlots, layout } = useStore.getState()
      
      // Clear any previous filters
      setStatusFilter('all')
      setSearchQuery('')
      const filteredPlots = getFilteredPlots()
      
      expect(filteredPlots.length).toBe(layout.totalPlots)
    })
  })
})