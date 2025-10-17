import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface SocialProvider {
  name: string
  label: string
  icon: string
  color: string
}

const providerIcons: Record<string, any> = {
  google: { icon: 'mdi-google', color: 'red-lighten-1' },
  facebook: { icon: 'mdi-facebook', color: 'blue' },
  twitter: { icon: 'mdi-twitter', color: 'light-blue' },
  instagram: { icon: 'mdi-instagram', color: 'pink' },
  tiktok: { icon: 'mdi-music-note', color: 'black' },
  linkedin: { icon: 'mdi-linkedin', color: 'blue-darken-3' }
}

export const useSocialProvidersStore = defineStore('socialProviders', () => {
  const providers = ref<SocialProvider[]>([])
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  const activeProviders = computed(() => providers.value)

  const fetchActiveProviders = async () => {
    if (isLoading.value || isLoaded.value) return

    isLoading.value = true
    error.value = null

    try {
      const { $axios } = useNuxtApp()
      const response = await $axios.get('/api/social-auth/active-providers')
      
      providers.value = response.data.map((provider: any) => ({
        name: provider.name,
        label: provider.display_name,
        icon: providerIcons[provider.name]?.icon || 'mdi-account',
        color: providerIcons[provider.name]?.color || 'primary'
      }))
      
      isLoaded.value = true
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch social providers'
      console.error('Failed to fetch active providers:', err)
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    providers.value = []
    isLoading.value = false
    isLoaded.value = false
    error.value = null
  }

  return {
    providers,
    activeProviders,
    isLoading,
    isLoaded,
    error,
    fetchActiveProviders,
    reset
  }
})