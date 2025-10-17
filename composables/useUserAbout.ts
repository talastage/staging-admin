// composables/useUserAbout.ts
import { ref, computed } from 'vue'
import { useNuxtApp } from '#app'

export const useUserAbout = (username?: string) => {
  const { $axios } = useNuxtApp()

  // State
  const userBio = ref('')
  const socialLinks = ref({})
  const loading = ref(false)
  const error = ref('')

  // Computed
  const hasBio = computed(() => !!userBio.value?.trim())
  const hasSocialLinks = computed(
    () => Object.keys(socialLinks.value).length > 0
  )
  const hasAnyContent = computed(() => hasBio.value || hasSocialLinks.value)

  // Methods
  const fetchUserAbout = async (targetUsername?: string) => {
    const usernameToFetch = targetUsername || username
    if (!usernameToFetch) {
      error.value = 'Username is required'
      return
    }

    try {
      loading.value = true
      error.value = ''

      const response = await $axios.get(`/api/user/about/${usernameToFetch}`)

      if (response.data.success) {
        userBio.value = response.data.data.bio || ''
        socialLinks.value = response.data.data.social_links || {}
      } else {
        throw new Error(
          response.data.message || 'Failed to load user information'
        )
      }
    } catch (err) {
      error.value =
        err.response?.data?.message ||
        err.message ||
        'Failed to load user information'
      console.error('Error fetching user about:', err)
    } finally {
      loading.value = false
    }
  }

  const refreshAbout = () => {
    return fetchUserAbout()
  }

  // Return reactive state and methods
  return {
    // State
    userBio,
    socialLinks,
    loading,
    error,

    // Computed
    hasBio,
    hasSocialLinks,
    hasAnyContent,

    // Methods
    fetchUserAbout,
    refreshAbout,
  }
}
