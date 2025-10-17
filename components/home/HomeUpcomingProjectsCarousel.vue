<template>
  <div v-show="!isLoading || projects.length > 0">
    <BaseHeader title="Upcoming Premieres" />
    <UpcomingProjectsCarousel
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUpcomingPremieres } from '~/composables/useUpcomingPremieres'
import type { UpcomingPremiere } from '@/types/premiere'

const emit = defineEmits(['has-data', 'loading'])

const router = useRouter()
const { fetchUpcomingPremieres } = useUpcomingPremieres()

// Data state
const projects = ref<UpcomingPremiere[]>([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const currentPage = ref(1)
const lastPage = ref(1)
const hasError = ref(false)

// Watch for projects changes to emit has-data event
watch(projects, (newProjects) => {
  emit('has-data', newProjects.length > 0)
})

// Watch loading state
watch(isLoading, (loading) => {
  emit('loading', loading)
})

// Fetch data with pagination
const fetchProjects = async (page = 1) => {
  if ((isLoading.value || isLoadingMore.value) && page !== 1) return

  try {
    hasError.value = false
    if (page === 1) {
      isLoading.value = true
      emit('loading', true)
    } else {
      isLoadingMore.value = true
    }

    const response = await fetchUpcomingPremieres(page)

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
    lastPage.value = response.meta.last_page
    currentPage.value = response.meta.current_page

    // Emit has-data event immediately after data is loaded
    emit('has-data', projects.value.length > 0)
  } catch (error: any) {
    console.error('Failed to fetch upcoming premieres:', error)
    hasError.value = true
    emit('has-data', false)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
    emit('loading', false)
  }
}

const handleReachEnd = async () => {
  if (
    currentPage.value < lastPage.value &&
    !isLoadingMore.value &&
    !hasError.value
  ) {
    await fetchProjects(currentPage.value + 1)
  }
}

const navigateToVideo = (video: UpcomingPremiere) => {
  router.push(`/watch/${video.access_uuid}`)
}

onMounted(() => {
  if (process.client) {
    fetchProjects()
  }
})
</script>
