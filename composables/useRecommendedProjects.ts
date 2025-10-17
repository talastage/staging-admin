// composables/useRecommendedProjects.ts

import { ref, computed } from 'vue'
import type { Project } from '@/types/project'
import type { PremieringCategoryBase } from '~/types/PremieringCategoryBase'
import { useNuxtApp } from '#app'

export interface RecommendedProjectsResponse {
  projects: Project[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export const useRecommendedProjects = (initialProjects: Project[] = []) => {
  const { $api } = useNuxtApp()

  // State
  const recommendedProjects = ref<Project[]>([...initialProjects])
  const initialLoading = ref(initialProjects.length === 0)
  
  // Watch for changes to initialProjects
  watch(() => initialProjects, (newProjects) => {
    if (newProjects && newProjects.length > 0) {
      recommendedProjects.value = [...newProjects]
    }
  }, { immediate: true, deep: true })
  const currentCategoryProjects = ref<Project[]>([])
  const selectedCategory = ref<PremieringCategoryBase | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 8,
    total: 0,
  })

  // Computed
  const isLoading = computed(() => loading.value)

  const hasError = computed(() => error.value !== null)
  const hasMorePages = computed(
    () => pagination.value.currentPage < pagination.value.lastPage
  )
  const displayedProjects = computed(() =>
    selectedCategory.value
      ? currentCategoryProjects.value
      : recommendedProjects.value
  )

  /**
   * Fetch all recommended projects
   * @param page Page number to fetch
   * @param reset Whether to reset existing projects or append
   */
  const fetchRecommendedProjects = async (page = 1, reset = true) => {
    try {
      loading.value = true
      error.value = null

      const response = await $api.get('/api/recommended/projects', {
        params: { page },
      })

      console.log('All projects response:', response.data)

      if (reset) {
        recommendedProjects.value = response.data.projects || []
      } else {
        recommendedProjects.value = [
          ...recommendedProjects.value,
          ...(response.data.projects || []),
        ]
      }

      // Update pagination if we're not in a category view
      if (!selectedCategory.value) {
        pagination.value = {
          currentPage: response.data.pagination?.current_page || page,
          lastPage: response.data.pagination?.last_page || 1,
          perPage: response.data.pagination?.per_page || 8,
          total: response.data.pagination?.total || 0,
        }
      }

      return response.data
    } catch (err) {
      console.error('Error fetching recommended projects:', err)
      error.value = 'Failed to fetch recommended projects'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch recommended projects by category
   * @param categorySlug The category slug to filter by
   * @param page Page number to fetch
   * @param reset Whether to reset existing projects or append
   */
  const fetchRecommendedProjectsByCategory = async (
    categorySlug: string,
    page = 1,
    reset = true
  ) => {
    try {
      loading.value = true
      error.value = null

      const response = await $api.get(
        `/guest/recommended/projects/${categorySlug}`,
        {
          params: { page },
        }
      )

      console.log('Category projects response:', response.data)

      if (reset) {
        currentCategoryProjects.value = response.data.projects || []
      } else {
        currentCategoryProjects.value = [
          ...currentCategoryProjects.value,
          ...(response.data.projects || []),
        ]
      }

      // Update pagination when in category view
      pagination.value = {
        currentPage: response.data.pagination?.current_page || page,
        lastPage: response.data.pagination?.last_page || 1,
        perPage: response.data.pagination?.per_page || 8,
        total: response.data.pagination?.total || 0,
      }

      return response.data
    } catch (err) {
      console.error(
        `Error fetching recommended projects for category ${categorySlug}:`,
        err
      )
      error.value = `Failed to fetch recommended projects for this category`
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Set the selected category and fetch its projects
   * @param category The category to select
   */
  const selectCategory = async (category: PremieringCategoryBase | null) => {
    selectedCategory.value = category

    if (category) {
      await fetchRecommendedProjectsByCategory(category.slug)
    } else {
      // If no category is selected, make sure we have the latest recommended projects
      if (recommendedProjects.value.length === 0) {
        await fetchRecommendedProjects()
      }
    }
  }

  /**
   * Load more projects based on current state (all projects or category-specific)
   */
  const loadMoreProjects = async () => {
    if (loading.value || !hasMorePages.value) return

    const nextPage = pagination.value.currentPage + 1

    if (selectedCategory.value) {
      await fetchRecommendedProjectsByCategory(
        selectedCategory.value.slug,
        nextPage,
        false
      )
    } else {
      await fetchRecommendedProjects(nextPage, false)
    }
  }

  /**
   * Reset the state
   */
  const resetState = () => {
    recommendedProjects.value = []
    currentCategoryProjects.value = []
    selectedCategory.value = null
    error.value = null
    pagination.value = {
      currentPage: 1,
      lastPage: 1,
      perPage: 8,
      total: 0,
    }
  }

  return {
    // State
    recommendedProjects,
    currentCategoryProjects,
    selectedCategory,
    loading,
    error,
    pagination,

    // Computed
    isLoading,
    initialLoading,
    hasError,
    hasMorePages,
    displayedProjects,

    // Methods
    fetchRecommendedProjects,
    fetchRecommendedProjectsByCategory,
    selectCategory,
    loadMoreProjects,
    resetState,
  }
}
