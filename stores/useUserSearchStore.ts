// stores\useUserSearchStore.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'

interface UserSearchResult {
  id: number
  username: string
  display_name: string
  profile_photo: string | null
  status: 'active' | 'pending' | 'suspended'
  role: string
  status_color: string
}

interface SearchResponse {
  data: UserSearchResult[]
}

export const useUserSearchStore = defineStore('userSearch', () => {
  const searchResults = ref<UserSearchResult[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const searchUsers = async (query: string): Promise<SearchResponse> => {
    if (!query.trim()) {
      searchResults.value = []
      return { data: [] }
    }

    isLoading.value = true
    error.value = null

    try {
      const { $axios } = useNuxtApp()
      const response = await $axios.get<SearchResponse>('/api/search-users', {
        params: { query },
      })

      searchResults.value = response.data.data
      return response.data
    } catch (err) {
      error.value = 'Failed to search users. Please try again.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearSearch = () => {
    searchResults.value = []
    error.value = null
  }

  return {
    searchResults,
    isLoading,
    error,
    searchUsers,
    clearSearch,
  }
})
