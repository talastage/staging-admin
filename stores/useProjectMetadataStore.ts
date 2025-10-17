// stores/useProjectMetadataStore

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp } from '#app'

interface ProjectMetadata {
  project: {
    id: number
    access_uuid: string
    name: string
    description: string
    categories?: Array<{ id: number; name: string }>
    [key: string]: any
  }
  creator: {
    id: number
    username: string
    display_name: string
    profile_photo: string
  }
  user_interaction: {
    is_creator: boolean
    is_investor: boolean
  }
  fanning_status: {
    is_fanned_by_auth_user: boolean
    [key: string]: any
  }
  views_count: number
  likes_count: number
  dislikes_count: number
  user_reaction: string | null
  [key: string]: any
}

export const useProjectMetadataStore = defineStore('projectMetadata', () => {
  const nuxtApp = useNuxtApp()

  const metadata = ref<ProjectMetadata | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchProjectMetadata = async (accessUuid: string) => {
    // Check if we have the $api plugin available
    if (!nuxtApp.$api) {
      error.value = 'API plugin not available'
      console.error('$api plugin not available in useProjectMetadataStore')
      return
    }

    isLoading.value = true
    error.value = null
    try {
      const response = await nuxtApp.$api.get(`/api/projects/${accessUuid}/metadata`)
      
      // Handle different possible response structures
      if (response?.data?.metadata) {
        metadata.value = response.data.metadata
      } else if (response?.metadata) {
        metadata.value = response.metadata
      } else if (response?.data) {
        metadata.value = response.data
      } else {
        console.warn('Unexpected response structure:', response)
        metadata.value = response as any
      }
    } catch (err: any) {
      const errorMessage = err?.message || err?.data?.message || 'An error occurred while fetching project metadata'
      error.value = errorMessage
      console.error('Error fetching project metadata:', errorMessage, err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    metadata,
    isLoading,
    error,
    fetchProjectMetadata,
  }
})
