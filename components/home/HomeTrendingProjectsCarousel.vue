<template>
  <div>
    <TrendingProjectsCarousel
      :projects="projects"
      :loading="isLoading"
      :loadingMore="isLoadingMore"
      :error="hasError"
      @reachEnd="handleReachEnd"
      @projectClick="navigateToVideo"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from '#app'
import type { Project } from '~/types/project'

interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
  links: Array<{
    url: string | null
    label: string
    active: boolean
  }>
  path: string
}

interface ApiResponse {
  data: Project[]
  meta: {
    meta: PaginationMeta
  }
}

const nuxtApp = useNuxtApp()
const router = useRouter()

// Data state
const projects = ref<Project[]>([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const currentPage = ref(1)
const lastPage = ref(1)
const hasError = ref(false)

// Fetch data with pagination
const fetchProjects = async (page = 1) => {
  // Check if API is available
  if (!nuxtApp.$api) {
    console.warn('API plugin not available - skipping fetch')
    hasError.value = true
    isLoading.value = false
    return
  }

  if ((isLoading.value || isLoadingMore.value) && page !== 1) return

  try {
    hasError.value = false

    if (page === 1) {
      isLoading.value = true
    } else {
      isLoadingMore.value = true
    }

    const response = await nuxtApp.$api.get<ApiResponse>(
      `/api/trending/projects`,
      { params: { page } }
    )

    if (page === 1) {
      projects.value = response.data
    } else {
      // Filter out duplicates when appending new data
      const newProjects = response.data.filter(
        (newProject) =>
          !projects.value.some((existing) => existing.id === newProject.id)
      )
      projects.value = [...projects.value, ...newProjects]
    }

    // Update pagination metadata
    const metaData = response.meta.meta
    lastPage.value = metaData.last_page
    currentPage.value = metaData.current_page
  } catch (error) {
    console.error('Failed to fetch trending projects:', error)
    hasError.value = true
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// Load more data when approaching the end
const handleReachEnd = async () => {
  if (
    currentPage.value < lastPage.value &&
    !isLoadingMore.value &&
    !hasError.value
  ) {
    await fetchProjects(currentPage.value + 1)
  }
}

const navigateToVideo = (video: Project) => {
  router.push(`/watch/${video.access_uuid}`)
}

// Lifecycle hooks - only fetch on client side
onMounted(() => {
  if (process.client) {
    fetchProjects()
  }
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>
