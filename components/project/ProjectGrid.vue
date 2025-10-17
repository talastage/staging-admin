<!-- ProjectGrid.vue -->
<template>
  <div class="project-grid">
    <v-container fluid class="pa-0">
      <!-- Grid Layout -->
      <v-row v-if="isGridDisplay">
        <v-col
          v-for="project in projects"
          :key="project.id"
          cols="12"
          sm="6"
          md="4"
          class="pa-2"
        >
          <ProjectCard :project="project" :loading="false" />
        </v-col>
        <!-- Skeleton Loaders for Grid -->
        <template v-if="isLoading">
          <v-col
            v-for="n in computedSkeletonCount"
            :key="`skeleton-${n}`"
            cols="12"
            sm="6"
            md="4"
            class="pa-2"
          >
            <ProjectCardSkeleton />
          </v-col>
        </template>
      </v-row>

      <!-- List Layout -->
      <v-row v-else>
        <v-col
          v-for="project in projects"
          :key="project.id"
          cols="12"
          class="pa-2"
        >
          <ProjectCardCompact :project="project" />
        </v-col>

        <!-- Skeleton Loaders for List -->
        <template v-if="isLoading">
          <v-col
            v-for="n in computedSkeletonCount"
            :key="`skeleton-${n}`"
            cols="12"
            class="pa-2"
          >
            <ProjectCardSkeleton compact />
          </v-col>
        </template>
      </v-row>

      <!-- Empty State -->
      <v-row v-if="!isLoading && projects.length === 0">
        <v-col cols="12" class="text-center">
          <slot name="empty-state">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-folder-open-outline
            </v-icon>
            <p class="text-body-1">No projects found.</p>
          </slot>
        </v-col>
      </v-row>

      <!-- Intersection Observer Target -->
      <div
        v-show="hasMorePages"
        ref="intersectionTarget"
        class="intersection-target"
      />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import type { Project } from '@/types/project'

// Define props with optional skeletonCount
interface Props {
  projects: Project[]
  currentPage: number
  lastPage: number
  isLoading: boolean
  title?: string
  variant?: 'grid' | 'list'
  skeletonCount?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'load-more'): void
}>()

// Computed properties
const isGridDisplay = computed(() => props.variant === 'grid')

// Determine if there are more pages to load
const hasMorePages = computed(() => props.currentPage < props.lastPage)

// Compute skeletonCount based on variant if not provided
const computedSkeletonCount = computed(() => {
  if (props.skeletonCount !== undefined && props.skeletonCount !== null) {
    return props.skeletonCount
  }
  // Adjusted skeleton count for 3 cards per row
  return isGridDisplay.value ? 9 : 6
})

// Refs for Intersection Observer
const intersectionTarget = ref<HTMLElement | null>(null)

// Setup Intersection Observer
const { stop: stopObserver } = useIntersectionObserver(
  intersectionTarget,
  ([entry]) => {
    if (entry?.isIntersecting && !props.isLoading && hasMorePages.value) {
      emit('load-more')
    }
  },
  {
    threshold: 0.1,
    rootMargin: '100px',
  }
)

// Cleanup on unmount
onUnmounted(() => {
  stopObserver()
})
</script>

<style scoped>
.project-grid {
  width: 100%;
  max-width: 100%;
}

.intersection-target {
  height: 20px;
  width: 100%;
}

/* Grid Mode Specific Styles */
:deep(.project-card) {
  height: 100%;
  background: transparent;
}

/* List Mode Specific Styles */
:deep(.project-card-compact) {
  width: 100%;
  margin-bottom: 0;
}
</style>
