// stores\useTalentCategories.ts

import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'

interface Talent {
  id: number
  name: string
  category_id: number
  slug: string
  avatar_url?: string
}

interface TalentCategory {
  id: number
  name: string
  slug: string
}

interface ApiResponse<T> {
  data: T
  meta: {
    current_page: number | number[]
    last_page: number | number[]
    per_page: number | number[]
    total: number | number[]
    has_more_pages: boolean
    links?: Array<{
      url: string | null
      label: string
      active: boolean
    }>
    path?: string
    from?: number
    to?: number
  }
  links?: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

export const useTalentCategoryStore = defineStore('talentCategories', {
  state: () => ({
    categories: [] as TalentCategory[],
    currentCategory: null as TalentCategory | null,
    currentPage: 1,
    lastPage: 1,
    isFetching: false,
    error: null as string | null,
    searchTerm: '',
    hasMorePages: false,
    perPage: 16,
    total: 0,

    // Talent-related state
    talents: [] as Talent[],
    isFetchingTalents: false,
    talentsError: null as string | null,
    hasMoreTalents: false,
    currentCategorySlug: null as string | null,
    isFetchingCategory: false,
  }),

  getters: {
    hasMore: (state) => state.hasMorePages && !state.isFetching,
    hasMoreTalentsToLoad: (state) =>
      state.hasMoreTalents && !state.isFetchingTalents,
  },

  actions: {
    async fetchCategories(page = 1, replace = true) {
      if (this.isFetching) return []

      this.isFetching = true
      this.error = null

      try {
        const { $axios } = useNuxtApp()
        const response = await $axios.get<ApiResponse<TalentCategory[]>>(
          '/guest/talent/categories',
          {
            params: {
              page,
              per_page: this.perPage,
            },
          }
        )

        const { data, meta } = response.data

        if (replace) {
          this.categories = data
        } else {
          const newCategories = data.filter(
            (newCat) =>
              !this.categories.some(
                (existingCat) => existingCat.id === newCat.id
              )
          )
          this.categories = [...this.categories, ...newCategories]
        }

        this.updatePaginationMeta(meta)
        return data
      } catch (error) {
        this.handleError('Failed to fetch categories. Please try again.')
        return []
      } finally {
        this.isFetching = false
      }
    },

    async fetchCategoryTalents(slug: string, params = {}, append = false) {
      // Add check to prevent duplicate fetches
      if (
        this.isFetchingTalents ||
        (!append && this.currentCategorySlug === slug && this.talents.length)
      ) {
        return
      }

      if (this.currentCategorySlug !== slug && !append) {
        this.talents = []
        this.currentCategorySlug = slug
      }

      this.isFetchingTalents = true
      this.talentsError = null

      try {
        const { $axios } = useNuxtApp()
        const response = await $axios.get<ApiResponse<Talent[]>>(
          `/guest/talent/categories/${slug}/talents`,
          { params }
        )

        const { data, meta } = response.data

        if (append) {
          this.talents = [...this.talents, ...data]
        } else {
          this.talents = data
        }

        this.updatePaginationMeta(meta)
        return data
      } catch (error) {
        this.handleError('Failed to fetch talents. Please try again.')
        return []
      } finally {
        this.isFetchingTalents = false
      }
    },

    async fetchCategoryBySlug(slug: string) {
      if (!slug) return

      this.currentCategory = null
      this.isFetchingCategory = true
      this.error = null

      try {
        const { $axios } = useNuxtApp()
        const response = await $axios.get<TalentCategory>(
          `/guest/talent/categories/${slug}`
        )

        this.currentCategory = response.data
      } catch (error) {
        this.handleError('Failed to fetch category details. Please try again.')
      } finally {
        this.isFetchingCategory = false
      }
    },

    async loadMore() {
      if (!this.hasMore) return []
      return this.fetchCategories(this.currentPage + 1, false)
    },

    setSearchTerm(term: string) {
      if (this.searchTerm === term) return
      this.searchTerm = term
      this.resetCategories()
      this.fetchCategories()
    },

    resetCategories() {
      this.categories = []
      this.currentPage = 1
      this.lastPage = 1
      this.hasMorePages = false
      this.error = null
      this.total = 0
    },

    resetTalents() {
      this.talents = []
      this.currentPage = 1
      this.lastPage = 1
      this.hasMoreTalents = false
      this.talentsError = null
      this.currentCategorySlug = null
    },

    getSingleValue<T>(value: T | T[]): T {
      return Array.isArray(value) ? value[0] : value
    },

    updatePaginationMeta(meta: ApiResponse<any>['meta']) {
      this.hasMorePages = this.getSingleValue(meta.has_more_pages)
      this.hasMoreTalents = this.getSingleValue(meta.has_more_pages)
      this.currentPage = this.getSingleValue(meta.current_page)
      this.lastPage = this.getSingleValue(meta.last_page)
      this.perPage = this.getSingleValue(meta.per_page)
      this.total = this.getSingleValue(meta.total)
    },

    handleError(message: string) {
      console.error(message)
      this.error = message
    },
  },
})
