export type PlotStatus = 'available' | 'booked' | 'agreement' | 'registration'

export interface BookingInfo {
  name: string
  phone: string
  bookingDate: Date
}

export interface Plot {
  id: string
  plotNumber: string
  dimension: string // e.g., "30×40"
  area: number // in sq ft
  status: PlotStatus
  row: number
  col: number
  bookings?: BookingInfo[] // Multiple bookings for 'booked' status
  agreement?: BookingInfo // Single booking for 'agreement' status
  registration?: BookingInfo // Single booking for 'registration' status
  lastUpdated: Date
}

export interface Layout {
  id: string
  name: string
  totalArea: string // e.g., "22 acres"
  totalPlots: number
  plots: Plot[]
  createdAt: Date
  updatedAt: Date
}

export interface PlotDefinition {
  plotNumber: string
  dimension: string
  area: number
  row: number
  col: number
}

export interface LayoutTemplate {
  rows: number
  columns: number
  plotDefinitions: PlotDefinition[]
}

export interface Project {
  id: string
  name: string
  totalPlots: number
  layoutTemplate?: LayoutTemplate
  createdAt: Date
}

export interface FilterState {
  status: PlotStatus | 'all'
  searchQuery: string
  multipleBookings: boolean
}

export interface User {
  id: string
  name: string
  role: 'manager' | 'viewer'
}

export interface DashboardStats {
  totalPlots: number
  available: number
  booked: number
  agreement: number
  registration: number
  percentageSold: number
}