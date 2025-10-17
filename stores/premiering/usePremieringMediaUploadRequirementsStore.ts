// stores/premiering/usePremieringMediaUploadRequirementsStore.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Currency {
  id: number
  name: string
  code: string
}

interface Category {
  id: number
  name: string
  slug: string
  avatar_url: string
}

interface PremieringFee {
  amount: number
  currency: Currency
}

interface RequirementsData {
  premiering_fee: PremieringFee
  description: string
  main_duration_limit: number
  trailer_duration_limit: number
  resolution_limit: string
  max_file_size: number
  encoding_format: string
  premiering_category: Category
}

export const usePremieringMediaUploadRequirementsStore = defineStore(
  'premieringMediaUploadRequirements',
  () => {
    const { $axios } = useNuxtApp()

    const selectedCategory = ref<Category | null>(null)
    const requirements = ref<RequirementsData | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const formattedMaxFileSize = computed(() => {
      if (!requirements.value?.max_file_size) return '0 MB'
      const sizeInMB = requirements.value.max_file_size
      return sizeInMB >= 1024
        ? `${(sizeInMB / 1024).toFixed(1)} GB`
        : `${sizeInMB} MB`
    })
    
    const maxFileSizeInBytes = computed(() => {
      if (!requirements.value?.max_file_size) return 0
      // Convert MB to bytes
      return requirements.value.max_file_size * 1024 * 1024
    })

    const mainRequirements = computed(() => ({
      loading: loading.value,
      error: error.value,
      maxSize: maxFileSizeInBytes.value,
      resolution: requirements.value?.resolution_limit || 'N/A',
      format: requirements.value?.encoding_format || 'N/A',
      duration: requirements.value?.main_duration_limit ?? 0,
    }))

    const trailerRequirements = computed(() => ({
      loading: loading.value,
      error: error.value,
      maxSize: maxFileSizeInBytes.value,
      resolution: requirements.value?.resolution_limit || 'N/A',
      format: requirements.value?.encoding_format || 'N/A',
      duration: requirements.value?.trailer_duration_limit ?? 0,
    }))

    const amount = computed(
      () => requirements.value?.premiering_fee?.amount || 0
    )
    const currency = computed(
      () => requirements.value?.premiering_fee?.currency || null
    )
    const currencySymbol = computed(() => currency.value?.code || '')
    const currencyCode = computed(() => currency.value?.code || '')

    const selectCategory = async (category: Category) => {
      try {
        selectedCategory.value = category
        await fetchRequirements(category.slug)
      } catch (err) {
        console.error('Error in selectCategory:', err)
        error.value = 'Failed to load category requirements.'
      }
    }

    const fetchRequirements = async (slug: string) => {
      loading.value = true
      error.value = null
      try {
        const response = await $axios.get<RequirementsData>(
          `/api/premiering-fees/${slug}`
        )
        requirements.value = response.data
      } catch (err) {
        console.error('Error fetching requirements:', err)
        error.value = 'Failed to fetch media requirements.'
        throw err
      } finally {
        loading.value = false
      }
    }

    const resetState = () => {
      selectedCategory.value = null
      localStorage.removeItem(
        'premieringMediaUploadRequirements-selectedCategory'
      )
      loading.value = false
      error.value = null
    }

    const validateFileSize = (fileSize: number) => {
      if (!requirements.value?.max_file_size) return false
      const maxSizeInBytes = requirements.value.max_file_size * 1024 * 1024
      return fileSize <= maxSizeInBytes
    }

    const validateFormat = (mimeType: string) => {
      if (!requirements.value?.encoding_format) return false
      const allowedFormat = `video/${requirements.value.encoding_format.toLowerCase()}`
      return mimeType.toLowerCase() === allowedFormat
    }

    const validateDuration = (duration: number, type: 'main' | 'trailer') => {
      if (!requirements.value) return false
      const limit =
        type === 'main'
          ? requirements.value.main_duration_limit
          : requirements.value.trailer_duration_limit
      return duration <= limit
    }

    const formattedRequirements = computed(() => ({
      main: {
        maxSize: mainRequirements.value.maxSize,
        resolution: mainRequirements.value.resolution,
        format: mainRequirements.value.format,
        duration: mainRequirements.value.duration,
      },
      trailer: {
        maxSize: trailerRequirements.value.maxSize,
        resolution: trailerRequirements.value.resolution,
        format: trailerRequirements.value.format,
        duration: trailerRequirements.value.duration,
      },
    }))

    return {
      selectedCategory,
      requirements,
      loading,
      error,
      mainRequirements,
      trailerRequirements,
      formattedRequirements,
      formattedMaxFileSize,
      amount,
      currency,
      currencySymbol,
      currencyCode,
      selectCategory,
      fetchRequirements,
      resetState,
      validateFileSize,
      validateFormat,
      validateDuration,
    }
  },

  {
    persist: {
      paths: ['selectedCategory'],
      storage: localStorage, // Use localStorage to persist across refreshes
    },
  }
)
