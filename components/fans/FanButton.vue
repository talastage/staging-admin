<template>
  <v-btn
    :color="isFanning ? 'primary' : 'surface-variant'"
    :variant="isFanning ? 'flat' : 'outlined'"
    @click="toggleFanStatus"
    rounded="pill"
    :class="{
      'fan-btn': true,
      'fan-btn--active': isFanning,
      [`fan-btn--${size}`]: true,
    }"
    :min-width="size === 'small' ? 80 : size === 'large' ? 120 : 100"
    :disabled="disabled"
    elevation="2"
  >
    <!-- Icon with smooth transition -->
    <v-icon
      :class="['fan-icon', { 'fan-icon--active': isFanning }]"
      size="small"
      start
    >
      {{ isFanning ? 'mdi-heart' : 'mdi-heart-outline' }}
    </v-icon>

    <!-- Text content -->
    <span class="fan-text">
      {{ isFanning ? 'Following' : 'Follow' }}
    </span>

    <!-- Loading overlay -->
    <v-overlay
      v-if="isOptimisticLoading"
      contained
      class="loading-overlay"
      opacity="0.3"
    >
      <v-progress-circular indeterminate size="16" width="2" color="primary" />
    </v-overlay>
  </v-btn>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useUserFansStore } from '@/stores/useUserFansStore'
import { useNuxtApp } from '#app'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['fanningUpdated'])
const nuxtApp = useNuxtApp()
const userFansStore = useUserFansStore()

const isFanning = ref(false)
const isOptimisticLoading = ref(false)

// Load fan status
const loadFanStatus = async () => {
  if (!props.username) return

  try {
    const status = await userFansStore.getFanStatus(props.username)
    isFanning.value = status.is_fanning
  } catch (error) {
    console.error('Error loading fan status:', error)
  }
}

// Optimistic toggle with background API call
const toggleFanStatus = async () => {
  if (isOptimisticLoading.value || props.disabled) return

  // Store current state for potential rollback
  const previousFanningState = isFanning.value

  // Optimistically update UI immediately
  isFanning.value = !isFanning.value

  // Show subtle loading indicator
  isOptimisticLoading.value = true

  // Emit optimistic update
  emit('fanningUpdated', isFanning.value)

  try {
    await nuxtApp.$protectedAction(
      async () => {
        const result = await userFansStore.toggleFan(props.username)

        if (result.success) {
          // Update with actual server response
          isFanning.value = result.is_fanning
          emit('fanningUpdated', result.is_fanning)
          return result
        } else {
          throw new Error(result.message || 'Failed to update fan status')
        }
      },
      {
        onSuccess: () => {
          console.log(
            `User ${isFanning.value ? 'fanned' : 'unfanned'} successfully`
          )
        },
        onError: (error) => {
          // Rollback optimistic update on error
          isFanning.value = previousFanningState
          emit('fanningUpdated', previousFanningState)

          console.error('Error updating fan status:', error)

          // Show user-friendly error notification
          nuxtApp.$toast?.error(
            'Failed to update fan status. Please try again.'
          )
        },
        requiresAuth: true,
      }
    )
  } catch (error) {
    // Additional error handling if $protectedAction fails
    isFanning.value = previousFanningState
    emit('fanningUpdated', previousFanningState)
    console.error('Unexpected error:', error)
  } finally {
    isOptimisticLoading.value = false
  }
}

// Watch for username changes
watch(() => props.username, loadFanStatus)

// Load fan status on mount
onMounted(loadFanStatus)
</script>

<style lang="scss" scoped>
.fan-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.025em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(var(--v-theme-surface-variant), 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    transition: transform 0.1s ease;
  }

  &--small {
    font-size: 0.75rem;
    padding: 0 14px;
    height: 34px !important;
    min-height: 34px !important;
  }

  &--medium {
    padding: 0 18px;
    height: 38px !important;
    min-height: 38px !important;
    font-size: 0.875rem;
  }

  &--large {
    padding: 0 22px;
    font-size: 0.9rem;
    height: 42px !important;
    min-height: 42px !important;
  }

  &--active {
    background: rgba(var(--v-theme-primary), 0.95) !important;
    color: white !important;
    border-color: rgba(var(--v-theme-primary), 0.8);
    box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.3),
      0 1px 3px rgba(var(--v-theme-primary), 0.2);

    &:hover {
      background: rgba(var(--v-theme-error), 0.9) !important;
      border-color: rgba(var(--v-theme-error), 0.8);
      box-shadow: 0 4px 12px rgba(var(--v-theme-error), 0.3),
        0 2px 6px rgba(var(--v-theme-error), 0.2);
    }

    .fan-text {
      color: white;
    }
  }
}

.fan-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-right: 4px;

  &--active {
    color: inherit;
    transform: scale(1.1);
  }
}

.fan-text {
  font-weight: inherit;
  transition: color 0.3s ease;
}

.loading-overlay {
  border-radius: inherit;

  .v-progress-circular {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

/* Dark theme adjustments */
.v-theme--dark .fan-btn {
  background: rgba(0, 0, 0, 0.6) !important;
  border-color: rgba(255, 255, 255, 0.2);

  &--active {
    background: rgba(var(--v-theme-primary), 0.9) !important;
  }
}

/* Mobile responsive adjustments */
@media (max-width: 600px) {
  .fan-btn {
    &--medium,
    &--large {
      padding: 0 16px;
      font-size: 0.8rem;
      height: 36px !important;
      min-height: 36px !important;
    }

    &--small {
      padding: 0 12px;
      font-size: 0.7rem;
      height: 32px !important;
      min-height: 32px !important;
    }
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .fan-btn {
    border-width: 2px;

    &--active {
      border-width: 2px;
    }
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .fan-btn,
  .fan-icon {
    transition: none;
  }

  .fan-btn:hover {
    transform: none;
  }
}
</style>
