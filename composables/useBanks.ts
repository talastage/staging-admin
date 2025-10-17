// composables/useBanks.ts
import { ref, computed } from 'vue'
import { useNuxtApp } from '#app'

interface Bank {
  id: number
  name: string
  logo_url?: string
}

interface BankSearchParams {
  search?: string
  country_id?: number
  limit?: number
  offset?: number
}

export const useBanks = () => {
  const { $axios } = useNuxtApp()

  // State
  const banks = ref<Bank[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const totalCount = ref(0)
  const hasMore = ref(false)

  // Computed
  const filteredBanks = computed(() => {
    if (!searchQuery.value) return banks.value

    const query = searchQuery.value.toLowerCase()
    return banks.value.filter((bank) => bank.name.toLowerCase().includes(query))
  })

  // Search banks with server-side filtering for efficiency
  const searchBanks = async (params: BankSearchParams = {}) => {
    loading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()

      if (params.search) queryParams.append('search', params.search)
      if (params.country_id)
        queryParams.append('country_id', params.country_id.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.offset) queryParams.append('offset', params.offset.toString())

      const response = await $axios.get(
        `/api/banks/search?${queryParams.toString()}`
      )

      // If it's a new search (offset = 0), replace banks; otherwise append
      if (!params.offset || params.offset === 0) {
        banks.value = response.data.banks || []
      } else {
        banks.value.push(...(response.data.banks || []))
      }

      totalCount.value = response.data.total || 0
      hasMore.value = response.data.has_more || false

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error searching banks'
      console.error('Error searching banks:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch initial banks (with pagination support)
  const fetchBanks = async (params: BankSearchParams = {}) => {
    return await searchBanks(params)
  }

  // Load more banks (for pagination)
  const loadMoreBanks = async (params: BankSearchParams = {}) => {
    if (loading.value || !hasMore.value) return

    const offset = banks.value.length
    return await searchBanks({ ...params, offset })
  }

  // Clear search and reset to initial state
  const clearSearch = () => {
    searchQuery.value = ''
    banks.value = []
    totalCount.value = 0
    hasMore.value = false
    error.value = null
  }

  // Debounced search function
  let searchTimeout: NodeJS.Timeout
  const debouncedSearch = (query: string, delay: number = 300) => {
    clearTimeout(searchTimeout)
    searchQuery.value = query

    searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        await searchBanks({ search: query, limit: 50 })
      } else {
        await fetchBanks({ limit: 50 })
      }
    }, delay)
  }

  // Get bank by ID
  const getBankById = (id: number): Bank | undefined => {
    return banks.value.find((bank) => bank.id === id)
  }

  return {
    // State
    banks: readonly(banks),
    loading: readonly(loading),
    error: readonly(error),
    searchQuery: readonly(searchQuery),
    totalCount: readonly(totalCount),
    hasMore: readonly(hasMore),

    // Computed
    filteredBanks,

    // Methods
    fetchBanks,
    searchBanks,
    loadMoreBanks,
    clearSearch,
    debouncedSearch,
    getBankById,
  }
}
