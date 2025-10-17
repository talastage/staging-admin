<template>
  <div class="project-credits-page">
    <v-container v-if="project" class="px-0">
      <!-- Project Header -->
      <ProjectHeader :project="project" />

      <!-- Cast and Crew Section -->
      <BaseHeader
        title="Cast and Crew"
        subtitle="Discover the talented cast and crew behind this project. Explore actors, directors, producers, and all team members who contributed to this production."
      />

      <ProjectCreditGrid
        :is-loading="isLoading"
        :is-loading-more="isLoadingMore"
        :has-more="hasMore"
        :show-tip-button="true"
        :view-mode="viewMode"
        @tip-complete="handleTipComplete"
      />
    </v-container>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" class="ma-4">
      {{ error }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '~/stores/useProjectStore'
import { useProjectCreditStore } from '~/stores/useProjectCreditStore'
import { storeToRefs } from 'pinia'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

const route = useRoute()
const projectStore = useProjectStore()
const creditStore = useProjectCreditStore()
const { isLoading: pending, error } = storeToRefs(projectStore)

const accessUuid = computed(() => route.params.access_uuid as string)
const isShareDialogOpen = ref(false)
const pageUrl = computed(() => window.location.href)

const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const viewMode = ref('grid')

// Get project from store with formatted date
const project = computed(() => {
  const projectData = projectStore.currentProject
  if (projectData) {
    return {
      ...projectData,
      created_at: new Date(projectData.created_at).toLocaleString(),
    }
  }
  return null
})

// Get credits from store
const categoryGroups = computed(() => creditStore.categoryGroups)
const totalMembers = computed(() => creditStore.totalMembers)

const handleTipComplete = (credit: Credit) => {
  // Handle any post-tip logic if needed
  console.log('Tip completed for user:', credit.user.display_name)
}

// Fetch credits with pagination
const fetchCreditsPage = async (page: number) => {
  if (isLoadingMore.value) return []

  try {
    isLoadingMore.value = true
    const { data } = await useNuxtApp().$axios.get(
      `/guest/projects/${accessUuid.value}/credits`,
      {
        params: {
          page,
          per_page: 10,
        },
      }
    )

    // Update pagination state
    hasMore.value = data.meta.current_page < data.meta.last_page
    currentPage.value = data.meta.current_page

    // Process and merge the new data
    if (page === 1) {
      creditStore.categoryGroups = data.data
    } else {
      creditStore.mergeNewGroups(data.data)
    }

    return data.data.flatMap((group: any) => group.credits)
  } catch (error) {
    console.error('Error fetching credits:', error)
    return []
  } finally {
    isLoadingMore.value = false
  }
}

// Initialize infinite scroll
const {
  isLoading: scrollLoading,
  error: scrollError,
  hasMore: scrollHasMore,
} = useInfiniteScroll(fetchCreditsPage, {
  threshold: 200,
  throttle: 300,
  initialLoadDelay: 0,
})

// Watch for changes in accessUuid
watch(accessUuid, async (newUuid) => {
  if (newUuid && !project.value) {
    await projectStore.fetchProject(newUuid)
  }
})

const openShareDialog = () => {
  isShareDialogOpen.value = true
}

// Initialize
onMounted(async () => {
  if (accessUuid.value) {
    isLoading.value = true
    try {
      // Fetch project if not in store
      if (!project.value) {
        await projectStore.fetchProject(accessUuid.value)
      }

      // Initial credit fetch
      await fetchCreditsPage(1)
    } finally {
      isLoading.value = false
    }
  }
})

// Cleanup
onUnmounted(() => {
  creditStore.resetState()
})
</script>

<style scoped>
.project-credits-page {
  min-height: 400px;
}
</style>
