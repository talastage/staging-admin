<!-- components/ProjectDetailSavedHeader.vue -->
<template>
  <div
    class="project-detail-header d-flex align-center justify-space-between pa-4"
  >
    <div class="project-name text-h6">
      {{ projectName || 'Untitled Project' }}
    </div>

    <div class="save-status-container">
      <v-btn
        :color="statusColor"
        variant="tonal"
        :elevation="0"
        class="save-status-btn"
        :disabled="isSaving"
      >
        <template v-if="isSaving">
          <v-progress-circular
            indeterminate
            size="16"
            width="2"
            color="primary"
            class="mr-2"
          />
          Saving...
        </template>
        <template v-else>
          <v-icon
            v-if="!saveError"
            icon="mdi-check"
            size="small"
            class="mr-2"
          />
          {{ statusText }}
        </template>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  projectName?: string
  isSaving: boolean
  lastSavedAt: Date | null
  saveError: string | null
}>()

const statusText = computed(() => {
  if (props.saveError) return `Error: ${props.saveError}`
  if (props.isSaving) return 'Saving...'
  if (props.lastSavedAt) return `Saved ${formatLastSaved(props.lastSavedAt)}`
  return 'All changes saved'
})

const statusColor = computed(() => {
  if (props.saveError) return 'error'
  if (props.isSaving) return 'grey-lighten-1'
  return 'success-lighten-1'
})

const formatLastSaved = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 1000) return 'just now'
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return date.toLocaleTimeString()
}
</script>

<style scoped>
.project-detail-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.save-status-btn {
  min-width: 120px;
  text-transform: none;
}

.project-name {
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
