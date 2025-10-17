// composables/premiering/usePresignedUrl.ts
import { ref } from 'vue'
import { useNuxtApp } from '#app'

export function usePresignedUrl() {
  const { $axios, $toast } = useNuxtApp()
  const presignedUrl = ref<string | null>(null)
  const s3Key = ref<string | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  const fetchPresignedUrl = async (
    accessUuid: string,
    fileData: {
      fileName: string
      fileType: 'main' | 'trailer' | 'thumbnail'
      contentType: string
      fileSize: number
    }
  ) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await $axios.post(
        `/api/studio/projects/${accessUuid}/presigned-url`,
        fileData
      )
      presignedUrl.value = response.data.presignedUrl
      s3Key.value = response.data.s3Key
      return response.data
    } catch (err: any) {
      error.value =
        err.response?.data?.message || 'Failed to get presigned URL.'
      $toast.error(error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    presignedUrl,
    s3Key,
    error,
    isLoading,
    fetchPresignedUrl,
  }
}
