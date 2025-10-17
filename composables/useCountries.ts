import { ref, reactive } from 'vue'

interface Country {
  id: number
  name: string
  flag: string
  phone_code: string
  default?: boolean
}

export function useCountries() {
  const countries = ref<Country[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCountries = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { $axios } = useNuxtApp()
      const response = await $axios.get('/api/countries')
      countries.value = response.data.countries
    } catch (err) {
      console.error('Error fetching countries:', err)
      error.value = 'Failed to load countries'
    } finally {
      loading.value = false
    }
  }

  return {
    countries,
    loading,
    error,
    fetchCountries
  }
}