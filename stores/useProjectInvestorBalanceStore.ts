// stores\useProjectInvestorBalanceStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

// Define the types based on the provided code
interface Currency {
  id: number
  name: string
  symbol: string
  code: string
}

interface UserInvestor {
  id: number
  username: string
  display_name: string
  profile_photo: string
}

interface PageInvestor {
  id: number
  slug: string
  name: string
  avatar_url: string
  type: string
}

interface InvestorType {
  is_user: boolean
  is_page: boolean
  type: 'user' | 'page'
}

interface BalanceData {
  id: number | null
  project_investor: UserInvestor | PageInvestor
  investor_type: InvestorType
  share_percentage: string
  balance: number
  pending_balance: number
  total_earned: number
  total_withdrawn: number
  last_earning_at: string | null
  last_withdrawal_at: string | null
  currency: Currency | null
  metadata: {
    created_at: string | null
    updated_at: string | null
  }
  page_creator?: UserInvestor
}

interface Balance {
  data: BalanceData
}

export const useProjectInvestorBalanceStore = defineStore(
  'projectInvestorBalance',
  () => {
    // State
    const balance = ref<Balance | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const currentAccessUuid = ref<string | null>(null)
    const currentInvestorId = ref<string | null>(null)

    const { $axios } = useNuxtApp()

    // Fetch the balance for a specific project investor
    async function fetchBalance(
      accessUuid: string,
      investorId: string
    ): Promise<void> {
      isLoading.value = true
      error.value = null
      currentAccessUuid.value = accessUuid
      currentInvestorId.value = investorId

      try {
        const response = await $axios.get<Balance>(
          `/api/projects/${accessUuid}/earnings/investors/${investorId}/balance`
        )
        balance.value = response.data
      } catch (err) {
        console.error('Error fetching project investor balance:', err)
        error.value =
          err instanceof Error ? err.message : 'Failed to fetch balance'
      } finally {
        isLoading.value = false
      }
    }

    // Update the balance after a transfer by refetching from the API
    async function updateBalanceAfterTransfer(): Promise<void> {
      if (!currentAccessUuid.value || !currentInvestorId.value) {
        console.warn(
          'Cannot update balance: accessUuid or investorId is missing'
        )
        return
      }
      await fetchBalance(currentAccessUuid.value, currentInvestorId.value)
    }

    return {
      balance,
      isLoading,
      error,
      fetchBalance,
      updateBalanceAfterTransfer,
    }
  }
)
