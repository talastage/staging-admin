// stores/pageAuthStore.ts
import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'

export interface Creator {
  id: number
  name: string
  username: string
  // Add more fields if needed
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Subcategory {
  id: number
  name: string
  slug: string
}

export interface Country {
  id: number
  name: string
  code?: string | null
  flag?: string | null
}

export interface TalentInterest {
  id: number
  name: string
  slug: string
}

export interface Page {
  id: number
  name: string
  slug: string
  tagline: string
  description: string
  about: string
  username: string
  avatar_url: string
  cover_url: string
  is_verified: boolean
  verified_at: string | null
  status: string
  creator: Creator
  category: Category | null
  subcategory: Subcategory | null
  country: Country | null
  talent_interests: TalentInterest[]
  created_at: string
  updated_at: string
}

export const usePageAuthStore = defineStore('pageAuth', {
  state: () => ({
    page: null as Page | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchPageData(pageSlug: string) {
      this.loading = true
      this.error = null
      const { $axios } = useNuxtApp()
      try {
        const { data } = await $axios.get(`/api/pages/${pageSlug}`)
        // Assuming the response shape is { data: { ...pageData } }
        this.page = data.data as Page
      } catch (err: any) {
        console.error('Error fetching page data:', err)
        this.error = err.response?.data?.message || 'Failed to load page data'
        throw err
      } finally {
        this.loading = false
      }
    },
    resetPage() {
      this.page = null
      this.error = null
      this.loading = false
    },
  },
})
