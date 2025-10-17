// types/page.ts

// Existing interfaces
export interface Page {
  id: number
  name: string
  slug: string
  tagline?: string
  description?: string
  cover_url?: string
  avatar_url?: string
  is_verified: boolean
  status: string
  country?: {
    id: number
    name: string
  }
  talent_interests?: Array<{
    id: number
    name: string
  }>
  creator?: {
    id: number
    name: string
  }
  category?: {
    id: number
    name: string
    slug: string
  }
  subcategory?: {
    id: number
    name: string
    slug: string
  }
}

export interface PageCategory {
  id: number
  name: string
  slug: string
  description: string | null
  avatar_url: string | null
  cover_url: string | null
  status: 'active' | 'inactive' | 'archived'
  created_at: string
  updated_at: string
}

export interface PageSubcategory {
  id: number
  name: string
  slug: string
  description: string | null
  avatar_url: string | null
  cover_url: string | null
  page_category_id: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RecentSearch {
  query: string
  timestamp: number
}

// New interfaces for About section
export interface PageLocation {
  id?: number
  page_id: number
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  created_at?: string
  updated_at?: string
}

export interface PageInvestmentSettings {
  id?: number
  page_id: number
  max_investment_amount: number
  currency_id: number
  auto_match: boolean
  created_at?: string
  updated_at?: string
}

export interface PageContact {
  id?: number
  page_id: number
  whatsapp_number: string | null
  phone_number: string | null
  email: string | null
  website_url: string | null
  telegram: string | null
  facebook_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  created_at?: string
  updated_at?: string
}

export interface PageTalentInterest {
  id: number
  page_id: number
  talent_category_id: number
  talent_category: {
    id: number
    name: string
  }
  created_at?: string
  updated_at?: string
}

export interface AboutData {
  basic_info: {
    name: string
    description: string | null
    type: string
    category: string | null
    subcategory: string | null
    country: string | null
    is_verified: boolean
    verified_at: string | null
  }
  location: PageLocation | null
  investment_settings: PageInvestmentSettings | null
  talent_interests: PageTalentInterest[]
  contacts: PageContact | null
}

export interface EditForm {
  description: string
  location: PageLocation
  investment_settings: PageInvestmentSettings
  contacts: PageContact
}

export interface DialogState {
  description: boolean
  location: boolean
  investment: boolean
  contacts: boolean
  [key: string]: boolean
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

export interface AboutResponse extends ApiResponse<AboutData> {}
