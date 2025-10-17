// composables/premiering/usePremieringCategories.ts

import { ref, computed } from 'vue'

export const usePremieringCategories = () => {
  const categories = ref([])
  const categoriesWithProjects = ref([])
  const currentCategory = ref(null)
  const currentCategoryProjects = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
    total: 0,
  })

  // Fetch all categories
  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const { data } = await useNuxtApp().$axios.get(
        '/api/projects/premiering-categories'
      )
      const uniqueCategories = data.data.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.id === value.id)
      )
      categories.value = uniqueCategories
    } catch (err) {
      error.value = 'Failed to fetch categories'
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch categories with their projects
  const fetchCategoriesWithProjects = async () => {
    loading.value = true
    error.value = null
    try {
      const { data } = await useNuxtApp().$axios.get(
        '/api/projects/premiering-categories/with-projects'
      )
      categoriesWithProjects.value = data.data
    } catch (err) {
      error.value = 'Failed to fetch categories with projects'
      console.error('Error fetching categories with projects:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch projects for a specific category
  const fetchCategoryProjects = async (slug, page = 1) => {
    try {
      const { data } = await useNuxtApp().$axios.get(
        `/api/projects/premiering-categories/${slug}`,
        {
          params: { page },
        }
      )
      console.log('API Response:', data)
      return data
    } catch (err) {
      console.error('Error fetching category projects:', err)
      throw err
    }
  }

  const loadMoreProjects = async () => {
    if (
      !loading.value &&
      currentCategory.value &&
      pagination.value.currentPage < pagination.value.lastPage
    ) {
      await fetchCategoryProjects(
        currentCategory.value.slug,
        pagination.value.currentPage + 1
      )
    }
  }

  // Reset current category state
  const resetCurrentCategory = () => {
    currentCategory.value = null
    currentCategoryProjects.value = []
    pagination.value = {
      currentPage: 1,
      lastPage: 1,
      perPage: 20,
      total: 0,
    }
  }

  // Computed properties
  const hasMorePages = computed(
    () => pagination.value.currentPage < pagination.value.lastPage
  )

  const isLoading = computed(() => loading.value)

  const getCategoryBySlug = (slug) =>
    categories.value.find((category) => category.slug === slug)

  return {
    // State
    categories,
    categoriesWithProjects,
    currentCategory,
    currentCategoryProjects,
    loading,
    error,
    pagination,

    // Actions
    fetchCategories,
    fetchCategoriesWithProjects,
    fetchCategoryProjects,
    loadMoreProjects,
    resetCurrentCategory,

    // Computed
    hasMorePages,
    isLoading,
    getCategoryBySlug,
  }
}
