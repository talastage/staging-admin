// composables/usePageSubcategories.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { PageSubcategory } from '~/types/page'

interface PageSubcategoriesState {
  pageSubcategories: Record<string, PageSubcategory[]>
  loading: boolean
  error: Error | null
}

interface FetchPageSubcategoriesResponse {
  success: boolean
  data: PageSubcategory[]
}

export const usePageSubcategoriesStore = defineStore(
  'pageSubcategories',
  () => {
    const state = ref<PageSubcategoriesState>({
      pageSubcategories: {},
      loading: false,
      error: null,
    })

    /**
     * Fetch subcategories for a specific category
     * @param categorySlug - The slug of the parent category
     */
    const fetchPageSubcategories = async (
      categorySlug: string
    ): Promise<void> => {
      state.value.loading = true
      state.value.error = null

      try {
        const { data } = await useFetch<FetchPageSubcategoriesResponse>(
          `/api/pages/categories/${categorySlug}/subcategories`
        )

        if (data.value) {
          state.value.pageSubcategories[categorySlug] = data.value.data
        }
      } catch (err) {
        state.value.error = err as Error
        console.error('Error fetching page subcategories:', err)
      } finally {
        state.value.loading = false
      }
    }

    /**
     * Get subcategories for a specific category
     */
    const getPageSubcategoriesByCategory = computed(() => {
      return (categorySlug: string): PageSubcategory[] => {
        return state.value.pageSubcategories[categorySlug] || []
      }
    })

    /**
     * Get a specific subcategory by its slug within a category
     */
    const findPageSubcategoryBySlug = computed(() => {
      return (
        categorySlug: string,
        subcategorySlug: string
      ): PageSubcategory | undefined => {
        const subcategories = state.value.pageSubcategories[categorySlug] || []
        return subcategories.find((sub) => sub.slug === subcategorySlug)
      }
    })

    /**
     * Get active subcategories for a category
     */
    const getActivePageSubcategories = computed(() => {
      return (categorySlug: string): PageSubcategory[] => {
        const subcategories = state.value.pageSubcategories[categorySlug] || []
        return subcategories.filter((sub) => sub.is_active)
      }
    })

    /**
     * Check if subcategories are loaded for a category
     */
    const hasLoadedPageSubcategories = computed(() => {
      return (categorySlug: string): boolean => {
        return !!state.value.pageSubcategories[categorySlug]
      }
    })

    /**
     * Clear subcategories for a specific category
     */
    const clearPageSubcategories = (categorySlug: string): void => {
      delete state.value.pageSubcategories[categorySlug]
    }

    /**
     * Clear all subcategories
     */
    const clearAllPageSubcategories = (): void => {
      state.value.pageSubcategories = {}
    }

    return {
      // State
      pageSubcategories: computed(() => state.value.pageSubcategories),
      loading: computed(() => state.value.loading),
      error: computed(() => state.value.error),

      // Actions
      fetchPageSubcategories,
      clearPageSubcategories,
      clearAllPageSubcategories,

      // Getters
      getPageSubcategoriesByCategory,
      findPageSubcategoryBySlug,
      getActivePageSubcategories,
      hasLoadedPageSubcategories,
    }
  }
)

// Type for external use
export type PageSubcategoriesStore = ReturnType<
  typeof usePageSubcategoriesStore
>
