// composables/useCurrencies.ts

import { ref, computed, Ref } from 'vue'
import { useNuxtApp } from '#app'

export interface Currency {
  id: number
  name: string
  code: string
  symbol: string
}

export function useCurrencies() {
  const { $axios } = useNuxtApp()

  const currencies: Ref<Currency[]> = ref([])
  const userCurrency: Ref<Currency | null> = ref(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isFetched = ref(false)

  // Get user's selected currency
  const selectedCurrency = computed(() => {
    return userCurrency.value || null
  })

  // All currencies are considered active now (simplified from backend)
  const activeCurrencies = computed(() => {
    return currencies.value
  })

  // Fetch both available currencies and user's currency
  const fetchCurrencies = async () => {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      const response = await $axios.get('/api/currencies')
      console.log('API Response:', response.data) // Debug log

      // Handle the actual API response structure
      const { currencies: currenciesData, user_currency } = response.data

      currencies.value = currenciesData || []
      userCurrency.value = user_currency || null
      isFetched.value = true

      return { currencies: currenciesData, userCurrency: user_currency }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch currencies'
      console.error('Error fetching currencies:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // For non-authenticated users
  const fetchGuestCurrencies = async () => {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      const response = await $axios.get('/api/currencies')
      console.log('Guest API Response:', response.data) // Debug log

      // Handle the actual API response structure
      currencies.value = response.data.currencies || response.data.data || []
      isFetched.value = true

      return currencies.value
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch guest currencies'
      console.error('Error fetching guest currencies:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update user's currency preference
  const updateUserCurrency = async (currencyCode: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $axios.post('/api/user/currency', {
        currency_code: currencyCode,
      })

      // Refresh currencies data
      await fetchCurrencies()

      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to update currency'
      console.error('Error updating currency:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update wallet's currency
  const updateWalletCurrency = async (walletId: number, currencyId: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $axios.post(`/api/wallet/${walletId}/currency`, {
        currency_id: currencyId,
      })

      // Refresh currencies data
      await fetchCurrencies()

      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to update wallet currency'
      console.error('Error updating wallet currency:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get currency by ID
  const getCurrencyById = (id: number): Currency | undefined => {
    return currencies.value.find((currency) => currency.id === id)
  }

  // Get currency by code
  const getCurrencyByCode = (code: string): Currency | undefined => {
    return currencies.value.find((currency) => currency.code === code)
  }

  return {
    currencies,
    activeCurrencies,
    userCurrency,
    selectedCurrency,
    isLoading,
    error,
    isFetched,
    fetchCurrencies,
    fetchGuestCurrencies,
    updateUserCurrency,
    updateWalletCurrency,
    getCurrencyById,
    getCurrencyByCode,
  }
}
