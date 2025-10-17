import { ref } from 'vue'
import { useNuxtApp } from '#app'

interface User {
  id: number
  username: string
  display_name: string
  profile_photo: string
  talent: string
  is_fanned_by_auth_user: boolean
  is_fanning_auth_user: boolean
}

export function useTalentCategoryUsers(slug: string) {
  const { $axios } = useNuxtApp()
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const hasMore = ref(true)
  const currentPage = ref(1)
  const filters = ref<{ country: number | null; talent: number | null }>({
    country: null,
    talent: null,
  })

  const fetchUsers = async () => {
    if (isLoading.value || !hasMore.value) return
    isLoading.value = true
    try {
      const params: any = {
        page: currentPage.value,
        per_page: 18,
      }
      if (filters.value.country) {
        params.country = filters.value.country
      }
      if (filters.value.talent) {
        params.talent = filters.value.talent
      }

      const response = await $axios.get(
        `/guest/talent/categories/${slug}/users`,
        { params }
      )
      const newUsers = response.data.users
      const lastPage = response.data.meta.meta.last_page

      if (currentPage.value === 1) {
        users.value = newUsers
      } else {
        users.value.push(...newUsers)
      }
      hasMore.value = currentPage.value < lastPage
      currentPage.value++
    } catch (err: any) {
      error.value = err
    } finally {
      isLoading.value = false
    }
  }

  const loadMore = () => {
    fetchUsers()
  }

  const setFilters = (newFilters: {
    country: number | null
    talent: number | null
  }) => {
    filters.value = newFilters
    users.value = []
    currentPage.value = 1
    hasMore.value = true
    fetchUsers()
  }

  // Add resetUsers function
  const resetUsers = () => {
    users.value = []
    currentPage.value = 1
    hasMore.value = true
    error.value = null
  }

  return {
    users,
    isLoading,
    error,
    hasMore,
    loadMore,
    setFilters,
    resetUsers, // Include resetUsers in the return object
  }
}
