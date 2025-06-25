import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlotContextCard } from '../components/PlotContextCard'
import { Plot, PlotStatus, BookingInfo } from '../types'
import { useStore } from '../hooks/useStore'

// Mock the store
vi.mock('../hooks/useStore')
const mockUseStore = vi.mocked(useStore)

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

describe('Complete Booking Workflows', () => {
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
    
    mockValidatePhoneNumber.mockReturnValue(true)
  })

  describe('Complete Workflow: Available → Booked → Multiple Bookings → Agreement', () => {
    it('should handle complete workflow from available to agreement with client selection', async () => {
      const user = userEvent.setup()
      
      // Start with available plot
      let plot = createMockPlot('available')
      
      const { rerender } = render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Step 1: Change from available to booked through booking flow
      const bookButton = screen.getByRole('button', { name: /book this plot/i })
      await user.click(bookButton)
      
      await user.type(screen.getByLabelText('Customer Name *'), 'John Doe')
      await user.type(screen.getByLabelText('Phone Number *'), '1234567890')
      
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /confirm booking/i }))
      
      expect(mockUpdatePlotStatus).toHaveBeenCalledWith('test-plot-1', 'booked', expect.objectContaining({
        name: 'John Doe',
        phone: '1234567890'
      }))
      
      // Step 2: Simulate plot now being booked with one booking
      plot = createMockPlot('booked', [createMockBooking('John Doe', '1234567890')])
      rerender(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Step 3: Add a second booking through booking flow
      const addButton = screen.getByRole('button', { name: /add another customer/i })
      await user.click(addButton)
      
      await user.type(screen.getByLabelText('Customer Name *'), 'Jane Smith')
      await user.type(screen.getByLabelText('Phone Number *'), '9876543210')
      
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /confirm booking/i }))
      
      expect(mockAddBooking).toHaveBeenCalledWith('test-plot-1', expect.objectContaining({
        name: 'Jane Smith',
        phone: '9876543210'
      }))
      
      // Step 4: Simulate plot now having multiple bookings
      plot = createMockPlot('booked', [
        createMockBooking('John Doe', '1234567890'),
        createMockBooking('Jane Smith', '9876543210')
      ])
      rerender(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Should show multiple interest indicator
      expect(screen.getByText('Multiple Interest')).toBeInTheDocument()
      
      // Step 5: Try to change to agreement (should trigger client selection)
      const agreementButton = screen.getByRole('button', { name: /choose winner for agreement/i })
      await user.click(agreementButton)
      
      // Should show client selection modal
      await waitFor(() => {
        expect(screen.getByText('Select Client for Agreement')).toBeInTheDocument()
      })
    })
  })

  describe('Workflow: Error Handling and Validation', () => {
    it('should prevent invalid phone numbers throughout workflow', async () => {
      const user = userEvent.setup()
      mockValidatePhoneNumber.mockReturnValue(false)
      
      const plot = createMockPlot('available')
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Try to book with invalid phone through booking flow
      const bookButton = screen.getByRole('button', { name: /book this plot/i })
      await user.click(bookButton)
      
      await user.type(screen.getByLabelText('Customer Name *'), 'John Doe')
      await user.type(screen.getByLabelText('Phone Number *'), '123')
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      expect(screen.getByText('Please enter a valid 10-digit phone number')).toBeInTheDocument()
      expect(mockUpdatePlotStatus).not.toHaveBeenCalled()
    })

    it('should handle duplicate phone numbers in multiple bookings', async () => {
      const user = userEvent.setup()
      
      const plot = createMockPlot('booked', [createMockBooking('John Doe', '1234567890')])
      
      mockAddBooking.mockImplementation(() => {
        throw new Error('Phone number already exists for this plot')
      })
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Try to add booking with same phone through booking flow
      const addButton = screen.getByRole('button', { name: /add another customer/i })
      await user.click(addButton)
      
      await user.type(screen.getByLabelText('Customer Name *'), 'Jane Smith')
      await user.type(screen.getByLabelText('Phone Number *'), '1234567890') // Same as existing
      
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /confirm booking/i }))
      
      expect(screen.getByText('Phone number already exists for this plot')).toBeInTheDocument()
    })
  })

  describe('Workflow: Status Transitions with Business Logic', () => {
    it('should properly handle booked → agreement transition', async () => {
      const user = userEvent.setup()
      
      const plot = createMockPlot('booked', [createMockBooking('John Doe', '1234567890')])
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Change to agreement (single booking goes directly)
      const agreementButton = screen.getByRole('button', { name: /move to agreement/i })
      await user.click(agreementButton)
      
      expect(mockUpdatePlotStatus).toHaveBeenCalledWith('test-plot-1', 'agreement', expect.objectContaining({
        name: 'John Doe',
        phone: '1234567890'
      }))
    })

    it('should properly handle agreement → registration transition', async () => {
      const user = userEvent.setup()
      
      const plot = createMockPlot('agreement')
      plot.agreement = createMockBooking('John Doe', '1234567890')
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Change to registration (uses existing agreement data)
      const registrationButton = screen.getByRole('button', { name: /move to registration/i })
      await user.click(registrationButton)
      
      expect(mockUpdatePlotStatus).toHaveBeenCalledWith('test-plot-1', 'registration', expect.objectContaining({
        name: 'John Doe',
        phone: '1234567890'
      }))
    })

    it('should allow any status → available without customer details', async () => {
      const user = userEvent.setup()
      
      const plot = createMockPlot('registration')
      plot.registration = createMockBooking('John Doe', '1234567890')
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Show advanced options and reset to available
      const advancedButton = screen.getByRole('button', { name: /show advanced options/i })
      await user.click(advancedButton)
      
      const availableButton = screen.getByRole('button', { name: /reset to available/i })
      await user.click(availableButton)
      
      expect(mockUpdatePlotStatus).toHaveBeenCalledWith('test-plot-1', 'available')
    })
  })

  describe('Workflow: Multiple Bookings Management', () => {
    it('should allow adding and removing multiple bookings', async () => {
      const user = userEvent.setup()
      
      let plot = createMockPlot('booked', [createMockBooking('John Doe', '1234567890')])
      
      const { rerender } = render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Add second booking through booking flow
      const addButton = screen.getByRole('button', { name: /add another customer/i })
      await user.click(addButton)
      
      await user.type(screen.getByLabelText('Customer Name *'), 'Jane Smith')
      await user.type(screen.getByLabelText('Phone Number *'), '9876543210')
      
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /confirm booking/i }))
      
      expect(mockAddBooking).toHaveBeenCalled()
      
      // Simulate two bookings now
      plot = createMockPlot('booked', [
        createMockBooking('John Doe', '1234567890'),
        createMockBooking('Jane Smith', '9876543210')
      ])
      rerender(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Should show 2 customers
      expect(screen.getByText('2 Customers')).toBeInTheDocument()
      
      // Remove one booking
      const removeButtons = screen.getAllByTitle('Remove booking')
      await user.click(removeButtons[0])
      
      expect(mockRemoveBooking).toHaveBeenCalledWith('test-plot-1', '1234567890')
    })

    it('should show correct messaging for multiple bookings', () => {
      const plot = createMockPlot('booked', [
        createMockBooking('John Doe', '1234567890'),
        createMockBooking('Jane Smith', '9876543210'),
        createMockBooking('Bob Johnson', '5555555555')
      ])
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByText('3 Customers')).toBeInTheDocument()
      expect(screen.getByText('Multiple Interest')).toBeInTheDocument()
      expect(screen.getByText('Choose Winner for Agreement')).toBeInTheDocument()
    })
  })

  describe('Workflow: Form Validation and UX', () => {
    it('should clear error messages when form is corrected', async () => {
      const user = userEvent.setup()
      
      const plot = createMockPlot('available')
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      // Try to book without filling form completely
      const bookButton = screen.getByRole('button', { name: /book this plot/i })
      await user.click(bookButton)
      
      // Try to proceed with empty name
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      expect(screen.getByText('Customer name is required')).toBeInTheDocument()
      
      // Fill the form properly
      await user.type(screen.getByLabelText('Customer Name *'), 'John Doe')
      await user.type(screen.getByLabelText('Phone Number *'), '1234567890')
      
      // Try next again
      await user.click(nextButton)
      
      // Should proceed to confirmation
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /confirm booking/i })).toBeInTheDocument()
      })
    })

    it('should show next steps buttons for booked plots', () => {
      const plot = createMockPlot('booked', [createMockBooking('John Doe', '1234567890')])
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByRole('button', { name: /move to agreement/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add another customer/i })).toBeInTheDocument()
    })

    it('should enable next button in booking flow when fields are filled', async () => {
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
      
      // Fill form
      await user.type(screen.getByLabelText('Customer Name *'), 'Jane Smith')
      await user.type(screen.getByLabelText('Phone Number *'), '9876543210')
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      expect(nextButton).toBeEnabled()
    })
  })

  describe('Workflow: Phone Number Formatting', () => {
    it('should display formatted phone numbers', () => {
      const plot = createMockPlot('booked', [createMockBooking('John Doe', '1234567890')])
      
      render(
        <PlotContextCard
          plot={plot}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByText('123-456-7890')).toBeInTheDocument()
    })

    it('should restrict phone input to numbers only in booking flow', async () => {
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
      
      const phoneInput = screen.getByLabelText('Phone Number *')
      await user.type(phoneInput, 'abc123def456')
      
      expect(phoneInput).toHaveValue('123456')
    })

    it('should limit phone input to 10 digits in booking flow', async () => {
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
      
      const phoneInput = screen.getByLabelText('Phone Number *')
      await user.type(phoneInput, '12345678901234')
      
      expect(phoneInput).toHaveValue('1234567890')
    })
  })
})