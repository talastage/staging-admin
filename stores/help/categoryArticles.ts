// stores/help/categoryArticles.ts
import { defineStore } from 'pinia'
import { useCategoryArticles } from '~/composables/help/useCategoryArticles'

export const useCategoryArticlesStore = defineStore('helpCategoryArticles', {
  state: () => ({
    category: null as any | null,
    articles: [] as any[],
    pagination: null as any | null,
    isLoading: false,
    error: null as string | null,
    currentPage: 1,
    perPage: 10,
    currentCategorySlug: null as string | null,
    isFetching: false, // Flag to prevent duplicate API calls
  }),

  actions: {
    setCurrentPage(page: number) {
      this.currentPage = page

      if (this.currentCategorySlug) {
        this.fetchCategory(this.currentCategorySlug)
      }
    },

    async loadCategoryData(categorySlug: string) {
      // Store the current category slug for pagination or refreshes
      this.currentCategorySlug = categorySlug

      // If we're already fetching, don't trigger another fetch
      if (this.isFetching) return

      await this.fetchCategory(categorySlug)
    },

    async fetchCategory(categorySlug: string) {
      if (this.isFetching) return

      this.isFetching = true
      this.isLoading = true
      this.error = null

      try {
        const { fetchCategory } = useCategoryArticles()
        const data = await fetchCategory(
          categorySlug,
          this.currentPage,
          this.perPage
        )

        this.category = data.category
        this.articles = data.direct_helps
        this.pagination = data.pagination
      } catch (error: any) {
        console.error('Error fetching category data:', error)
        this.error = 'Failed to load category articles'
      } finally {
        this.isLoading = false
        this.isFetching = false
      }
    },

    resetState() {
      this.category = null
      this.articles = []
      this.pagination = null
      this.error = null
      this.currentPage = 1
      this.currentCategorySlug = null
    },
  },
})
