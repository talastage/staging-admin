// composables/useAuthenticatedWallet.ts
import { computed } from 'vue'
import { useWalletAuthStore } from '@/stores/useWalletAuthStore'
import { storeToRefs } from 'pinia'

export function useAuthenticatedWallet() {
  // Access the wallet authentication store
  const walletAuthStore = useWalletAuthStore()

  // Extract reactive authentication status using storeToRefs
  const { isAuthenticated } = storeToRefs(walletAuthStore)

  // Computed property to determine if the wallet card should be visible
  const isWalletVisible = computed(() => isAuthenticated.value)

  return {
    isWalletVisible, // Reactive property to control visibility
    isAuthenticated, // Expose authentication status if needed
  }
}
