// stores\useCurrencies.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useNuxtApp } from '#app'

interface Currency {
  id: number
  name: string
  code: string
  symbol: string
  is_default: boolean
  is_active: boolean
}

export const useCurrencyStore = defineStore('currency', () => {
  const currencies = ref<Currency[]>([])
  const userCurrency = ref<Currency | null>(null)
  const isFetched = ref(false)
  const isLoading = ref(false)

  const { $axios } = useNuxtApp()

  // Get user's selected or default currency
  const selectedCurrency = computed(() => {
    // First try to get user's specific currency
    if (userCurrency.value) {
      return userCurrency.value
    }
    // Then try to find the default currency
    return currencies.value.find((currency) => currency.is_default) || null
  })

  // Fetch both available currencies and user's currency
  const fetchCurrencies = async () => {
    if (isLoading.value) return

    isLoading.value = true
    try {
      const response = await $axios.get('/api/currencies')
      const { data, user_currency } = response.data

      currencies.value = data
      userCurrency.value = user_currency
      isFetched.value = true
    } catch (error) {
      console.error('Error fetching currencies:', error)
    } finally {
      isLoading.value = false
    }
  }

  // For non-authenticated users
  const fetchGuestCurrencies = async () => {
    if (isLoading.value) return

    isLoading.value = true
    try {
      const response = await $axios.get('/api/currencies')
      currencies.value = response.data.data
      isFetched.value = true
    } catch (error) {
      console.error('Error fetching guest currencies:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Update user's currency preference
  const updateCurrency = async (currencyCode: string) => {
    try {
      await $axios.post('/api/user/currency', {
        currency_code: currencyCode,
      })
      await fetchCurrencies() // Refetch to get updated data
    } catch (error) {
      console.error('Error updating currency:', error)
      throw error
    }
  }

  return {
    currencies,
    selectedCurrency,
    userCurrency,
    isFetched,
    isLoading,
    fetchCurrencies,
    fetchGuestCurrencies,
    updateCurrency,
  }
})
