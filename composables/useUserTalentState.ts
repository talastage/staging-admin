// composables/useUserTalentState.ts

import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const useUserTalentState = () => {
  const authStore = useAuthStore()

  // True if user.has_talent === 'yes'
  const hasTalent = computed(() => {
  return authStore.user?.value?.has_talent === 'yes'
  })

  const isTalentUndecided = computed(() => {
  return authStore.user?.value?.has_talent === 'undecided'
  })

  // Additional details about the user's talent, if any
  const talentDetails = computed(() => {
  return authStore.user?.value?.talent_details || null
  })

  // Pull out the talent name from talent_details (optional)
  const talentName = computed(() => {
    return talentDetails.value?.talent || null
  })

  // Talent is considered complete if hasTalent is true and there's a non-empty name
  const isTalentComplete = computed(() => {
    return hasTalent.value && !!talentDetails.value?.talent
  })

  return {
    hasTalent,
    talentDetails,
    talentName,
    isTalentComplete,
    isTalentUndecided,
  }
}
