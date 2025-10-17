<!-- PremiereStatusBar.vue -->
<template>
  <div class="premiere-bar">
    <div class="premiere-text">
      <div class="countdown">
        <strong>Premieres in</strong>
      </div>
      <div class="countdown-display">
        <CountdownDateTimer
          :target-date="props.project.premiering?.localized"
          :short-format="true"
          @finished="handleCountdownFinished"
        />
      </div>
      <div class="premiere-date">
        {{ localPremiereDateTimeFormatted }}
      </div>
    </div>

    <NotifyMeButton
      v-if="showNotifyButton && !isNotified"
      :is-notified="isNotified"
      :loading="isLoading"
      @toggle="onToggleNotify"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDateFormatter } from '@/composables/useDateFormatter'
import { useUpcomingPremiereNotificationStore } from '@/stores/useUpcomingPremiereNotificationStore'
import type { WatchProject } from '@/types/watch'

const props = defineProps<{ project: WatchProject }>()
const emit = defineEmits(['countdownFinished'])

// Use the date formatter for the local date display
const { formatLocalDateTime } = useDateFormatter()

// Notification store/composable
const upcomingStore = useUpcomingPremiereNotificationStore()
const { $protectedAction } = useNuxtApp()

const isNotified = computed(() => upcomingStore.isNotified(props.project.id))
const isLoading = computed(() => upcomingStore.isLoading(props.project.id))

const showNotifyButton = computed(() => {
  return Boolean(
    props.project?.premiering?.is_future &&
      props.project?.status === 'published' &&
      props.project?.payment_status === 'completed'
  )
})

const localPremiereDateTimeFormatted = computed(() => {
  if (!props.project?.premiering?.localized) return ''
  return formatLocalDateTime(props.project.premiering.localized)
})

// Method to toggle notifications
const onToggleNotify = async () => {
  await $protectedAction(
    async () => {
      await upcomingStore.toggleNotification(props.project)
    },
    {
      onError: (error) => {
        console.error('Failed to toggle notification:', error)
      },
      requiresAuth: true,
    }
  )
}

// Handle countdown finished event
const handleCountdownFinished = () => {
  emit('countdownFinished')
}
</script>

<style scoped>
.premiere-bar {
  position: absolute;
  /* Move to top-right corner */
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.premiere-text {
  display: flex;
  flex-direction: column;
  margin-right: 12px; /* Spacing from the Notify button */
}

.countdown {
  font-size: 1rem;
  color: white;
}

.countdown-display {
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  margin: 4px 0;
}

.premiere-date {
  font-size: 0.875rem;
  opacity: 0.9;
}
</style>
