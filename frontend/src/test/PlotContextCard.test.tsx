import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlotContextCard } from '../components/PlotContextCard'
import { Plot, PlotStatus, BookingInfo } from '../types'
import { useStore } from '../hooks/useStore'

// Mock the store
vi.mock('../hooks/useStore', () => ({
  useStore: vi.fn()
}))

const mockUseStore = vi.mocked(useStore)

// Test utilities
const createMockPlot = (status: PlotStatus, bookings?: BookingInfo[]): Plot => ({
  id: 'test-plot-1',
  plotNumber: '123',
  dimension: '30×40',
  area: 1200,
  status,
  row: 0,
  col: 0,
  bookings,
  lastUpdated: new Date()
})

const createMockBooking = (name: string, phone: string): BookingInfo => ({
  name,
  phone,
  bookingDate: new Date('2024-01-01T10:00:00Z')
})

describe('PlotContextCard Component', () => {
  const mockUpdatePlotStatus = vi.fn()
  const mockAddBooking = vi.fn()
  const mockRemoveBooking = vi.fn()
  const mockValidatePhoneNumber = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseStore.mockImplementation((selector) => {
      const state = {
        updatePlotStatus: mockUpdatePlotStatus,
        addBooking: mockAddBooking,
        removeBooking: mockRemoveBooking,
        validatePhoneNumber: mockValidatePhoneNumber,
        user: { role: 'manager' },
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
        layout: { plots: [], totalPlots: 0, updatedAt: new Date() },
        filters: { status: 'all' as const, searchQuery: '' },
        setStatusFilter: vi.fn(),
        setSearchQuery: vi.fn(),
        getFilteredPlots: vi.fn(),
        getDashboardStats: vi.fn()
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return selector(state as any)
    })
    
    mockValidatePhoneNumber.mockReturnValue(true) // Default to valid phone
  })

  describe('Available Plot Context Card', () => {
    it('should render plot details for available plot', () => {
      const plot = createMockPlot('available')
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByText('Plot #123')).toBeInTheDocument()
      expect(screen.getByText('30×40 ft')).toBeInTheDocument()
      expect(screen.getByText('1,200 sq ft')).toBeInTheDocument()
      expect(screen.getByText('available')).toBeInTheDocument()
    })

    it('should show book plot button for available plot', () => {
      const plot = createMockPlot('available')
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByText('Ready to Book')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /book this plot/i })).toBeInTheDocument()
    })

    it('should open booking flow modal when book button clicked', async () => {
      const user = userEvent.setup()
      const plot = createMockPlot('available')
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Click book this plot button
      const bookButton = screen.getByRole('button', { name: /book this plot/i })
      await user.click(bookButton)
      
      // Should open BookingFlowModal
      await waitFor(() => {
        expect(screen.getByText('Book Plot #123')).toBeInTheDocument()
      })
    })

    it('should show customer form in booking flow modal', async () => {
      const user = userEvent.setup()
      const plot = createMockPlot('available')
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Click book this plot button
      const bookButton = screen.getByRole('button', { name: /book this plot/i })
      await user.click(bookButton)
      
      // Should show customer form in booking flow modal
      await waitFor(() => {
        expect(screen.getByLabelText('Customer Name *')).toBeInTheDocument()
        expect(screen.getByLabelText('Phone Number *')).toBeInTheDocument()
      })
    })

    it('should complete booking flow when valid details entered', async () => {
      const user = userEvent.setup()
      const plot = createMockPlot('available')
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Open booking flow
      const bookButton = screen.getByRole('button', { name: /book this plot/i })
      await user.click(bookButton)
      
      // Enter valid details
      await user.type(screen.getByLabelText('Customer Name *'), 'John Doe')
      await user.type(screen.getByLabelText('Phone Number *'), '1234567890')
      
      // Click Next
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      // Should show confirm step
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /confirm booking/i })).toBeInTheDocument()
      })
      
      // Click Confirm
      const confirmButton = screen.getByRole('button', { name: /confirm booking/i })
      await user.click(confirmButton)
      
      // Should call updatePlotStatus
      expect(mockUpdatePlotStatus).toHaveBeenCalledWith('test-plot-1', 'booked', expect.objectContaining({
        name: 'John Doe',
        phone: '1234567890'
      }))
    })

    it('should allow resetting to available from advanced options', async () => {
      const user = userEvent.setup()
      const plot = createMockPlot('booked', [createMockBooking('John Doe', '1234567890')])
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Show advanced options
      const advancedButton = screen.getByRole('button', { name: /show advanced options/i })
      await user.click(advancedButton)
      
      // Click reset to available
      const resetButton = screen.getByRole('button', { name: /reset to available/i })
      await user.click(resetButton)
      
      expect(mockUpdatePlotStatus).toHaveBeenCalledWith('test-plot-1', 'available')
    })
  })

  describe('Booked Plot Context Card', () => {
    it('should display existing bookings', () => {
      const bookings = [
        createMockBooking('John Doe', '1234567890'),
        createMockBooking('Jane Smith', '9876543210')
      ]
      const plot = createMockPlot('booked', bookings)
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByText('2 Customers')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('123-456-7890')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('987-654-3210')).toBeInTheDocument()
    })

    it('should show next steps for booked plots', () => {
      const plot = createMockPlot('booked', [createMockBooking('John Doe', '1234567890')])
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByText('Next Steps')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /move to agreement/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add another customer/i })).toBeInTheDocument()
    })

    it('should add new booking through booking flow modal', async () => {
      const user = userEvent.setup()
      const plot = createMockPlot('booked', [createMockBooking('John Doe', '1234567890')])
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Click add another customer
      const addButton = screen.getByRole('button', { name: /add another customer/i })
      await user.click(addButton)
      
      // Should open booking flow modal
      await waitFor(() => {
        expect(screen.getByText('Book Plot #123')).toBeInTheDocument()
      })
      
      // Enter customer details
      await user.type(screen.getByLabelText('Customer Name *'), 'Jane Smith')
      await user.type(screen.getByLabelText('Phone Number *'), '9876543210')
      
      // Complete booking flow
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /confirm booking/i }))
      
      expect(mockAddBooking).toHaveBeenCalledWith('test-plot-1', expect.objectContaining({
        name: 'Jane Smith',
        phone: '9876543210'
      }))
    })

    it('should show remove buttons for each booking', () => {
      const bookings = [
        createMockBooking('John Doe', '1234567890'),
        createMockBooking('Jane Smith', '9876543210')
      ]
      const plot = createMockPlot('booked', bookings)
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      const removeButtons = screen.getAllByTitle('Remove booking')
      expect(removeButtons).toHaveLength(2)
    })

    it('should call removeBooking when remove button clicked', async () => {
      const user = userEvent.setup()
      const bookings = [createMockBooking('John Doe', '1234567890')]
      const plot = createMockPlot('booked', bookings)
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      const removeButton = screen.getByTitle('Remove booking')
      await user.click(removeButton)
      
      expect(mockRemoveBooking).toHaveBeenCalledWith('test-plot-1', '1234567890')
    })

    it('should show multiple interest indicator for multiple bookings', () => {
      const bookings = [
        createMockBooking('John Doe', '1234567890'),
        createMockBooking('Jane Smith', '9876543210')
      ]
      const plot = createMockPlot('booked', bookings)
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByText('Multiple Interest')).toBeInTheDocument()
      expect(screen.getByText('Choose Winner for Agreement')).toBeInTheDocument()
    })
  })

  describe('Agreement Plot Context Card', () => {
    it('should display agreement details', () => {
      const plot = createMockPlot('agreement')
      plot.agreement = createMockBooking('John Doe', '1234567890')
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByText('Agreement Stage')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('123-456-7890')).toBeInTheDocument()
    })
  })

  describe('Registration Plot Context Card', () => {
    it('should display registration details', () => {
      const plot = createMockPlot('registration')
      plot.registration = createMockBooking('John Doe', '1234567890')
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByText('Registration Complete')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('123-456-7890')).toBeInTheDocument()
    })
  })

  describe('Status Management', () => {
    it('should show appropriate next steps for single booking', () => {
      const plot = createMockPlot('booked', [createMockBooking('John Doe', '1234567890')])
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByRole('button', { name: /move to agreement/i })).toBeInTheDocument()
    })

    it('should show client selection for multiple bookings', () => {
      const plot = createMockPlot('booked', [
        createMockBooking('John Doe', '1234567890'),
        createMockBooking('Jane Smith', '9876543210')
      ])
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByRole('button', { name: /choose winner for agreement/i })).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should display error in booking flow when addBooking throws', async () => {
      const user = userEvent.setup()
      const plot = createMockPlot('booked', [createMockBooking('John Doe', '1234567890')])
      
      mockAddBooking.mockImplementation(() => {
        throw new Error('Phone number already exists')
      })
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Open booking flow
      const addButton = screen.getByRole('button', { name: /add another customer/i })
      await user.click(addButton)
      
      // Enter details
      await user.type(screen.getByLabelText('Customer Name *'), 'Jane Smith')
      await user.type(screen.getByLabelText('Phone Number *'), '1234567890')
      
      // Complete flow
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /confirm booking/i }))
      
      expect(screen.getByText('Phone number already exists')).toBeInTheDocument()
    })

    it('should display error when phone validation fails in booking flow', async () => {
      const user = userEvent.setup()
      const plot = createMockPlot('available')
      
      mockValidatePhoneNumber.mockReturnValue(false)
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Open booking flow
      const bookButton = screen.getByRole('button', { name: /book this plot/i })
      await user.click(bookButton)
      
      // Enter invalid phone
      await user.type(screen.getByLabelText('Customer Name *'), 'Jane Smith')
      await user.type(screen.getByLabelText('Phone Number *'), '123')
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      expect(screen.getByText('Please enter a valid 10-digit phone number')).toBeInTheDocument()
    })
  })

  describe('Context Card Controls', () => {
    it('should call onClose when close button clicked', async () => {
      const user = userEvent.setup()
      const plot = createMockPlot('available')
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      const closeButton = screen.getByRole('button', { name: /close context card/i })
      await user.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})

