// stores/useProjectStore.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project } from '@/types/project'
import { useNuxtApp } from '#app'

interface ApiError {
  response?: { data: { message: string } }
  request?: unknown
  message?: string
}

export const useProjectStore = defineStore('projectStore', () => {
  const { $axios } = useNuxtApp()

  // State
  const currentProject = ref<Project | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  // Getter
  const project = computed(() => currentProject.value)

  function handleError(e: ApiError): void {
    const msg =
      e.response?.data.message ||
      (e.request ? 'No response from server' : e.message) ||
      'An unexpected error occurred'
    error.value = msg
    console.error('API Error:', msg)
  }

  async function apiRequest<T>(
    requestFn: () => Promise<{ data: T }>
  ): Promise<T | null> {
    isLoading.value = true
    error.value = null

    try {
      const { data } = await requestFn()
      return data
    } catch (e) {
      handleError(e as ApiError)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Actions
  async function fetchProject(accessUuid: string): Promise<Project | null> {
    const data = await apiRequest<Project>(() =>
      $axios.get(`/guest/projects/${accessUuid}`)
    )
    if (data) {
      currentProject.value = data
    }
    return data
  }
  const fetchProjectDetail = async (
    accessUuid: string
  ): Promise<Project | null> => {
    const data = await apiRequest<Project>(() =>
      $axios.get(`/api/projects/${accessUuid}/detail`)
    )
    if (data) currentProject.value = data
    return data
  }

  const updateProjectData = async (
    accessUuid: string,
    updates: Partial<Project>
  ): Promise<Project | null> => {
    const data = await apiRequest<Project>(() =>
      $axios.patch(`/api/projects/${accessUuid}`, updates)
    )
    if (data) currentProject.value = data
    return data
  }

  return {
    // State
    project,
    currentProject,
    error,
    isLoading,

    // Actions
    fetchProject,
    fetchProjectDetail,
    updateProjectData,
  }
})
