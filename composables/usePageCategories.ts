// composables/usePageCategories.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { PageCategory } from '~/types/page'

interface PageCategoriesState {
  pageCategories: PageCategory[]
  loading: boolean
  error: Error | null
  selectedCategory: PageCategory | null
}

interface FetchPageCategoriesResponse {
  success: boolean
  data: PageCategory[]
}

export const usePageCategoriesStore = defineStore('pageCategories', () => {
  const state = ref<PageCategoriesState>({
    pageCategories: [],
    loading: false,
    error: null,
    selectedCategory: null,
  })

  /**
   * Fetch all page categories
   */
  const fetchPageCategories = async (): Promise<void> => {
    state.value.loading = true
    state.value.error = null

    try {
      const { data } = await useFetch<FetchPageCategoriesResponse>(
        '/api/pages/categories'
      )

      if (data.value) {
        state.value.pageCategories = data.value.data
      }
    } catch (err) {
      state.value.error = err as Error
      console.error('Error fetching page categories:', err)
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Get a specific category by its slug
   */
  const getPageCategoryBySlug = computed(() => {
    return (slug: string): PageCategory | undefined => {
      return state.value.pageCategories.find(
        (category) => category.slug === slug
      )
    }
  })

  /**
   * Get a specific category by its ID
   */
  const getPageCategoryById = computed(() => {
    return (id: number): PageCategory | undefined => {
      return state.value.pageCategories.find((category) => category.id === id)
    }
  })

  /**
   * Get all active categories
   */
  const activePageCategories = computed((): PageCategory[] => {
    return state.value.pageCategories.filter(
      (category) => category.status === 'active'
    )
  })

  /**
   * Set selected category
   */
  const setSelectedCategory = (category: PageCategory | null): void => {
    state.value.selectedCategory = category
  }

  /**
   * Select category by slug
   */
  const selectCategoryBySlug = (slug: string): void => {
    const category = getPageCategoryBySlug.value(slug)
    state.value.selectedCategory = category || null
  }

  /**
   * Get categories by status
   */
  const getPageCategoriesByStatus = computed(() => {
    return (status: PageCategory['status']): PageCategory[] => {
      return state.value.pageCategories.filter(
        (category) => category.status === status
      )
    }
  })

  /**
   * Search categories by name
   */
  const searchPageCategories = computed(() => {
    return (searchTerm: string): PageCategory[] => {
      const term = searchTerm.toLowerCase()
      return state.value.pageCategories.filter((category) =>
        category.name.toLowerCase().includes(term)
      )
    }
  })

  /**
   * Clear all categories
   */
  const clearPageCategories = (): void => {
    state.value.pageCategories = []
    state.value.selectedCategory = null
  }

  /**
   * Check if categories are loaded
   */
  const hasLoadedCategories = computed((): boolean => {
    return state.value.pageCategories.length > 0
  })

  return {
    // State
    pageCategories: computed(() => state.value.pageCategories),
    loading: computed(() => state.value.loading),
    error: computed(() => state.value.error),
    selectedCategory: computed(() => state.value.selectedCategory),

    // Actions
    fetchPageCategories,
    setSelectedCategory,
    selectCategoryBySlug,
    clearPageCategories,

    // Getters
    getPageCategoryBySlug,
    getPageCategoryById,
    activePageCategories,
    getPageCategoriesByStatus,
    searchPageCategories,
    hasLoadedCategories,
  }
})

// Type for external use
export type PageCategoriesStore = ReturnType<typeof usePageCategoriesStore>
