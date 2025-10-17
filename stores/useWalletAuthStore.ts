// stores/useWalletAuthStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useNuxtApp } from '#app'

export const useWalletAuthStore = defineStore('walletAuth', () => {
  const isAuthenticated = ref(false)
  const authError = ref('')
  const isLoading = ref(false)
  const sessionExpiresAt = ref<Date | null>(null)
  const remainingTime = ref(0)

  const { $axios } = useNuxtApp()

  // Computed properties
  const formattedRemainingTime = computed(() => {
    if (!remainingTime.value) return '00:00'

    const minutes = Math.floor(remainingTime.value / 60)
    const seconds = remainingTime.value % 60

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  })

  // Methods
  const verifyPin = async (pin: string) => {
    isLoading.value = true
    authError.value = ''

    try {
      const response = await $axios.post('/api/wallet/auth/verify-pin', { pin })

      isAuthenticated.value = true
      sessionExpiresAt.value = new Date(response.data.expires_at)

      // Start session timer
      startSessionTimer()

      return response.data
    } catch (error: any) {
      authError.value =
        error.response?.data?.message || 'Invalid PIN. Please try again.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await $axios.post('/api/wallet/auth/logout')
    } catch (error) {
      console.error('Error during wallet logout:', error)
    } finally {
      resetState()
    }
  }

  const resetState = () => {
    isAuthenticated.value = false
    sessionExpiresAt.value = null
    remainingTime.value = 0
    authError.value = ''
  }

  const setAuthenticated = (value: boolean) => {
    isAuthenticated.value = value

    if (value) {
      // If we're setting as authenticated, check the session expiry
      checkSessionExpiry()
    }
  }

  const startSessionTimer = () => {
    if (!sessionExpiresAt.value) return

    // Update remaining time immediately
    updateRemainingTime()

    // Then update every second
    const timer = setInterval(() => {
      if (!updateRemainingTime()) {
        clearInterval(timer)
      }
    }, 1000)
  }

  const updateRemainingTime = (): boolean => {
    if (!sessionExpiresAt.value) return false

    const now = new Date()
    const diffMs = sessionExpiresAt.value.getTime() - now.getTime()

    if (diffMs <= 0) {
      // Session expired
      resetState()
      return false
    }

    // Convert to seconds
    remainingTime.value = Math.floor(diffMs / 1000)
    return true
  }

  const checkSessionExpiry = async () => {
    try {
      const response = await $axios.get('/api/wallet/auth/session')

      if (response.data.authenticated) {
        sessionExpiresAt.value = new Date(response.data.expires_at)
        startSessionTimer()
      } else {
        resetState()
      }
    } catch (error) {
      console.error('Failed to check session expiry:', error)
      resetState()
    }
  }

  const requestPinReset = async (email: string) => {
    isLoading.value = true
    authError.value = ''

    try {
      console.log('Sending PIN reset request to API for email:', email)
      const response = await $axios.post('/api/wallet/auth/request-reset', {
        email,
      })
      console.log('API response for PIN reset request:', response.data)
      return response.data
    } catch (error: any) {
      console.error('PIN reset request error:', error)
      authError.value =
        error.response?.data?.message || 'Failed to request PIN reset'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const verifyResetCode = async (email: string, code: string) => {
    isLoading.value = true
    authError.value = ''

    try {
      const response = await $axios.post('/api/wallet/auth/verify-reset-code', {
        email,
        code,
      })
      return response.data
    } catch (error: any) {
      authError.value = error.response?.data?.message || 'Invalid reset code'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const resetPin = async (email: string, code: string, newPin: string) => {
    isLoading.value = true
    authError.value = ''

    try {
      const response = await $axios.post('/api/wallet/auth/reset-pin', {
        email,
        code,
        new_pin: newPin,
      })
      return response.data
    } catch (error: any) {
      authError.value = error.response?.data?.message || 'Failed to reset PIN'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    isAuthenticated,
    authError,
    isLoading,
    sessionExpiresAt,
    remainingTime,
    formattedRemainingTime,
    verifyPin,
    logout,
    resetState,
    setAuthenticated,
    requestPinReset,
    verifyResetCode,
    resetPin,
  }
})
