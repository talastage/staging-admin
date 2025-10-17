<!-- components/ProjectList.vue -->
<template>
  <div class="project-list-container">
    <!-- Loading State -->
    <template v-if="loading">
      <div class="project-skeleton">
        <v-skeleton-loader
          v-for="n in skeletonCount"
          :key="n"
          type="list-item-avatar-three-line"
          class="mb-3"
        />
      </div>
    </template>

    <!-- Projects List -->
    <template v-else>
      <TransitionGroup
        name="project-list"
        tag="div"
        class="project-list"
        :class="{ 'is-empty': !hasProjects }"
      >
        <component
          v-for="project in projects"
          :is="cardComponent"
          :key="project.id"
          :project="project"
          class="project-item"
          @click="handleProjectClick(project)"
        />
      </TransitionGroup>

      <!-- Empty State -->
      <v-fade-transition>
        <div v-if="!hasProjects" class="empty-state">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">
            mdi-playlist-remove
          </v-icon>
          <h3 class="text-h6 font-weight-medium mb-2">
            {{ emptyStateTitle }}
          </h3>
          <p class="text-body-1 text-medium-emphasis mb-4">
            {{ emptyStateMessage }}
          </p>
          <slot name="empty-action">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="$emit('create-project')"
            >
              Create Project
            </v-btn>
          </slot>
        </div>
      </v-fade-transition>
    </template>

    <!-- Error State -->
    <v-alert v-if="error" type="error" variant="tonal" closable class="mt-4">
      {{ error }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '@/types/project'

// Import both card components
import ProjectCard from '@/components/project/ProjectCard.vue'
import ProjectCardCompact from '@/components/project/ProjectCardCompact.vue'

interface Props {
  projects: Project[]
  loading?: boolean
  error?: string | null
  emptyStateTitle?: string
  emptyStateMessage?: string
  skeletonCount?: number
  // New prop to select the card variant:
  cardVariant?: 'default' | 'compact'
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  emptyStateTitle: 'No Projects Found',
  emptyStateMessage: 'Start by creating your first project',
  skeletonCount: 3,
  cardVariant: 'compact',
})

// Emits
const emit = defineEmits<{
  (e: 'create-project'): void
  (e: 'project-click', project: Project): void
}>()

// Computed: check if there are projects
const hasProjects = computed(() => props.projects.length > 0)

// Computed: determine which card component to use based on the new prop
const cardComponent = computed(() => {
  return props.cardVariant === 'default' ? ProjectCard : ProjectCardCompact
})

// Methods
const handleProjectClick = (project: Project) => {
  emit('project-click', project)
}
</script>

<style scoped>
.project-list-container {
  position: relative;
  min-height: 100px;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-item {
  background: var(--v-surface-variant-base);
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--v-surface-variant-base);
  border-radius: 12px;
  border: 2px dashed var(--v-border-opacity-variant-base);
}

/* Skeleton Loading */
.project-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.v-skeleton-loader__list-item) {
  border-radius: 8px;
}

/* Transitions */
.project-list-move,
.project-list-enter-active,
.project-list-leave-active {
  transition: all 0.3s ease;
}

.project-list-enter-from,
.project-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.project-list-leave-active {
  position: absolute;
}

/* Dark Mode Adjustments */
:deep(.v-theme--dark) {
  .project-item {
    background: rgba(255, 255, 255, 0.05);
  }

  .empty-state {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .project-list {
    gap: 8px;
  }

  .empty-state {
    padding: 2rem 1rem;
  }
}
</style>
