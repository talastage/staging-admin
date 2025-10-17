<template>
  <div class="draft-projects">
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
          title="No Projects Yet"
          message="You haven't premiered any projects yet. Start by premiering your first project!"
          icon="mdi-file-document-outline"
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
  status: 'draft' | 'published'
  name: string
  description?: string
  created_at: string
}

const router = useRouter()
const projectsStore = useStudioProjectsStore()
const error = ref('')
const projectsListRef = ref(null)
const loadTrigger = ref(null)
const lastFetchTime = ref<number | null>(null)
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Computed Properties
const projects = computed(() => projectsStore.getProjectsByType('draft'))
const isLoading = computed(() => projectsStore.projects.draft.isLoading)
const isLoaded = computed(() => projectsStore.projects.draft.isLoaded)
const hasMore = computed(() => projectsStore.hasMore('draft'))
const needsRefresh = computed(() => {
  if (!lastFetchTime.value) return true
  return Date.now() - lastFetchTime.value > CACHE_DURATION
})

// Data Loading
const loadProjects = async (force = false) => {
  if (!force && !needsRefresh.value && isLoaded.value) {
    return
  }

  try {
    if (hasMore.value && !isLoading.value) {
      await projectsStore.fetchProjects('draft')
      lastFetchTime.value = Date.now()
    }
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Failed to load draft projects. Please try again.'
    console.error('Error loading draft projects:', err)
  }
}

// Navigation Handlers
const handleEditProject = (project: Project) => {
  router.push(`/studio/projects/${project.access_uuid}/detail`)
}

const handleEditDraft = (project: Project) => {
  router.push(`/studio/projects/${project.access_uuid}/edit_draft`)
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

// Reset and Reload
const resetAndReload = async () => {
  projectsStore.resetProjects('draft')
  lastFetchTime.value = null
  await loadProjects(true)
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
    loadProjects(true)
  }
})

const emit = defineEmits<{
  (e: 'delete-project', project: Project): void
}>()
</script>

<style scoped>
.draft-projects {
  padding: 16px;
  min-height: 200px;
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
  .draft-projects {
    padding: 12px;
  }

  .projects-grid {
    gap: 16px;
  }
}

/* Loading States */
.projects-grid > * {
  transition: opacity 0.3s ease;
}

.projects-grid > *[data-loading='true'] {
  opacity: 0.6;
}

/* Skeleton Animation */
@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.skeleton-loader {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.2) 37%,
    rgba(255, 255, 255, 0.1) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}
</style>
