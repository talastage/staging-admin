// stores\useDefaultAmountStore.ts
import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'

interface Amount {
  id: number
  amount: number
  formatted: string
}

interface Currency {
  id: number
  code: string
  symbol: string
}

interface DefaultAmountState {
  amounts: Amount[]
  currency: Currency | null
  loading: boolean
  error: string | null
}

export const useDefaultAmountStore = defineStore('defaultAmount', {
  state: (): DefaultAmountState => ({
    amounts: [],
    currency: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchDefaultAmounts() {
      const { $axios } = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const response = await $axios.get<{
          amounts: Amount[]
          currency: Currency
        }>('/api/default-amounts')
        this.amounts = response.data.amounts
        this.currency = response.data.currency
      } catch (error) {
        this.error = 'Failed to load default amounts. Please try again.'
        console.error('Error fetching default amounts:', error)
      } finally {
        this.loading = false
      }
    },
  },
})
