<!-- components/ProjectStatus.vue -->
<template>
  <div class="project-status">
    <v-chip :color="statusColor" :text="statusText" />

    <div v-if="showCountdown" class="mt-2">
      <countdown-timer
        v-if="scheduledDate"
        :target-date="scheduledDate"
        @complete="onCountdownComplete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

const props = defineProps<{
  status: 'draft' | 'scheduled' | 'published'
  scheduledAt?: string
}>()

const scheduledDate = computed(() =>
  props.scheduledAt ? new Date(props.scheduledAt) : null
)

const statusColor = computed(() => {
  switch (props.status) {
    case 'published':
      return 'success'
    case 'scheduled':
      return 'info'
    default:
      return 'grey'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'published':
      return 'Published'
    case 'scheduled':
      return 'Scheduled'
    default:
      return 'Draft'
  }
})

const showCountdown = computed(
  () => props.status === 'scheduled' && scheduledDate.value
)

const onCountdownComplete = () => {
  // Refresh project status
}
</script>
