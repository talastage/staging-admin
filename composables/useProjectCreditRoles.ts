// composables/useProjectCreditRoles.ts
import { ref } from 'vue'

export function useProjectCreditRoles() {
  const roles = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const fetchRoles = async (categorySlug: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(
        `/guest/talent/categories/${categorySlug}/roles`
      )
      const data = await response.json()
      roles.value = data.data
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const searchRoles = async (categorySlug: string, query: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(
        `/guest/talent/categories/${categorySlug}/roles/search?query=${query}`
      )
      const data = await response.json()
      roles.value = data.data
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  return {
    roles,
    isLoading,
    error,
    fetchRoles,
    searchRoles,
  }
}
