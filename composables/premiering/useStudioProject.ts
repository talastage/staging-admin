import { ref } from 'vue'
import { useNuxtApp } from '#app'

export function useStudioProject() {
  const { $axios } = useNuxtApp()
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * Fetch a studio project by accessUuid.
   */
  const fetchStudioProject = async (accessUuid: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await $axios.get(`/api/studio/projects/${accessUuid}`)
      data.value = response.data
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch project'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Save project as a draft.
   */
  const saveDraft = async (accessUuid: string, draftData: any) => {
    loading.value = true
    error.value = null
    try {
      const response = await $axios.put(
        `/api/studio/projects/${accessUuid}/draft`,
        draftData
      )
      return {
        data: response.data.data,
        message: response.data.message,
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Publish the project immediately.
   */
  const publishProject = async (accessUuid: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await $axios.put(
        `/api/studio/projects/${accessUuid}/publish`
      )
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to publish project'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    fetchStudioProject,
    saveDraft,
    publishProject,
  }
}
