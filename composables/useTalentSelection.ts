import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { TalentCategory } from '@/types/categories'

export interface PopularTalent {
  id: number
  name: string
  category_id: number
  category?: TalentCategory
}

export interface ApiResponse {
  success: boolean
  message: string
  data: PopularTalent[]
  count: number
}

export interface TalentRegistrationResponse {
  message: string
  user_talent: {
    name: string
    category: {
      id: number
      name: string
      slug: string
      avatar_url: string | null
    }
    category_id: number
    talent_id: number
  }
}

export function useTalentSelection() {
  const authStore = useAuthStore()
  const { $axios } = useNuxtApp()

  // Popular Talents state
  const popularTalentsLoading = ref(false)
  const registering = ref(false)
  const popularTalentsError = ref<string | null>(null)
  const popularTalents = ref<PopularTalent[]>([])
  const selectedPopularTalent = ref<PopularTalent | null>(null)
  const selectedPopularTalentIndex = ref<number | null>(null)
  const showQuickConfirmDialog = ref(false)
  const showSuccessSnackbar = ref(false)

  // Popular Talents Methods
  const fetchPopularTalents = async () => {
    console.log('[TalentSelection] Fetching popular talents...')
    popularTalentsLoading.value = true
    popularTalentsError.value = null

    try {
      const response = await $axios.get<ApiResponse>('/api/talents/popular')
      console.log('[TalentSelection] Popular talents response:', response.data)

      if (response.data.success) {
        popularTalents.value = response.data.data
        console.log(`[TalentSelection] Loaded ${popularTalents.value.length} popular talents`)
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch popular talents'
        )
      }
    } catch (err: any) {
      console.error('[TalentSelection] Error fetching popular talents:', err)
      popularTalentsError.value =
        err.response?.data?.message ||
        err.message ||
        'Failed to load popular talents'
    } finally {
      popularTalentsLoading.value = false
    }
  }

  const selectPopularTalent = (talent: PopularTalent, index: number) => {
    selectedPopularTalent.value = talent
    selectedPopularTalentIndex.value = index
    showQuickConfirmDialog.value = true
  }

  const cancelQuickSelection = () => {
    selectedPopularTalent.value = null
    selectedPopularTalentIndex.value = null
    showQuickConfirmDialog.value = false
  }

  const registerTalent = async () => {
    if (!selectedPopularTalent.value) return { success: false }

    registering.value = true

    try {
      const payload = {
        talent_category_id: selectedPopularTalent.value.category_id,
        talent_id: selectedPopularTalent.value.id,
      }

      const response = await $axios.post<TalentRegistrationResponse>(
        '/api/user/talent',
        payload
      )

      if (response.status === 201) {
        // Update the auth store with the talent information
        const responseData = response.data.user_talent

        authStore.updateUser({
          has_talent: 'yes',
          talent: responseData.name,
          talent_details: {
            category: responseData.category.name,
            talent: responseData.name,
            talent_id: responseData.talent_id,
            category_id: responseData.category_id,
          },
        })

        showSuccessSnackbar.value = true
        showQuickConfirmDialog.value = false

        // Reset selection
        selectedPopularTalent.value = null
        selectedPopularTalentIndex.value = null
        
        return { 
          success: true, 
          message: 'Talent registered successfully!',
          talent: responseData
        }
      }
      
      return { success: false, message: 'Registration failed' }
    } catch (err: any) {
      console.error('Error registering talent:', err)
      const errorMessage =
        err.response?.data?.message || 'Failed to register talent'
      popularTalentsError.value = errorMessage
      
      return { success: false, message: errorMessage }
    } finally {
      registering.value = false
    }
  }

  const resetSelection = () => {
    selectedPopularTalent.value = null
    selectedPopularTalentIndex.value = null
    popularTalentsError.value = null
    showQuickConfirmDialog.value = false
  }

  return {
    // State
    popularTalentsLoading,
    registering,
    popularTalentsError,
    popularTalents,
    selectedPopularTalent,
    selectedPopularTalentIndex,
    showQuickConfirmDialog,
    showSuccessSnackbar,
    
    // Methods
    fetchPopularTalents,
    selectPopularTalent,
    cancelQuickSelection,
    registerTalent,
    resetSelection
  }
}