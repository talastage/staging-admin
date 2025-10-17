<!-- UploadProgressBar.vue -->
<template>
  <div class="upload-progress">
    <v-progress-linear
      :model-value="progress"
      :color="color"
      height="20"
      rounded
      striped
    >
      <template #default="{ value }">
        <div class="progress-text">
          <strong>{{ value.toFixed(1) }}%</strong>
        </div>
      </template>
    </v-progress-linear>
    <div class="status-text mt-2" :class="statusClass">
      {{ statusMessage }}
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  progress: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
}>()

const color = computed(() => {
  switch (props.status) {
    case 'completed':
      return 'success'
    case 'failed':
      return 'error'
    case 'processing':
      return 'info'
    default:
      return 'primary'
  }
})

const statusClass = computed(() => ({
  'text-success': props.status === 'completed',
  'text-error': props.status === 'failed',
  'text-info': props.status === 'processing',
}))

const statusMessage = computed(() => {
  switch (props.status) {
    case 'completed':
      return 'Upload completed'
    case 'failed':
      return 'Upload failed'
    case 'processing':
      return 'Processing...'
    default:
      return 'Uploading...'
  }
})
</script>

<style scoped>
.upload-progress {
  width: 100%;
}
.progress-text {
  color: white;
  font-size: 0.875rem;
  line-height: 20px;
  height: 20px;
  text-align: center;
}
.status-text {
  font-size: 0.875rem;
  text-align: center;
}
.text-success {
  color: rgb(var(--v-theme-success));
}
.text-error {
  color: rgb(var(--v-theme-error));
}
.text-info {
  color: rgb(var(--v-theme-info));
}
</style>
