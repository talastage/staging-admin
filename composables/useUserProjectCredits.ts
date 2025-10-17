// composables/useUserProjectCredits.ts
import { ref, watch, computed, Ref } from 'vue'

export function useUserProjectCredits(usernameRef: Ref<string>) {
  const { $axios } = useNuxtApp()
  const projects = ref([])
  const currentPage = ref(1)
  const lastPage = ref(1)
  const total = ref(0)
  const isLoading = ref(false)

  const fetchPage = async (page: number) => {
    if (!usernameRef.value) {
      throw new Error('Username is required')
    }

    try {
      isLoading.value = true
      const response = await $axios.get(
        `/api/user/${usernameRef.value}/user-project-credits`,
        {
          params: {
            page,
            per_page: 12,
          },
        }
      )

      const data = response.data

      if (page === 1) {
        projects.value = data.projects || []
      } else {
        projects.value = [...projects.value, ...(data.projects || [])]
      }

      lastPage.value = data.last_page || 1
      total.value = data.total || 0
      currentPage.value = page
    } catch (error) {
      console.error('Error fetching project credits:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const hasMore = computed(() => currentPage.value < lastPage.value)

  const loadMoreItems = async () => {
    if (!hasMore.value || isLoading.value) return

    try {
      await fetchPage(currentPage.value + 1)
    } catch (error) {
      console.error('Error loading more items:', error)
    }
  }

  const refresh = async () => {
    projects.value = []
    currentPage.value = 1
    lastPage.value = 1
    total.value = 0

    try {
      await fetchPage(1)
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  const reset = () => {
    projects.value = []
    currentPage.value = 1
    lastPage.value = 1
    total.value = 0
    isLoading.value = false
  }

  // Reset and refetch when username changes
  watch(
    usernameRef,
    (newUsername) => {
      if (newUsername) {
        reset()
        refresh()
      }
    },
    { immediate: true }
  )

  return {
    projects,
    isLoading,
    hasMore,
    total,
    currentPage,
    lastPage,
    loadMoreItems,
    refresh,
    reset,
  }
}
