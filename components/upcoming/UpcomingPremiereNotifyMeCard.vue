<template>
  <div
    class="upcoming-premiere-overlay"
    :class="{
      'position-bottom': position === 'bottom',
      'position-top-right': position === 'top-right',
    }"
  >
    <div class="upcoming-premiere-overlay__content">
      <!-- Use either countdown timer or premiere time display -->
      <template v-if="useCountdown">
        <div class="premiere-text">
          <div class="countdown">
            <strong>Premieres in</strong>
          </div>
          <div class="countdown-display">
            <CountdownDateTimer
              :target-date="premiereDate"
              :short-format="true"
              @finished="$emit('countdownFinished')"
            />
          </div>
          <div v-if="showLocalDate" class="premiere-date">
            {{ formattedPremiereDate }}
          </div>
        </div>
      </template>
      <template v-else>
        <UpcomingPremiereTimeDisplay
          :premiereDate="premiereDate"
          class="upcoming-premiere-overlay__time-badge"
        />
      </template>

      <NotifyMeButton
        v-if="showNotifyButton"
        v-model:isNotified="localNotificationState"
        :is-pending="isPending"
        :compact="position === 'bottom'"
        class="upcoming-premiere-overlay__notify-button"
        @toggle="onNotifyToggle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDateFormatter } from '@/composables/useDateFormatter'
import { useNotificationState } from '@/composables/useNotificationState'

interface UpcomingPremiereOverlayProps {
  premiereDate: string
  showNotifyButton?: boolean
  isNotified?: boolean
  notifyLoading?: boolean
  position?: 'bottom' | 'top-right'
  useCountdown?: boolean // Renamed from showCountdown to useCountdown for clarity
  showLocalDate?: boolean
  premiereId?: string
}

interface UpcomingPremiereOverlayEmits {
  (e: 'notifyToggle', event: MouseEvent): void
  (e: 'countdownFinished'): void
  (e: 'update:isNotified', value: boolean): void
}

const props = withDefaults(defineProps<UpcomingPremiereOverlayProps>(), {
  showNotifyButton: false,
  isNotified: false,
  notifyLoading: false,
  position: 'bottom',
  useCountdown: false,
  showLocalDate: false,
  premiereId: ''
})

const emit = defineEmits<UpcomingPremiereOverlayEmits>()

// Use the date formatter for the local date display
const { formatLocalDateTime } = useDateFormatter()

// Use the notification state composable
const { isUpdatePending, toggleNotification } = useNotificationState()

// Local state for optimistic updates
const localNotificationState = ref(props.isNotified)

// Track pending state
const isPending = computed(() => {
  return props.premiereId ? isUpdatePending(props.premiereId) : false
})

// Watch for prop changes to update local state
watch(() => props.isNotified, (newValue) => {
  localNotificationState.value = newValue
})

// Watch for local state changes to emit updates
watch(localNotificationState, (newValue) => {
  emit('update:isNotified', newValue)
})

const formattedPremiereDate = computed(() => {
  if (!props.premiereDate) return ''
  return formatLocalDateTime(props.premiereDate)
})

const onNotifyToggle = async (event: MouseEvent) => {
  // Emit the original event for backward compatibility
  emit('notifyToggle', event)
  
  // If we have a premiereId, handle optimistic updates
  if (props.premiereId) {
    // The local state is already updated via v-model
    // Now we need to handle the background save
    const saveCallback = async (newState: boolean) => {
      // This would be replaced with your actual API call
      // For example: await notificationService.updateNotification(props.premiereId, newState)
      
      // Simulate API call for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Emit the final state after successful save
      emit('update:isNotified', newState)
    }
    
    // Toggle notification with optimistic update
    await toggleNotification(props.premiereId, localNotificationState.value, saveCallback)
  }
}
</script>

<style lang="scss" scoped>
.upcoming-premiere-overlay {
  position: absolute;
  z-index: 2;

  // Default styles for bottom position
  &.position-bottom {
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.85);
    padding: 8px 12px;
  }

  // Styles for top-right position
  &.position-top-right {
    top: 16px;
    right: 16px;
    background: rgba(0, 0, 0, 0.7);
    padding: 8px 16px;
    border-radius: 4px;
    backdrop-filter: blur(5px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    width: auto; /* Ensure it doesn't take full width in MediaPlayer */
  }

  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__time-badge {
    color: #fff;
    flex: 1;
  }

  &__notify-button {
    margin-left: 8px;
  }

  // Responsive adjustments
  @media (max-width: 600px) {
    &.position-bottom {
      padding: 6px 10px;
    }

    &.position-top-right {
      padding: 6px 10px;
    }
  }
}

// Styles for countdown display
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
  color: white;
}
</style>