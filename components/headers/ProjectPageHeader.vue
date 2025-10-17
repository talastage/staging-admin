<template>
  <header class="project-page-header">
    <div class="d-flex align-start gap-6">
      <!-- Project Thumbnail -->
      <div class="project-thumbnail" v-if="showThumbnail">
        <div class="video-thumbnail">
          <v-img
            :src="project?.thumbnail_url"
            aspect-ratio="16/9"
            cover
            width="128"
            class="project-thumbnail-img"
            :class="{ 'placeholder-bg': !project?.thumbnail_url }"
          >
            <template #placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-icon
                  icon="mdi-video-outline"
                  size="32"
                  color="medium-emphasis"
                />
              </div>
            </template>
          </v-img>
        </div>
      </div>

      <!-- Header Content -->
      <div class="header-content flex-grow-1">
        <!-- Title/Subtitle -->
        <div class="d-flex align-center justify-space-between flex-wrap gap-3">
          <div class="title-section">
            <h1
              :class="[
                titleClass || 'text-h4',
                'font-weight-bold',
                { 'mb-1': subtitle },
                { 'gradient-text': gradient },
              ]"
            >
              <slot name="title">{{ displayTitle }}</slot>
            </h1>

            <p
              v-if="subtitle"
              :class="[
                subtitleClass || 'text-h6',
                'text-medium-emphasis',
                'mb-0',
              ]"
            >
              <slot name="subtitle">{{ subtitle }}</slot>
            </p>
          </div>

          <!-- Status Chip + Additional Actions -->
          <div class="actions-section d-flex align-center gap-3">
            <v-chip
              v-if="showStatus && project?.status"
              :color="statusChipColor"
              size="small"
              class="status-chip"
              variant="tonal"
            >
              <v-icon :icon="statusIcon" size="small" start class="mr-1" />
              {{ capitalizeFirst(project.status) }}
            </v-chip>

            <!-- Named slot for more actions -->
            <slot name="actions" />
          </div>
        </div>

        <!-- Extra content slot -->
        <slot name="content" />
      </div>
    </div>

    <!-- Bottom slot -->
    <slot name="bottom" />
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Project {
  id: number
  access_uuid: string
  name: string
  thumbnail_url: string | null
  video_url: string | null
  created_at: string
  status?: 'draft' | 'published' | 'pending' | 'scheduled'
}

interface Props {
  project: Project | null
  loading?: boolean
  showStatus?: boolean
  showThumbnail?: boolean
  title?: string
  subtitle?: string
  titleClass?: string
  subtitleClass?: string
  gradient?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showStatus: true,
  showThumbnail: true,
  title: '',
  subtitle: '',
  gradient: false,
})

// Computed
const displayTitle = computed(() => {
  if (props.loading) return 'Loading...'
  if (props.title) return props.title
  if (!props.project) return ''
  return props.project.name
})

const statusIcon = computed((): string => {
  switch (props.project?.status) {
    case 'draft':
      return 'mdi-pencil-outline'
    case 'published':
      return 'mdi-check-circle-outline'
    case 'pending':
      return 'mdi-clock-outline'
    case 'scheduled':
      return 'mdi-calendar-clock'
    default:
      return 'mdi-help-circle-outline'
  }
})

const statusChipColor = computed((): string => {
  switch (props.project?.status) {
    case 'draft':
      return 'grey'
    case 'published':
      return 'success'
    case 'pending':
      return 'warning'
    case 'scheduled':
      return 'info'
    default:
      return 'grey'
  }
})

function capitalizeFirst(str?: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style scoped>
.project-page-header {
  margin-bottom: 32px;
}

.video-thumbnail {
  border: 2px solid var(--v-border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.video-thumbnail:hover {
  transform: scale(1.03);
}

.project-thumbnail-img {
  border-radius: 6px;
}

.placeholder-bg {
  background-color: var(--v-surface-variant);
}

.header-content {
  min-width: 0; /* Ensures proper text truncation */
}

.title-section {
  min-width: 0;
  flex: 1;
}

.title-section h1 {
  margin-bottom: 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.status-chip {
  font-size: 0.75rem;
  height: 24px;
}

.gradient-text {
  background: linear-gradient(
    45deg,
    var(--v-primary-base),
    var(--v-secondary-base)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gap-3 {
  gap: 12px;
}

.gap-6 {
  gap: 24px;
}
</style>
