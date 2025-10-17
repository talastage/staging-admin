//composables/useProfileOwnership.ts

import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const useProfileOwnership = (username: string | undefined) => {
  const authStore = useAuthStore()

  const isProfileOwner = computed(() => {
    if (!username || !authStore.user?.value?.username) return false
    return authStore.user?.value?.username === username
  })

  return {
    isProfileOwner,
  }
}
