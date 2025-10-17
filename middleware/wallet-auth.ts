// middleware/wallet.global.ts
import { useWalletAuthStore } from '~/stores/useWalletAuthStore'
import { useWalletStore } from '~/stores/useWalletStore'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const walletAuthStore = useWalletAuthStore()
  const walletStore = useWalletStore()
  const { $axios } = useNuxtApp()

  // List of paths that should bypass authentication and status checks
  const publicPaths = [
    '/wallet/verify-pin',
    '/wallet/activate',
    '/wallet/reset-pin',
  ]

  // List of paths that should bypass PIN verification but still check wallet status
  const noVerificationPaths = [
    '/wallet/deposit',
  ]

  // Skip middleware completely if we're going to any of the public paths
  if (publicPaths.includes(to.path)) {
    return
  }

  // First, check if we have wallet data or need to fetch it
  if (!walletStore.wallet) {
    try {
      await walletStore.fetchWallet()
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
    }
  }

  // Check wallet status BEFORE authentication check
  if (walletStore.wallet) {
    const status = walletStore.wallet.data.status

    // If wallet is not active, redirect to activate page
    if (status !== 'active') {
      return navigateTo('/wallet/activate')
    }
  }

  // Skip PIN verification for deposit page but continue with other checks
  if (noVerificationPaths.includes(to.path)) {
    return
  }

  // Now proceed with authentication check only if we haven't redirected based on wallet status
  if (!walletAuthStore.isAuthenticated) {
    try {
      // Check if there's an active wallet session
      const response = await $axios.get('/api/wallet/auth/check-session')

      if (response.data.authenticated) {
        // If session exists, set as authenticated
        walletAuthStore.setAuthenticated(true)
      } else {
        // If not authenticated, redirect to PIN verification
        return navigateTo('/wallet/verify-pin', {
          query: { redirect: to.fullPath },
        })
      }
    } catch (error) {
      console.error('Failed to check wallet session:', error)
      // If error checking session, redirect to PIN verification
      return navigateTo('/wallet/verify-pin', {
        query: { redirect: to.fullPath },
      })
    }
  }
})
