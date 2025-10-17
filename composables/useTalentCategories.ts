// composables\useTalentCategories.ts

import { ref } from 'vue'
import { useApi } from '~/composables/useApi'

export function useTalentCategories() {
  // Existing state for fetching all categories
  const categories = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // New state for fetching a single category by slug
  const currentCategory = ref<any>(null)
  const isLoadingCategory = ref(false)
  const errorCategory = ref<string | null>(null)

  // New state for fetching popular categories
  const popularCategories = ref<any[]>([])
  const isLoadingPopular = ref(false)
  const errorPopular = ref<string | null>(null)

  const api = useApi()

  // Existing function to fetch all categories
  const fetchCategories = async () => {
    isLoading.value = true
    error.value = null

    try {
      const data = await api.get<{ data: any }>('/guest/talent/categories')
      categories.value = data.data
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // New function to fetch a category by slug
  const fetchCategoryBySlug = async (slug: string) => {
    if (!slug) return

    currentCategory.value = null
    isLoadingCategory.value = true
    errorCategory.value = null

    try {
      const response = await api.get<{ data: any }>(
        `/guest/talent/categories/${slug}`
      )
      currentCategory.value = response.data.data
    } catch (err: any) {
      errorCategory.value = err.message
    } finally {
      isLoadingCategory.value = false
    }
  }

  // New function to fetch popular talent categories
  const fetchPopularCategories = async () => {
    isLoadingPopular.value = true
    errorPopular.value = null

    try {
      const response = await api.get<{ data: any }>(
        '/guest/talent/categories/popular'
      )
      popularCategories.value = response.data
    } catch (err: any) {
      errorPopular.value = err.message
    } finally {
      isLoadingPopular.value = false
    }
  }

  return {
    categories,
    currentCategory,
    popularCategories,
    isLoading,
    isLoadingCategory,
    isLoadingPopular,
    error,
    errorCategory,
    errorPopular,
    fetchCategories,
    fetchCategoryBySlug,
    fetchPopularCategories,
  }
}
