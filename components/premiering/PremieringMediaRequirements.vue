<template>
  <div class="requirements-wrapper">
    <!-- Title Display -->
    <h3 v-if="title" class="requirements-title">{{ title }}</h3>

    <!-- Loading Indicator -->
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      height="2"
    />

    <!-- Error Message -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-0"
    >
      {{ error }}
    </v-alert>

    <!-- Requirements Display -->
    <div
      v-else
      :class="[
        layout === 'horizontal' ? 'requirements-grid' : 'requirements-list',
      ]"
    >
      <!-- File Size -->
      <div class="req-item">
        <v-icon
          :size="layout === 'horizontal' ? 'small' : 'default'"
          color="primary"
          class="mr-2"
        >
          mdi-file-size
        </v-icon>
        <div
          :class="
            layout === 'horizontal'
              ? 'req-content-horizontal'
              : 'req-content-vertical'
          "
        >
          <span class="req-label">Maximum Size:</span>
          <span class="req-value">{{ formattedMaxSize }}</span>
        </div>
      </div>

      <!-- Resolution -->
      <div class="req-item">
        <v-icon
          :size="layout === 'horizontal' ? 'small' : 'default'"
          color="primary"
          class="mr-2"
        >
          mdi-video-high-definition
        </v-icon>
        <div
          :class="
            layout === 'horizontal'
              ? 'req-content-horizontal'
              : 'req-content-vertical'
          "
        >
          <span class="req-label">Max Resolution:</span>
          <span class="req-value">{{ resolution }}</span>
        </div>
      </div>

      <!-- Format -->
      <div class="req-item">
        <v-icon
          :size="layout === 'horizontal' ? 'small' : 'default'"
          color="primary"
          class="mr-2"
        >
          mdi-video-input-component
        </v-icon>
        <div
          :class="
            layout === 'horizontal'
              ? 'req-content-horizontal'
              : 'req-content-vertical'
          "
        >
          <span class="req-label">Format:</span>
          <span class="req-value">{{ format }}</span>
        </div>
      </div>

      <!-- Duration -->
      <div class="req-item">
        <v-icon
          :size="layout === 'horizontal' ? 'small' : 'default'"
          color="primary"
          class="mr-2"
        >
          mdi-clock-outline
        </v-icon>
        <div
          :class="
            layout === 'horizontal'
              ? 'req-content-horizontal'
              : 'req-content-vertical'
          "
        >
          <span class="req-label">Duration:</span>
          <span class="req-value">{{ formattedDuration }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTimeFormatting } from '~/composables/useTimeFormatting'
import { useFileFormatting } from '~/composables/useFileFormatting'

interface Props {
  title?: string // Added to accept a title
  loading?: boolean
  error?: string | null
  maxSize: number | string
  resolution: string
  format: string
  duration: number
  layout?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined, // Optional, no default value
  loading: false,
  error: null,
  layout: 'horizontal',
})

const { formatDuration } = useTimeFormatting()
const { formatFileSize } = useFileFormatting()

const formattedMaxSize = computed(() => {
  // maxSize is now in bytes from the store
  const sizeInBytes =
    typeof props.maxSize === 'string'
      ? parseInt(props.maxSize, 10)
      : props.maxSize

  return formatFileSize(sizeInBytes)
})

const formattedDuration = computed(() => {
  const seconds = props.duration
  if (typeof seconds !== 'number' || isNaN(seconds)) return 'Invalid duration'
  return formatDuration(seconds, {
    showSeconds: true,
    shortFormat: true,
  })
})
</script>

<style scoped>
.requirements-wrapper {
  position: relative;
  min-height: 40px;
}

.requirements-title {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--v-high-emphasis);
}

.requirements-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 4px 0;
}

@media (min-width: 600px) {
  .requirements-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}

.req-item {
  display: flex;
  align-items: center;
}

.req-content-horizontal,
.req-content-vertical {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
}

.req-label {
  color: var(--v-medium-emphasis);
  min-width: 65px;
}

.req-value {
  font-weight: 500;
  color: var(--v-high-emphasis);
}
</style>
