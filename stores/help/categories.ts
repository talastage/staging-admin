// stores/help/categories.ts

import { defineStore } from 'pinia'
import { useCategories } from '~/composables/help/useCategories'

export const useCategoriesStore = defineStore('helpCategories', {
  state: () => ({
    categories: [] as any[],
    isLoading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchCategories() {
      this.isLoading = true
      this.error = null
      try {
        const { fetchCategories } = useCategories()
        this.categories = await fetchCategories()
      } catch (error) {
        this.error = 'Failed to load help categories'
        const toast = useToast()
        toast.error('Failed to load categories')
      } finally {
        this.isLoading = false
      }
    },
  },
})
