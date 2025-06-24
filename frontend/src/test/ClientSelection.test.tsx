import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientSelectionModal } from '../components/ClientSelectionModal'
import { BookingInfo } from '../types'

const createMockBooking = (name: string, phone: string): BookingInfo => ({
  name,
  phone,
  bookingDate: new Date('2024-01-01T10:00:00Z')
})

describe('ClientSelectionModal Component', () => {
  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  const mockBookings = [
    createMockBooking('John Doe', '1234567890'),
    createMockBooking('Jane Smith', '9876543210'),
    createMockBooking('Bob Johnson', '5555555555')
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Modal Rendering', () => {
    it('should render modal with correct title for agreement', () => {
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      expect(screen.getByText('Select Client for Agreement')).toBeInTheDocument()
    })

    it('should render modal with correct title for registration', () => {
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="registration"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      expect(screen.getByText('Select Client for Registration')).toBeInTheDocument()
    })

    it('should display warning message with correct numbers', () => {
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      expect(screen.getByText(/Plot #123 has 3 booked clients/)).toBeInTheDocument()
      expect(screen.getByText(/2 other client.* will be removed/)).toBeInTheDocument()
    })
  })

  describe('Client List Display', () => {
    it('should display all booking details', () => {
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('123-456-7890')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('987-654-3210')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
      expect(screen.getByText('555-555-5555')).toBeInTheDocument()
    })

    it('should display booking dates', () => {
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      // Should show formatted date
      expect(screen.getAllByText(/Booked on/)).toHaveLength(3)
    })
  })

  describe('Client Selection', () => {
    it('should allow selecting a client', async () => {
      const user = userEvent.setup()
      
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      // Click on first client
      const firstClientRadio = screen.getByLabelText(/select john doe/i)
      expect(firstClientRadio).toBeTruthy()
      
      await user.click(firstClientRadio)
      
      expect(screen.getByText('Selected')).toBeInTheDocument()
    })

    it('should show summary when client is selected', async () => {
      const user = userEvent.setup()
      
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      // Select first client
      const firstClientRadio = screen.getByLabelText(/select john doe/i)
      await user.click(firstClientRadio)
      
      expect(screen.getByText('Summary of Changes:')).toBeInTheDocument()
      expect(screen.getByText(/John Doe.*will be moved to Agreement/)).toBeInTheDocument()
      expect(screen.getAllByText(/2 other client.* will be removed/)).toHaveLength(2) // Appears in warning and summary
    })

    it('should update summary when different client selected', async () => {
      const user = userEvent.setup()
      
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      // Select first client
      const firstClientRadio = screen.getByLabelText(/select john doe/i)
      await user.click(firstClientRadio)
      
      expect(screen.getByText(/John Doe.*will be moved to Agreement/)).toBeInTheDocument()
      
      // Select second client
      const secondClientRadio = screen.getByLabelText(/select jane smith/i)
      await user.click(secondClientRadio)
      
      expect(screen.getByText(/Jane Smith.*will be moved to Agreement/)).toBeInTheDocument()
      expect(screen.queryByText(/John Doe.*will be moved to Agreement/)).not.toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('should have disabled confirm button initially', () => {
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      const confirmButton = screen.getByRole('button', { name: /Move to Agreement/ })
      expect(confirmButton).toBeDisabled()
    })

    it('should enable confirm button when client selected', async () => {
      const user = userEvent.setup()
      
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      // Select a client
      const firstClientRadio = screen.getByLabelText(/select john doe/i)
      await user.click(firstClientRadio)
      
      const confirmButton = screen.getByRole('button', { name: /Move to Agreement/ })
      expect(confirmButton).toBeEnabled()
    })

    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      const cancelButton = screen.getByRole('button', { name: /Cancel/ })
      await user.click(cancelButton)
      
      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('should call onConfirm with selected booking when confirm clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      // Select first client
      const firstClientRadio = screen.getByLabelText(/select john doe/i)
      await user.click(firstClientRadio)
      
      // Click confirm
      const confirmButton = screen.getByRole('button', { name: /Move to Agreement/ })
      await user.click(confirmButton)
      
      expect(mockOnConfirm).toHaveBeenCalledWith(mockBookings[0])
    })

    it('should call onCancel when X button clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      const closeButton = screen.getByRole('button', { name: /close modal/i })
      await user.click(closeButton)
      
      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('Status-specific Behavior', () => {
    it('should show correct button text for registration', () => {
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="registration"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      expect(screen.getByRole('button', { name: /Move to Registration/ })).toBeInTheDocument()
    })

    it('should show correct colors for registration', async () => {
      const user = userEvent.setup()
      
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="registration"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      // Select a client to enable button
      const firstClientRadio = screen.getByLabelText(/select john doe/i)
      await user.click(firstClientRadio)
      
      const confirmButton = screen.getByRole('button', { name: /Move to Registration/ })
      expect(confirmButton).toHaveClass('bg-blue-500')
    })

    it('should show correct colors for agreement', async () => {
      const user = userEvent.setup()
      
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      // Select a client to enable button
      const firstClientRadio = screen.getByLabelText(/select john doe/i)
      await user.click(firstClientRadio)
      
      const confirmButton = screen.getByRole('button', { name: /Move to Agreement/ })
      expect(confirmButton).toHaveClass('bg-orange-500')
    })
  })

  describe('Edge Cases', () => {
    it('should handle single booking correctly', () => {
      const singleBooking = [mockBookings[0]]
      
      render(
        <ClientSelectionModal
          bookings={singleBooking}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      expect(screen.getByText(/Plot #123 has 1 booked clients/)).toBeInTheDocument()
      expect(screen.getByText(/0 other client.* will be removed/)).toBeInTheDocument()
    })

    it('should handle two bookings correctly', () => {
      const twoBookings = mockBookings.slice(0, 2)
      
      render(
        <ClientSelectionModal
          bookings={twoBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      expect(screen.getByText(/1 other client.* will be removed/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Move to Agreement/ })).toBeInTheDocument()
    })

    it('should support keyboard navigation with radio buttons', async () => {
      const user = userEvent.setup()
      
      render(
        <ClientSelectionModal
          bookings={mockBookings}
          targetStatus="agreement"
          plotNumber="123"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      )
      
      // Click first radio to select it, then test navigation
      const firstRadio = screen.getByLabelText(/select john doe/i)
      await user.click(firstRadio)
      expect(firstRadio).toBeChecked()
      
      // Use arrow keys to navigate between radio buttons
      await user.keyboard('{ArrowDown}')
      const secondRadio = screen.getByLabelText(/select jane smith/i)
      expect(secondRadio).toBeChecked()
    })
  })
})