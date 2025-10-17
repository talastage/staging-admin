// stores\useUserFansStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp } from '#app'

interface User {
  id: number
  first_name: string
  last_name: string
  username: string
  profile_photo: string
  talent: string
  is_fanned_by_auth_user: boolean
}

interface PaginationState {
  currentPage: number
  lastPage: number
  total: number
}

interface FanStatus {
  is_fanning: boolean
  fan_count: number
}

export const useUserFansStore = defineStore('useUserFans', () => {
  const fans = ref<User[]>([])
  const fanning = ref<User[]>([])
  const isFetching = ref(false)
  const isError = ref(false)
  const errorMessage = ref('')
  const fansPagination = ref<PaginationState>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  })
  const fanningPagination = ref<PaginationState>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  })
  const fanCounts = ref<Record<string, number>>({})
  const fanningCounts = ref<Record<string, number>>({})

  // New additions for improved fan status management
  const fanStatusCache = ref<Record<string, FanStatus>>({})
  const loading = ref<Record<string, boolean>>({})

  const { $axios } = useNuxtApp()

  async function fetchUsers(
    endpoint: string,
    storeRef: Ref<User[]>,
    paginationRef: Ref<PaginationState>,
    username: string,
    query = '',
    reset = false
  ) {
    if (reset) {
      paginationRef.value.currentPage = 1
      storeRef.value = []
    }

    if (
      paginationRef.value.currentPage > paginationRef.value.lastPage ||
      isFetching.value
    )
      return

    isFetching.value = true
    isError.value = false
    errorMessage.value = ''

    try {
      const response = await $axios.get(endpoint, {
        params: {
          search: query,
          page: paginationRef.value.currentPage,
        },
      })

      const newUsers =
        response.data[endpoint.includes('fans') ? 'fans' : 'fanning']

      if (paginationRef.value.currentPage === 1 || reset) {
        storeRef.value = newUsers
      } else {
        storeRef.value.push(...newUsers)
      }

      paginationRef.value = {
        currentPage: response.data.pagination.current_page + 1,
        lastPage: response.data.pagination.last_page,
        total: response.data.pagination.total,
      }
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error)
      isError.value = true
      errorMessage.value = `Failed to fetch ${
        endpoint.includes('fans') ? 'fans' : 'fanning'
      }. Please try again later.`
    } finally {
      isFetching.value = false
    }
  }

  async function fetchFans(username: string, query = '', reset = false) {
    await fetchUsers(
      `/api/fans/${username}/fans`,
      fans,
      fansPagination,
      username,
      query,
      reset
    )
  }

  async function fetchFanning(username: string, query = '', reset = false) {
    await fetchUsers(
      `/api/fans/${username}/fanning`,
      fanning,
      fanningPagination,
      username,
      query,
      reset
    )
  }

  // New method to get fan status with caching
  async function getFanStatus(username: string): Promise<FanStatus> {
    if (loading.value[username]) {
      // Return cached state while loading to prevent duplicate requests
      return (
        fanStatusCache.value[username] || { is_fanning: false, fan_count: 0 }
      )
    }

    loading.value[username] = true

    try {
      const response = await $axios.get(`/api/fans/${username}/status`)

      if (response.data.success) {
        fanStatusCache.value[username] = response.data.data
        // Update fan counts as well
        fanCounts.value[username] = response.data.data.fan_count
        return response.data.data
      }
      return { is_fanning: false, fan_count: 0 }
    } catch (error) {
      console.error('Error fetching fan status:', error)
      return { is_fanning: false, fan_count: 0 }
    } finally {
      loading.value[username] = false
    }
  }

  // New method to toggle fan status
  async function toggleFan(username: string) {
    loading.value[username] = true

    try {
      const response = await $axios.post(`/api/fans/${username}/toggle`)

      if (response.data.success) {
        // Update cache with new status
        fanStatusCache.value[username] = response.data.data
        // Update fan counts
        fanCounts.value[username] = response.data.data.fan_count

        // If in fans/fanning lists, update the user's status
        updateUserInLists(username, response.data.data.is_fanning)

        return {
          success: true,
          ...response.data.data,
        }
      }

      return {
        success: false,
        message: 'Failed to update fan status',
      }
    } catch (error) {
      console.error('Error toggling fan status:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred',
      }
    } finally {
      loading.value[username] = false
    }
  }

  // Helper to update user status in fans/fanning lists
  function updateUserInLists(username: string, isFanning: boolean) {
    // Update in fans list if present
    const fanIndex = fans.value.findIndex((user) => user.username === username)
    if (fanIndex !== -1) {
      fans.value[fanIndex].is_fanned_by_auth_user = isFanning
    }

    // Update in fanning list if present
    const fanningIndex = fanning.value.findIndex(
      (user) => user.username === username
    )
    if (fanningIndex !== -1) {
      fanning.value[fanningIndex].is_fanned_by_auth_user = isFanning
    }
  }

  async function fetchFansCount(username: string) {
    try {
      // Try to use cached value first
      if (fanStatusCache.value[username]) {
        fanCounts.value[username] = fanStatusCache.value[username].fan_count
        return fanCounts.value[username]
      }

      const response = await $axios.get(`/api/fans/${username}/fans/count`)
      fanCounts.value[username] = response.data.count
      return fanCounts.value[username]
    } catch (error) {
      console.error('Error fetching fan count:', error)
      throw error
    }
  }

  async function fetchFanningCount(username: string) {
    try {
      const response = await $axios.get(`/api/fans/${username}/fanning/count`)
      fanningCounts.value[username] = response.data.count
      return fanningCounts.value[username]
    } catch (error) {
      console.error('Error fetching fanning count:', error)
      throw error
    }
  }

  // Method to clear cache for a specific user or all users
  function clearCache(username: string | null = null) {
    if (username) {
      delete fanStatusCache.value[username]
    } else {
      fanStatusCache.value = {}
    }
  }

  function $reset() {
    fans.value = []
    fanning.value = []
    isFetching.value = false
    isError.value = false
    errorMessage.value = ''
    fansPagination.value = { currentPage: 1, lastPage: 1, total: 0 }
    fanningPagination.value = { currentPage: 1, lastPage: 1, total: 0 }
    fanCounts.value = {}
    fanningCounts.value = {}
    fanStatusCache.value = {}
    loading.value = {}
  }

  return {
    fans,
    fanning,
    isFetching,
    isError,
    errorMessage,
    fansPagination,
    fanningPagination,
    fanCounts,
    fanningCounts,
    fanStatusCache,
    loading,
    fetchFans,
    fetchFanning,
    fetchFansCount,
    fetchFanningCount,
    getFanStatus,
    toggleFan,
    clearCache,
    $reset,
  }
})
