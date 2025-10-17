<!-- components/ProjectCardCompact.vue -->
<template>
  <v-card
    class="project-card"
    :elevation="0"
    :ripple="false"
    @click="handleVideoClick"
  >
    <div class="project-card__content">
      <!-- Thumbnail -->
      <div class="thumbnail-wrapper">
        <MediaThumbnail
          :thumbnail-url="project.thumbnail_url"
          :video-url="project.video_url"
          :show-views="false"
          :show-duration="true"
          :size="thumbnailSize"
          class="thumbnail"
        />
        <div class="duration-badge">
          <span>{{ formatDuration(project.duration) }}</span>
        </div>
      </div>

      <!-- Info Section -->
      <div class="info-section">
        <!-- Details -->
        <div class="details">
          <!-- Title and Action Row -->
          <div class="title-action-row">
            <!-- Title -->
            <h3 class="title" :title="project.name">
              {{ truncateText(project.name, 60) }}
            </h3>

            <!-- Moved: Slot for action buttons -->
            <div class="action-buttons">
              <slot name="actions"></slot>
            </div>
          </div>

          <!-- Metadata -->
          <div class="metadata">
            <span class="creator-name" v-if="project.creator">
              {{ project.creator.display_name }}
            </span>
            <div class="stats">
              <span class="views">
                {{ formatViewCount(project.views_count) }} views
              </span>
              <span class="dot">•</span>
              <DateDisplay :date="project.created_at" class="date" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { Video } from '~/types/video'

interface Props {
  project: Video
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const emit = defineEmits(['click'])

// Computed
const thumbnailSize = computed(() => {
  const sizes = { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' }
  return sizes[props.size] || 'md'
})

// Methods
const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

const formatViewCount = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return count.toString()
}

const formatDuration = (seconds: number): string => {
  if (!seconds) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

const handleVideoClick = (event: Event) => {
  // Prevent navigation if click is on a button or other interactive element
  if ((event.target as HTMLElement).closest('.action-buttons')) {
    event.stopPropagation()
    return
  }

  navigateTo(`/watch/${props.project.access_uuid}`)
  emit('click')
}
</script>

<style scoped lang="scss">
.project-card {
  background: transparent;
  transition: transform 0.2s ease;
  border-radius: 12px;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);

    .thumbnail {
      transform: scale(1.05);
    }
  }

  &__content {
    display: flex;
    gap: 1rem;
    padding: 0.75rem;
  }
}

.thumbnail-wrapper {
  position: relative;
  flex-shrink: 0;
  width: 180px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;

  .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .duration-badge {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }
}

.info-section {
  display: flex;
  gap: 0.75rem;
  flex: 1;
  min-width: 0; // Prevents flex item from overflowing
}

.creator-avatar {
  flex-shrink: 0;
}

.details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title-action-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.title {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--v-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 1;
}

.action-buttons {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
}

.metadata {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--v-text-secondary);

  .creator-name {
    font-weight: 500;
  }

  .stats {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .dot {
      font-size: 0.5rem;
    }
  }
}

// Responsive Design
@media (max-width: 600px) {
  .project-card__content {
    padding: 0.5rem;
    gap: 0.75rem;
  }

  .thumbnail-wrapper {
    width: 120px;
    height: 67px;
  }

  .creator-avatar {
    width: 32px;
    height: 32px;
  }

  .title {
    font-size: 0.9rem;
    -webkit-line-clamp: 2;
  }

  .metadata {
    font-size: 0.75rem;
  }

  .title-action-row {
    flex-direction: column;
    gap: 0.25rem;
  }

  .action-buttons {
    margin-left: 0;
  }
}

// Dark Mode Support
:deep(.v-theme--dark) {
  .title {
    color: var(--v-text-primary-dark);
  }

  .metadata {
    color: var(--v-text-secondary-dark);
  }
}
</style>
