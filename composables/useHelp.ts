// composables/useHelp.ts
import { ref } from 'vue'
import { useNuxtApp } from '#app'

export function useHelp() {
  const { $axios } = useNuxtApp()

  // Existing refs
  const categories = ref([])
  const articles = ref([])
  const searchQuery = ref('')
  const loading = ref(false)

  // New refs for popular articles
  const popularArticles = ref([])
  const isLoadingPopular = ref(false)
  const popularError = ref<string | null>(null)

  // Existing methods
  const fetchCategories = async () => {
    loading.value = true
    try {
      const response = await $axios.get('/api/help/categories')
      categories.value = response.data
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      loading.value = false
    }
  }

  const searchArticles = async (query: string) => {
    loading.value = true
    try {
      const response = await $axios.get(`/api/help/search?q=${query}`)
      articles.value = response.data
    } catch (error) {
      console.error('Error searching articles:', error)
    } finally {
      loading.value = false
    }
  }

  // New: fetch popular articles
  const fetchPopularArticles = async (search = '') => {
    isLoadingPopular.value = true
    popularError.value = null
    try {
      const response = await $axios.get('/api/help/popular', {
        params: { search },
      })
      if (response.data && response.data.data) {
        popularArticles.value = response.data.data
      } else {
        popularArticles.value = []
      }
    } catch (error) {
      console.error('Failed to fetch popular articles:', error)
      popularError.value = 'Failed to load popular articles'
    } finally {
      isLoadingPopular.value = false
    }
  }

  return {
    // Existing state
    categories,
    articles,
    searchQuery,
    loading,
    fetchCategories,
    searchArticles,

    // New state/methods for popular articles
    popularArticles,
    isLoadingPopular,
    popularError,
    fetchPopularArticles,
  }
}
