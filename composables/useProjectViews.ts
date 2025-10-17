// composables\useProjectViews.ts

import { ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useProjectMetadataStore } from '~/stores/useProjectMetadataStore'
import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'

export function useProjectViews() {
  const nuxtApp = useNuxtApp()
  const projectMetadataStore = useProjectMetadataStore()
  const authStore = useAuthStore()
  const { metadata } = storeToRefs(projectMetadataStore)

  const viewsCount = ref(0)
  const isRecordingView = ref(false)

  watch(
    () => metadata.value,
    (newMetadata) => {
      if (newMetadata?.views_count !== undefined) {
        viewsCount.value = newMetadata.views_count
      }
    },
    { immediate: true }
  )

  const recordProjectView = async (accessUuid: string) => {
    // Skip if not on client side
    if (!process.client) {
      console.log('View recording skipped - server side')
      return { views_count: viewsCount.value }
    }

    // Check if API plugin is available
    if (!nuxtApp.$api) {
      console.log('View recording skipped - API not available')
      return { views_count: viewsCount.value }
    }

    // Don't record views for unauthenticated users - best practice to reduce server load
    if (!authStore.isLoggedIn) {
      console.log('View recording skipped - user not authenticated')
      return { views_count: viewsCount.value }
    }

    // Prevent duplicate requests
    if (isRecordingView.value) return
    
    isRecordingView.value = true
    
    try {
      const response = await nuxtApp.$api.post(`/api/projects/${accessUuid}/view`, {})
      
      // Handle different response structures
      const newViewsCount = response?.data?.views_count ?? response?.views_count ?? viewsCount.value
      viewsCount.value = newViewsCount

      // Update the metadata store if we have metadata loaded
      if (metadata.value) {
        metadata.value.views_count = newViewsCount
      }

      return { views_count: newViewsCount }
    } catch (error: any) {
      // Silently handle authentication errors
      if (error?.status === 401 || error?.response?.status === 401) {
        console.log('View not recorded - authentication required')
        return { views_count: viewsCount.value }
      }
      
      // Log other errors but don't throw - view recording is non-critical
      console.warn('Error recording project view:', error?.message || error)
      return { views_count: viewsCount.value }
    } finally {
      isRecordingView.value = false
    }
  }

  return {
    viewsCount,
    recordProjectView,
  }
}