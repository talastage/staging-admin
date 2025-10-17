import { ref, computed } from 'vue'
import { useProjectStore } from '~/stores/useProjectStore'
import type { Project } from '@/types/project'

interface ExtendedProject extends Project {
  status: 'draft' | 'published' | 'scheduled' | 'pending'
  creator?: {
    id: number
    name: string
    profile_photo_url: string | null
  }
}

export function useProject(accessUuid?: string) {
  const projectStore = useProjectStore()

  const project = computed(() => projectStore.currentProject)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProject = async () => {
    if (!accessUuid) return null

    try {
      loading.value = true
      error.value = null
      const result = await projectStore.fetchProject(accessUuid)
      if (!result) {
        error.value = 'Failed to fetch project'
      }
      return result
    } catch (err) {
      error.value = 'Failed to fetch project'
      console.error('Error fetching project:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Additional helpers if needed
  const getProjectStatusText = (
    status: ExtendedProject['status'],
    scheduledAt?: string
  ) => {
    switch (status) {
      case 'published':
        return 'Published'
      case 'scheduled':
        return scheduledAt
          ? `Premieres ${new Date(scheduledAt).toLocaleString()}`
          : 'Scheduled'
      case 'draft':
        return 'Draft'
      case 'pending':
        return 'Pending'
      default:
        return status
    }
  }

  const getStatusColor = (status: ExtendedProject['status']): string => {
    switch (status) {
      case 'published':
        return 'success'
      case 'scheduled':
        return 'info'
      case 'draft':
        return 'grey'
      case 'pending':
        return 'warning'
      default:
        return 'grey'
    }
  }

  return {
    project,
    loading,
    error,
    fetchProject,
    getProjectStatusText,
    getStatusColor,
  }
}
