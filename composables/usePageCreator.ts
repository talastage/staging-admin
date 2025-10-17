import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Accept a page object as a parameter
export function usePageCreator(page: any) {
  const authStore = useAuthStore()

  const isPageCreator = computed(() => {
    if (!authStore.user || !page || !page.creator) return false
    return authStore.user.id === page.creator.id
  })

  return { isPageCreator }
}
