// composables/useProjectInvestorsEarnings.ts
import { ref, Ref } from 'vue'

interface InvestorEarnings {
  id: number
  share_percentage: number
  type: 'creator' | 'investor'
  status: 'pending' | 'approved' | 'rejected'
  approved_at: string
  investor: {
    id: number
    username?: string
    display_name?: string
    profile_photo?: string
    slug?: string
    name?: string
    avatar_url?: string
    type?: string
  }
  earnings: {
    total_gross_amount: number
    total_net_amount: number
    total_app_service_fee: number
  }
}

export function useProjectInvestorsEarnings() {
  const { $axios } = useNuxtApp()
  const investors = ref<InvestorEarnings[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    perPage: 10,
  })

  async function fetchInvestors(accessUuid: string, page: number = 1) {
    loading.value = true
    error.value = null

    try {
      const response = await $axios.get(
        `/api/projects/${accessUuid}/earnings/investors`,
        {
          params: {
            page,
            per_page: pagination.value.perPage,
          },
        }
      )

      investors.value = response.data.data
      pagination.value = {
        currentPage: response.data.meta.current_page,
        totalPages: response.data.meta.last_page,
        totalItems: response.data.meta.total,
        perPage: response.data.meta.per_page,
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch investors'
    } finally {
      loading.value = false
    }
  }

  return {
    investors,
    loading,
    error,
    pagination,
    fetchInvestors,
  }
}
