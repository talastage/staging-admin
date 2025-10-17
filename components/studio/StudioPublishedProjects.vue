<template>
  <div class="published-projects">
    <!-- Error Alert -->
    <v-alert v-if="error" type="error" variant="tonal" closable class="mb-4">
      {{ error }}
    </v-alert>

    <!-- Projects Grid -->
    <div class="projects-grid" ref="projectsListRef">
      <template v-if="projects.length">
        <StudioProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
          @edit-project="handleEditProject"
          @edit-draft="handleEditDraft"
          @delete-project="handleDeleteProject"
          @view-details="handleViewDetails"
          @view-earnings="handleViewEarnings"
        />
      </template>

      <!-- Empty State -->
      <template v-else-if="!isLoading">
        <EmptyStateCard
          title="No Published Projects"
          message="You haven't published any projects yet. Start by premiering your first project!"
          icon="mdi-video-off-outline"
          action-text="Premiere a Project"
          :on-action-click="() => router.push('/premiering')"
        />
      </template>

      <!-- Loading Skeletons -->
      <template v-if="isLoading">
        <v-skeleton-loader
          v-for="n in 3"
          :key="n"
          type="article"
          :loading="true"
          class="skeleton-loader"
        />
      </template>
    </div>

    <!-- Infinite Scroll Trigger -->
    <div ref="loadTrigger" class="load-trigger" v-if="hasMore && !isLoading" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { useStudioProjectsStore } from '@/stores/studioProjectsStore'
import { useIntersectionObserver } from '@vueuse/core'

interface Project {
  id: number
  access_uuid: string
  premiering_category_slug?: string
  // ... other project properties
}

const router = useRouter()
const projectsStore = useStudioProjectsStore()
const error = ref('')
const projectsListRef = ref(null)
const loadTrigger = ref(null)
const lastFetchTime = ref<number | null>(null)
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Computed Properties
const projects = computed(() => projectsStore.getProjectsByType('published'))
const isLoading = computed(() => projectsStore.projects.published.isLoading)
const isLoaded = computed(() => projectsStore.projects.published.isLoaded)
const hasMore = computed(() => projectsStore.hasMore('published'))
const needsRefresh = computed(() => {
  if (!lastFetchTime.value) return true
  return Date.now() - lastFetchTime.value > CACHE_DURATION
})

// Data Loading
const loadProjects = async () => {
  try {
    if (hasMore.value && !isLoading.value) {
      await projectsStore.fetchProjects('published')
      lastFetchTime.value = Date.now()
    }
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Failed to load projects. Please try again.'
  }
}

// Navigation Handlers
const handleEditProject = (project: Project) => {
  router.push(`/studio/projects/${project.access_uuid}/detail`)
}

const handleEditDraft = (project: Project) => {
  router.push(`/premiering/${project.premiering_category_slug}/edit_draft`)
}

const handleViewDetails = (project: Project) => {
  router.push(`/studio/projects/${project.access_uuid}/detail`)
}

const handleViewEarnings = (project: Project) => {
  router.push(`/project/${project.access_uuid}/earnings`)
}

const handleDeleteProject = (project: Project) => {
  emit('delete-project', project)
}

// Infinite Scroll
useIntersectionObserver(
  loadTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !isLoading.value && hasMore.value) {
      loadProjects()
    }
  },
  { threshold: 0.5 }
)

// Lifecycle Hooks
onMounted(() => {
  if (!isLoaded.value || needsRefresh.value) {
    loadProjects()
  }
})

onActivated(() => {
  if (needsRefresh.value) {
    loadProjects()
  }
})

const emit = defineEmits<{
  (e: 'delete-project', project: Project): void
}>()
</script>

<style scoped>
.published-projects {
  padding: 16px;
}

.projects-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 800px), 1fr));
  margin-bottom: 24px;
}

.skeleton-loader {
  height: 200px;
  border-radius: 12px;
}

.load-trigger {
  height: 20px;
  margin-top: 16px;
  visibility: hidden;
}

@media (max-width: 600px) {
  .published-projects {
    padding: 12px;
  }

  .projects-grid {
    gap: 16px;
  }
}

/* Optional: Add smooth loading transition */
.projects-grid > * {
  transition: opacity 0.3s ease;
}

.projects-grid > *[data-loading='true'] {
  opacity: 0.6;
}
</style>
