// composables/useProjectCarouselCredits.ts
import { ref } from 'vue'

interface User {
  id: number
  username: string
  display_name: string
  profile_photo: string
}

interface Role {
  id: number
  name: string
  is_custom: boolean
}

interface Credit {
  id: number
  user: User
  role: Role
}

interface Category {
  name: string
  id: number
  credits: Credit[]
}

interface ApiResponse {
  data: Category[]
  meta: {
    total_members: number
    current_page: number
    per_page: number
    last_page: number
    total: number
  }
}

export function useProjectCarouselCredits(accessUuid: string) {
  const credits = ref<Credit[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const totalMembers = ref(0)

  const autoplayConfig = {
    delay: 5000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  }

  const fetchCredits = async () => {
    loading.value = true
    error.value = null

    try {
      const { $axios } = useNuxtApp()
      const response = await $axios.get<ApiResponse>(
        `/guest/projects/${accessUuid}/credits`,
        {
          params: { limit: 10 },
        }
      )

      if (response.data?.data) {
        // Flatten the credits from all categories into a single array
        credits.value = response.data.data.flatMap(
          (category) => category.credits
        )
        totalMembers.value = response.data.meta.total_members
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching credits:', err)
      error.value = 'Failed to load contributors. Please try again later.'
    } finally {
      loading.value = false
    }
  }

  const handleTransactionComplete = async () => {
    console.log('Tip transaction completed')
    await fetchCredits()
  }

  return {
    credits,
    loading,
    error,
    totalMembers,
    autoplayConfig,
    fetchCredits,
    handleTransactionComplete,
  }
}
