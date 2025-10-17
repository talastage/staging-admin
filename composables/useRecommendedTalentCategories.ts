// composables/useRecommendedTalentCategories.ts
import { defineStore } from 'pinia'
import type { TalentCategory } from '@/types/categories'

interface ExtendedTalentCategory extends TalentCategory {
  description?: string
}

interface TalentCategoriesState {
  categories: ExtendedTalentCategory[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  hasMore: boolean
}

export const useRecommendedTalentCategories = defineStore(
  'recommendedTalentCategories',
  {
    state: (): TalentCategoriesState => ({
      categories: [],
      loading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      hasMore: true,
    }),

    actions: {
      async fetchCategories(page = 1) {
        const { $axios } = useNuxtApp()

        try {
          this.loading = true
          this.error = null

          const response = await $axios.get(
            '/guest/recommended/talents/categories',
            {
              params: { page, per_page: 5 },
            }
          )

          if (page === 1) {
            this.categories = response.data.data
          } else {
            this.categories.push(...response.data.data)
          }

          this.currentPage = response.data.meta.current_page
          this.totalPages = response.data.meta.total_pages
          this.hasMore = response.data.meta.has_more_pages
        } catch (error) {
          this.error = 'Failed to fetch categories'
          console.error('Error fetching categories:', error)
        } finally {
          this.loading = false
        }
      },
    },
  }
)
