import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { StudioProject } from '~/types/studio-project'
import { useStudioProject } from '@/composables/premiering/useStudioProject'

export const useStudioProjectStore = defineStore('studioProject', () => {
  const project = ref<StudioProject | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Pull fetch logic from the composable
  const { fetchStudioProject } = useStudioProject()

  /**
   * Fetches a project by accessUuid and sets local state.
   */
  async function fetchProject(accessUuid: string) {
    loading.value = true
    error.value = null
    try {
      const response = await fetchStudioProject(accessUuid)
      // “response.data” is the JSON object from the backend
      project.value = response.data as StudioProject
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch project'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    project,
    loading,
    error,
    fetchProject,
  }
})
