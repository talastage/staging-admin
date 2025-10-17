// stores/usePageSearchStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Page } from '@/types/page'
import type { RecentSearch } from '@/types/page'
import { useNuxtApp } from '#app'
import { useStorage } from '@vueuse/core'

export const usePageSearchStore = defineStore('pageSearch', () => {
  const { $axios } = useNuxtApp()

  // State
  const pages = ref<Page[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchCache = new Map<string, { data: Page[]; timestamp: number }>()
  const recentSearches = useStorage<RecentSearch[]>('recent-searches', [])

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000
  // Maximum number of recent searches to store
  const MAX_RECENT_SEARCHES = 5

  // Computed properties
  const hasResults = computed(() => pages.value.length > 0)
  const noResults = computed(() => !isLoading.value && pages.value.length === 0)

  // Actions
  const searchPages = async (query: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Check cache first
      const cached = searchCache.get(query)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        pages.value = cached.data
        isLoading.value = false
        return
      }

      const { data } = await $axios.get('/api/pages/search', {
        params: {
          search: query,
          per_page: 10,
        },
      })

      pages.value = data.data

      // Update cache
      searchCache.set(query, {
        data: data.data,
        timestamp: Date.now(),
      })

      // Add to recent searches
      addToRecentSearches(query)
    } catch (err: any) {
      error.value = err.message || 'Failed to search pages'
      pages.value = []
    } finally {
      isLoading.value = false
    }
  }

  const addToRecentSearches = (query: string) => {
    const searches = recentSearches.value
    // Remove if already exists
    const index = searches.findIndex((s) => s.query === query)
    if (index > -1) {
      searches.splice(index, 1)
    }
    // Add to beginning
    searches.unshift({
      query,
      timestamp: Date.now(),
    })
    // Limit size
    recentSearches.value = searches.slice(0, MAX_RECENT_SEARCHES)
  }

  const clearRecentSearches = () => {
    recentSearches.value = []
  }

  const clearSearch = () => {
    pages.value = []
    error.value = null
  }

  const clearCache = () => {
    searchCache.clear()
  }

  return {
    pages,
    isLoading,
    error,
    hasResults,
    noResults,
    recentSearches,
    searchPages,
    clearSearch,
    clearRecentSearches,
    clearCache,
  }
})
