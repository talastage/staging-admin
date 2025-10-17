// stores/useWalletStore.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useNuxtApp } from '#app'
import { AxiosError, isAxiosError } from 'axios'

interface WalletData {
  id: number
  wallet_code: string
  name: string
  owner_id: number
  balance: string
  currency: {
    id: number
    name: string
    code: string
  }
  status:
    | 'active'
    | 'inactive'
    | 'suspended'
    | 'blocked'
    | 'restricted'
    | 'locked'
}

interface Wallet {
  data: WalletData
}

interface WalletError {
  message: string
  status?: number
  code?: string
}

export const useWalletStore = defineStore('wallet', () => {
  const { $axios } = useNuxtApp()

  const wallet = ref<Wallet | null>(null)
  const isFetching = ref(false)
  const isAuthenticated = ref(false)
  const sessionExpiry = ref<Date | null>(null)
  const intendedRoute = ref<string | null>(null)
  const error = ref<WalletError | null>(null)
  const lastUpdated = ref<Date | null>(null)

  const isWalletActive = computed(() => wallet.value?.data?.status === 'active')
  const currentBalance = computed(() => wallet.value?.data?.balance ?? '0')
  const currentCurrency = computed(() => wallet.value?.data?.currency)
  const isSessionValid = computed(() => {
    if (!sessionExpiry.value) return false
    return new Date() < sessionExpiry.value
  })

  function setError(errorData: WalletError | null) {
    error.value = errorData
  }

  async function fetchWallet(): Promise<Wallet | null> {
    isFetching.value = true
    try {
      const { data } = await $axios.get<Wallet>('/api/wallet')
      wallet.value = data
      lastUpdated.value = new Date()
      return data
    } catch (err) {
      if (isAxiosError(err)) {
        setError({
          message: err.response?.data?.message || err.message,
          status: err.response?.status,
          code: err.response?.data?.code,
        })
      } else {
        setError({ message: 'An unexpected error occurred' })
      }
      return null
    } finally {
      isFetching.value = false
    }
  }

  function setAuthenticated(status: boolean) {
    isAuthenticated.value = status
    if (!status) wallet.value = null
  }

  function setSessionExpiry(expiryDate: Date | string) {
    sessionExpiry.value =
      typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate
  }

  function setIntendedRoute(route: string | null) {
    intendedRoute.value = route
  }

  function clearAuth() {
    isAuthenticated.value = false
    sessionExpiry.value = null
    intendedRoute.value = null
    error.value = null
    wallet.value = null
    lastUpdated.value = null
  }

  async function logout(): Promise<void> {
    try {
      await $axios.post('/api/wallet/logout')
    } catch (_) {
    } finally {
      clearAuth()
    }
  }

  return {
    wallet,
    isFetching,
    isAuthenticated,
    sessionExpiry,
    intendedRoute,
    error,
    lastUpdated,
    isWalletActive,
    currentBalance,
    currentCurrency,
    isSessionValid,
    fetchWallet,
    setError,
    setAuthenticated,
    setSessionExpiry,
    setIntendedRoute,
    clearAuth,
    logout,
  }
})
