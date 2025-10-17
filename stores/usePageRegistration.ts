import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'

// Type definitions
interface BasicInfo {
  name: string
  description: string
  page_category_slug: string
}

interface InvestmentSettings {
  max_investment_amount: number | null
  currency_id: number | null
}

interface Contacts {
  whatsapp_number: string
  phone_number: string
  email: string
}

interface Location {
  address: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string[]>
}

interface PageData {
  id: number
  slug: string
  name: string
  description: string
  avatar_url: string | null
  cover_url: string | null
  contacts: Contacts
  location: Location
  investment_settings: InvestmentSettings
  type: string
  created_at: string
  updated_at: string
}

// Updated Request payload type
interface PageRegistrationPayload {
  name: string
  description: string
  page_category_slug: string
  investment_settings: InvestmentSettings
  contacts: Contacts
  location: Location
  avatar_url: string
  cover_url: string
  type: string
}

// Store state interface
interface PageRegistrationState {
  basicInfo: BasicInfo
  investmentSettings: InvestmentSettings
  contactAndLocation: {
    contacts: Contacts
    location: Location
  }
  isSubmitting: boolean
  error: string | null
}

export const usePageRegistrationStore = defineStore('pageRegistration', {
  state: (): PageRegistrationState => ({
    basicInfo: {
      name: '',
      description: '',
      page_category_slug: 'investor',
    },
    investmentSettings: {
      max_investment_amount: null,
      currency_id: null,
    },
    contactAndLocation: {
      contacts: {
        whatsapp_number: '',
        phone_number: '',
        email: '',
      },
      location: {
        address: '',
      },
    },
    isSubmitting: false,
    error: null,
  }),

  actions: {
    async submitPage(): Promise<ApiResponse<PageData>> {
      this.isSubmitting = true
      this.error = null
      try {
        const { $axios } = useNuxtApp()
        const payload: PageRegistrationPayload = {
          name: this.basicInfo.name,
          description: this.basicInfo.description,
          page_category_slug: this.basicInfo.page_category_slug,
          investment_settings: this.investmentSettings,
          contacts: this.contactAndLocation.contacts,
          location: this.contactAndLocation.location,
          avatar_url: '',
          cover_url: '',
          type: this.basicInfo.page_category_slug,
        }
        const response = await $axios.post<ApiResponse<PageData>>(
          '/api/pages',
          payload
        )
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to create page'
        throw error
      } finally {
        this.isSubmitting = false
      }
    },
  },
})