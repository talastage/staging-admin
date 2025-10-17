<template>
  <v-card class="project-header" elevation="2">
    <div class="d-flex flex-sm-row flex-column pa-4 gap-4">
      <!-- Thumbnail Section -->
      <div class="project-thumbnail-wrapper">
        <MediaThumbnail
          :thumbnailUrl="project.thumbnail_url"
          :videoUrl="project.video_url"
          :showViews="false"
          :showDuration="true"
          size="xs"
          class="project-card__thumbnail"
        />
      </div>

      <!-- Content Section -->
      <div class="project-content flex-grow-1">
        <!-- Title Section -->
        <div class="d-flex align-center justify-space-between mb-2">
          <h2
            class="text-h6 font-weight-bold text-truncate"
            :title="project.name"
          >
            {{ project.name }}
          </h2>
          <v-chip
            v-if="project.status"
            :color="statusChipColor"
            size="small"
            class="status-chip"
            variant="tonal"
          >
            <v-icon :icon="statusIcon" size="small" start class="mr-1" />
            {{ capitalizeFirst(project.status) }}
          </v-chip>
        </div>

        <!-- Metadata Section -->
        <div class="d-flex flex-wrap gap-2">
          <!-- Created Date -->
          <div class="d-flex align-center">
            <v-icon
              icon="mdi-calendar-outline"
              size="small"
              class="mr-1"
              color="primary"
            />
            <span class="text-body-2 text-medium-emphasis">
              {{ formattedDate }}
            </span>
          </div>

          <!-- Creator Share - Only show if available -->
          <template
            v-if="
              project.creator_share_percentage !== null &&
              project.creator_share_percentage !== undefined
            "
          >
            <v-divider vertical class="mx-2" />
            <div class="d-flex align-center">
              <v-icon
                icon="mdi-account-cash-outline"
                size="small"
                class="mr-1"
                color="success"
              />
              <span class="text-body-2 text-medium-emphasis">
                Creator Share: {{ project.creator_share_percentage }}%
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDateFormatter } from '~/composables/useDateFormatter'

export interface Project {
  access_uuid: string
  thumbnail_url: string | null
  video_url: string | null
  name: string
  created_at: string
  creator_share_percentage?: number | null
  status?: 'draft' | 'published' | 'pending'
}

const props = defineProps<{
  project: Project
}>()

const { formatRelativeDate } = useDateFormatter()

const formattedDate = computed(() =>
  formatRelativeDate(props.project.created_at)
)

const statusIcon = computed(() => {
  if (!props.project.status) return ''

  const icons: Record<string, string> = {
    draft: 'mdi-pencil-outline',
    published: 'mdi-check-circle-outline',
    pending: 'mdi-clock-outline',
  }
  return icons[props.project.status] || 'mdi-help-circle-outline'
})

const statusChipColor = computed(() => {
  if (!props.project.status) return ''

  const colors: Record<string, string> = {
    draft: 'grey',
    published: 'success',
    pending: 'warning',
  }
  return colors[props.project.status] || 'grey'
})

const capitalizeFirst = (str?: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

defineEmits<{
  (e: 'click'): void
  (e: 'thumbnailClick'): void
}>()
</script>

<style scoped>
.project-header {
  background: var(--v-surface-variant);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.project-thumbnail-wrapper {
  flex-shrink: 0;
  width: 180px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.project-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-content {
  min-width: 0; /* Ensures text-truncate works properly */
}

.status-chip {
  font-size: 0.75rem;
  height: 24px;
}

.gap-2 {
  gap: 8px;
}

.gap-4 {
  gap: 16px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .project-thumbnail-wrapper {
    width: 100%;
    height: 200px;
  }

  .project-content {
    padding-top: 8px;
  }

  .gap-4 {
    gap: 12px;
  }
}
</style>
