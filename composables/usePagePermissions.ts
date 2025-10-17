// composables/usePagePermissions.ts
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface PageData {
  creator?: {
    id: number
  }
}

export function usePagePermissions(page: Ref<PageData | null>) {
  const auth = useAuthStore()

  const isPageCreator = computed(() => {
    if (!auth.isLoggedIn || !page.value?.creator) return false
    return auth.state.user?.id === page.value.creator.id
  })

  const canEditPage = computed(() => {
    // You can add additional conditions here
    // For example, admins might be able to edit all pages
    return isPageCreator.value && auth.isLoggedIn
  })

  const canDeletePage = computed(() => {
    // Similar to edit, but might have different conditions
    return isPageCreator.value && auth.isLoggedIn
  })

  const canManagePage = computed(() => {
    // General management permissions
    return isPageCreator.value && auth.isLoggedIn
  })

  return {
    isPageCreator,
    canEditPage,
    canDeletePage,
    canManagePage,
  }
}
