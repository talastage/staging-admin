<!-- components/NotifyMeButton.vue -->
<template>
  <v-btn
    :loading="loading"
    :color="isNotified ? 'primary' : 'grey-darken-2'"
    :text-color="isNotified ? 'white' : 'black'"
    variant="flat"
    :size="compact ? 'x-small' : 'small'"
    class="notify-me-button"
    :class="{ 
      'notify-me-button--compact': compact,
      'notify-me-button--pending': isPending
    }"
    @click="handleClick"
  >
    <v-icon
      :icon="isNotified ? 'mdi-bell' : 'mdi-bell-outline'"
      :class="!compact && 'mr-2'"
      :size="compact ? 'small' : 'small'"
      :color="isNotified ? 'white' : 'black'"
    />
    <span v-if="!compact" class="text-subtitle-2">
      {{ buttonText }}
    </span>
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface NotifyMeButtonProps {
  isNotified: boolean
  loading?: boolean
  compact?: boolean
  isPending?: boolean
  itemId?: string
}

interface NotifyMeButtonEmits {
  (e: 'toggle', event: MouseEvent): void
  (e: 'update:isNotified', value: boolean): void
}

const props = withDefaults(defineProps<NotifyMeButtonProps>(), {
  loading: false,
  compact: false,
  isPending: false,
  itemId: ''
})

const emit = defineEmits<NotifyMeButtonEmits>()

const buttonText = computed<string>(() => {
  if (props.isPending) {
    return props.isNotified ? 'Saving...' : 'Saving...'
  }
  return props.isNotified ? 'Notification On' : 'Notify me'
})

const handleClick = (event: MouseEvent): void => {
  event.stopPropagation() // Prevent card click event
  
  // Emit both events - toggle for backward compatibility and update:isNotified for v-model support
  emit('toggle', event)
  
  // Emit the opposite of current state for optimistic updates
  emit('update:isNotified', !props.isNotified)
}
</script>

<style scoped>
.notify-me-button {
  text-transform: none;
  letter-spacing: normal;
  border-radius: 4px;
  height: 40px;
}

.notify-me-button:not(.notify-me-button--compact) {
  min-width: 120px;
}

.notify-me-button--compact {
  min-width: 36px;
  width: 36px;
  height: 36px;
  padding: 0;
}

/* Style for pending state - subtle pulsing effect */
.notify-me-button--pending {
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}

:deep(.v-btn__content) {
  font-size: 0.875rem;
  line-height: 1.2;
  font-weight: 400;
}

/* Add slight shadow for depth */
.notify-me-button.v-btn--variant-flat {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Override hover effect */
.notify-me-button:hover {
  opacity: 0.9;
}

/* Make the bell icon slightly larger in compact mode */
.notify-me-button--compact :deep(.v-icon) {
  font-size: 1.25rem;
}

/* Mobile responsive styles */
@media (max-width: 600px) {
  .notify-me-button {
    height: 36px;
  }

  .notify-me-button:not(.notify-me-button--compact) {
    min-width: 100px;
  }

  :deep(.v-btn__content) {
    font-size: 0.8125rem;
  }
}

/* Extra small mobile styles */
@media (max-width: 400px) {
  .notify-me-button {
    height: 32px;
  }

  .notify-me-button:not(.notify-me-button--compact) {
    min-width: 90px;
  }

  :deep(.v-btn__content) {
    font-size: 0.75rem;
  }

  .notify-me-button--compact {
    min-width: 32px;
    width: 32px;
    height: 32px;
  }
}
</style>