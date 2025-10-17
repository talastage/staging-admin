// stores/useRecommendedTalentCategoriesStore.ts
import { defineStore } from 'pinia'
import type {
  TalentCategory,
  TalentCategoriesResponse,
} from '@/types/talent-categories'

interface RecommendedTalentCategoriesState {
  categories: TalentCategory[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  hasMore: boolean
  scores: Record<number, number>
}

export const useRecommendedTalentCategoriesStore = defineStore(
  'recommendedTalentCategories',
  {
    state: (): RecommendedTalentCategoriesState => ({
      categories: [],
      loading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      hasMore: true,
      scores: {},
    }),

    actions: {
      async fetchCategories(page = 1) {
        const { $axios } = useNuxtApp()

        try {
          this.loading = true
          this.error = null

          const response = await $axios.get<TalentCategoriesResponse>(
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

          const { meta } = response.data
          this.currentPage = meta.current_page
          this.totalPages = meta.total_pages
          this.hasMore = meta.has_more_pages
          this.scores = meta.scores
        } catch (error) {
          this.error = 'Failed to fetch recommended talent categories'
          console.error('Error fetching recommended categories:', error)
        } finally {
          this.loading = false
        }
      },
    },
  }
)
