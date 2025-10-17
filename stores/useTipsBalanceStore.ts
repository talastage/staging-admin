// stores/useTipsBalanceStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Balance } from '~/types/tips'

export const useTipsBalanceStore = defineStore('tipsBalance', () => {
  const balance = ref<Balance | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const { $axios } = useNuxtApp()

  const fetchBalance = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $axios.get<{ data: Balance }>(
        '/api/user/tips/balance'
      )
      balance.value = response.data.data
    } catch (err) {
      console.error('Error fetching balance:', err)
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch balance'
    } finally {
      isLoading.value = false
    }
  }

  const updateBalanceAfterTransfer = async (amount: number): Promise<void> => {
    if (!balance.value) return

    // Optimistically update balance
    balance.value = {
      ...balance.value,
      balance: String(Number(balance.value.balance) - amount),
      total_withdrawn: String(Number(balance.value.total_withdrawn) + amount),
      last_withdrawal_at: new Date().toISOString(),
    }

    // Then fetch the latest balance from server to ensure accuracy
    await fetchBalance()
  }

  return {
    balance,
    isLoading,
    error,
    fetchBalance,
    updateBalanceAfterTransfer,
  }
})
