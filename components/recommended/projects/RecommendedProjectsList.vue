<!-- components/RecommendedProjectsSection.vue -->
<template>
  <div class="recommended-section">
    <!-- Section Header -->
    <div class="section-header">
      <h3 class="text-h6 font-weight-medium">
        {{ loading ? '' : 'Recommended' }}
      </h3>
    </div>

    <!-- Loading State -->
    <div v-if="loading && projects.length === 0" class="skeleton-container">
      <div v-for="n in 5" :key="n" class="skeleton-item">
        <!-- Thumbnail Skeleton -->
        <div class="skeleton-thumbnail">
          <v-skeleton-loader type="image" height="100" width="180" />
        </div>

        <!-- Content Skeleton -->
        <div class="skeleton-content">
          <!-- Avatar Skeleton -->
          <v-skeleton-loader type="avatar" size="36" class="skeleton-avatar" />

          <!-- Text Content -->
          <div class="skeleton-text">
            <!-- Title -->
            <v-skeleton-loader type="text" class="skeleton-title" />

            <!-- Metadata -->
            <div class="skeleton-metadata">
              <v-skeleton-loader type="text" width="120" />
              <v-skeleton-loader type="text" width="80" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
    >
      {{ error }}
    </v-alert>

    <!-- Empty State -->
    <div v-else-if="!loading && projects.length === 0" class="empty-state">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">
        mdi-playlist-plus
      </v-icon>
      <h3 class="text-h6 font-weight-medium mb-2">No Recommendations Yet</h3>
      <p class="text-body-1 text-medium-emphasis mb-4">
        We'll show you interesting projects here
      </p>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="$emit('create-project')"
      >
        Create Project
      </v-btn>
    </div>

    <!-- Content State -->
    <div v-else class="content-container">
      <!-- Projects List -->
      <ProjectList :projects="projects" cardVariant="default" />

      <!-- Loading More Indicator -->
      <v-fade-transition>
        <div v-if="loading && projects.length > 0" class="loading-more">
          <v-progress-circular indeterminate color="primary" size="24" />
          <span class="text-body-2 text-medium-emphasis ml-2">
            Loading more...
          </span>
        </div>
      </v-fade-transition>

      <!-- Load More Button -->
      <v-btn
        v-if="hasMoreProjects && !loading"
        block
        variant="tonal"
        color="primary"
        class="mt-4"
        @click="$emit('load-more')"
      >
        Show More
      </v-btn>
    </div>

    <!-- Infinite Scroll Observer -->
    <div ref="infiniteScrollTarget" class="scroll-observer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Project } from '@/types/project'

const props = defineProps({
  loading: Boolean,
  error: [String, Object, null],
  projects: {
    type: Array as PropType<Project[]>,
    required: true,
  },
  hasMoreProjects: Boolean,
})

const emit = defineEmits(['load-more', 'create-project'])

// Intersection Observer setup
const infiniteScrollTarget = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && props.hasMoreProjects && !props.loading) {
        emit('load-more')
      }
    },
    {
      threshold: 0.5,
      rootMargin: '200px',
    }
  )

  if (infiniteScrollTarget.value) {
    observer.observe(infiniteScrollTarget.value)
  }
})

onUnmounted(() => {
  if (observer && infiniteScrollTarget.value) {
    observer.unobserve(infiniteScrollTarget.value)
    observer.disconnect()
  }
})
</script>

<style scoped lang="scss">
.recommended-section {
  position: relative;
}

.section-header {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--v-surface-variant-base);
  border-radius: 12px;

  .skeleton-thumbnail {
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
  }

  .skeleton-content {
    flex: 1;
    display: flex;
    gap: 0.75rem;
    min-width: 0;

    .skeleton-avatar {
      flex-shrink: 0;
    }

    .skeleton-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .skeleton-title {
        max-width: 90%;
      }

      .skeleton-metadata {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  }
}

// Skeleton animation
:deep(.v-skeleton-loader__bone) {
  border-radius: 4px;

  &::after {
    animation: shimmer 1.5s infinite;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--v-surface-variant-base);
  border-radius: 12px;
  border: 2px dashed var(--v-border-opacity-variant-base);
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.scroll-observer {
  height: 20px;
  margin-top: 1rem;
}

// Dark mode adjustments
:deep(.v-theme--dark) {
  .skeleton-item {
    background: rgba(255, 255, 255, 0.05);
  }

  .v-skeleton-loader__bone::after {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.05),
      transparent
    );
  }
}

// Responsive adjustments
@media (max-width: 600px) {
  .skeleton-item {
    padding: 0.5rem;
    gap: 0.75rem;

    .skeleton-thumbnail {
      width: 120px;

      :deep(.v-skeleton-loader__image) {
        height: 67px !important;
      }
    }

    .skeleton-content {
      gap: 0.5rem;

      .skeleton-avatar {
        :deep(.v-skeleton-loader__avatar) {
          width: 32px !important;
          height: 32px !important;
        }
      }
    }
  }
}
</style>
