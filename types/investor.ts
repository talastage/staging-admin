// types/investor.ts

// Main Response interfaces
export interface InvestorResponse {
  data: Investment[]
  meta: PaginationMeta
  project: Project
}

export interface SingleInvestmentResponse {
  data: Investment
  message?: string
}

// Investment and Investor interfaces
export interface Investment {
  id: number
  investor: InvestorUser
  share_percentage: number
  status: InvestmentStatus
  created_at: string
  updated_at?: string
  approved_at?: string | null
  rejected_at?: string | null
  notes?: string | null
  updateStatus?: UpdateRequestStatus
  earnings?: InvestmentEarning[]
}

export interface InvestorUser {
  id: number
  username: string
  display_name: string
  profile_photo: string
}

// Project interface
export interface Project {
  id: number
  name: string
  total_investors: number
  total_investment: string
}

// Pagination interface
export interface PaginationMeta {
  total: number
  per_page: number
  current_page: number
  last_page: number
}

// Status and Update types
export type InvestmentStatus = 'pending' | 'approved' | 'rejected'
export type UpdateRequestStatus = 'pending' | 'approved' | 'rejected' | null

// Investment Earnings interface
export interface InvestmentEarning {
  id: number
  amount: number
  currency: string
  paid_at: string | null
  status: 'pending' | 'paid' | 'cancelled'
}

// Investment Update interfaces
export interface InvestmentUpdateRequest {
  id: number
  investment_id: number
  old_share_percentage: number
  new_share_percentage: number
  status: UpdateRequestStatus
  notes?: string
  created_at: string
  approved_at?: string
  rejected_at?: string
}

export interface InvestmentUpdateData {
  share_percentage?: number
  notes?: string
}

// API Response interfaces
export interface ApiResponse<T> {
  data: T
  message?: string
  errors?: Record<string, string[]>
}

// Error interface
export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

// Request interfaces
export interface CreateInvestmentData {
  investor_id: number
  share_percentage: number
  notes?: string
}

export interface UpdateInvestmentData {
  share_percentage?: number
  notes?: string
  status?: InvestmentStatus
}

// Helper type for pagination requests
export interface PaginationParams {
  page?: number
  per_page?: number
  sort_by?: string
  sort_direction?: 'asc' | 'desc'
}

// Filter interfaces
export interface InvestmentFilters extends PaginationParams {
  status?: InvestmentStatus
  search?: string
  date_from?: string
  date_to?: string
}

// Statistics interface
export interface InvestmentStatistics {
  total_investments: number
  total_share_percentage: number
  average_share_percentage: number
  pending_investments: number
  approved_investments: number
  rejected_investments: number
}
