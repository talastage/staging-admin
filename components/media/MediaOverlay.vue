<!-- MediaOverlay.vue -->
<template>
  <!-- Normal video overlay -->
  <transition name="overlay-fade" appear>
    <div
      v-if="shouldShowOverlay && !isFullscreen"
      class="video-overlay"
    >
      <div class="overlay-content">
        <div class="overlay-card">
          <template v-if="isFuture">
            <div class="overlay-icon">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
              </svg>
            </div>
            <h2 class="overlay-title">Coming Soon</h2>
            <p class="overlay-subtitle">Premiering on:</p>
            <div class="countdown-container">
              <CountdownDateTimer
                :target-date="premiereDate"
                @finished="handleCountdownFinished"
              />
            </div>
            <p class="overlay-description">
              Watch the trailer while you wait and get notified when this video premieres.
            </p>
            <div class="overlay-actions">
              <NotifyMeButton
                v-if="showNotifyButton && !localNotificationState"
                v-model:isNotified="localNotificationState"
                :is-pending="isPending"
                @toggle="handleNotifyToggle"
                class="action-button primary"
              />
              <button
                @click="emitStartTrailer"
                :disabled="loading"
                class="action-button secondary"
              >
                {{ isTrailerPlaying ? 'Restart Trailer' : 'Watch Trailer' }}
              </button>
            </div>
          </template>
          <template v-else>
            <div class="overlay-actions">
              <div class="watch-fee-display" v-if="project?.watch_fee?.formatted">
                {{ project.watch_fee.formatted }}
              </div>
              <button
                @click="handleWatchFullClick"
                :disabled="loading || isProcessing"
                class="action-button primary"
              >
                {{ isProcessing ? 'Processing Payment...' : watchFeeText }}
              </button>
              <button
                @click="emitStartTrailer"
                :disabled="loading"
                class="action-button secondary"
              >
                Watch Again
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </transition>

  <!-- Fullscreen Modal for iOS compatibility -->
  <Teleport to="body">
    <transition name="overlay-fade" appear>
      <div
        v-if="shouldShowOverlay && isFullscreen"
        class="video-overlay-modal"
        @click.self="handleBackdropClick"
      >
        <div class="overlay-content-modal">
          <div class="overlay-card-modal">
            <template v-if="isFuture">
              <div class="overlay-icon">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
                </svg>
              </div>
              <h2 class="overlay-title">Coming Soon</h2>
              <p class="overlay-subtitle">Premiering on:</p>
              <div class="countdown-container">
                <CountdownDateTimer
                  :target-date="premiereDate"
                  @finished="handleCountdownFinished"
                />
              </div>
              <p class="overlay-description">
                Watch the trailer while you wait and get notified when this video premieres.
              </p>
              <div class="overlay-actions">
                <NotifyMeButton
                  v-if="showNotifyButton && !localNotificationState"
                  v-model:isNotified="localNotificationState"
                  :is-pending="isPending"
                  @toggle="handleNotifyToggle"
                  class="action-button primary"
                />
                <button
                  @click="emitStartTrailer"
                  :disabled="loading"
                  class="action-button secondary"
                >
                  {{ isTrailerPlaying ? 'Restart Trailer' : 'Watch Trailer' }}
                </button>
              </div>
            </template>
            <template v-else>
              <div class="overlay-actions">
                <div class="watch-fee-display" v-if="project?.watch_fee?.formatted">
                  {{ project.watch_fee.formatted }}
                </div>
                <button
                  @click="handleWatchFullClick"
                  :disabled="loading || isProcessing"
                  class="action-button primary"
                >
                  {{ isProcessing ? 'Processing Payment...' : watchFeeText }}
                </button>
                <button
                  @click="emitStartTrailer"
                  :disabled="loading"
                  class="action-button secondary"
                >
                  Watch Again
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNuxtApp, useRouter } from '#app'
import { useToast } from 'vue-toastification'
import { useUpcomingPremiereNotificationStore } from '@/stores/useUpcomingPremiereNotificationStore'
import { useSnackMessageStore } from '@/stores/useSnackMessage'
import { useNotificationState } from '@/composables/useNotificationState'
import { useCurrencyStore } from '~/stores/useCurrencies'
import { storeToRefs } from 'pinia'

interface WatchFee {
  amount: number
  formatted: string
  currency: {
    id: number
    code: string
    symbol: string
  }
}

interface Project {
  id: number
  access_uuid: string
  name: string
  watch_fee?: WatchFee
}

interface Props {
  showOverlay: boolean
  isCreator?: boolean
  videoEnded?: boolean
  isFuture?: boolean
  premiereDate?: string
  premiereTimezone?: string
  projectId?: number
  accessUuid?: string
  isNotified?: boolean
  status?: 'published' | 'draft' | 'pending'
  paymentStatus?: 'pending' | 'completed' | 'failed'
  isTrailerPlaying?: boolean
  project?: Project
}

const props = withDefaults(defineProps<Props>(), {
  showOverlay: false,
  isCreator: false,
  videoEnded: false,
  isFuture: false,
  premiereDate: '',
  premiereTimezone: '',
  projectId: 0,
  accessUuid: '',
  isNotified: false,
  status: 'published',
  paymentStatus: 'completed',
  isTrailerPlaying: false,
})

const emit = defineEmits<{
  (e: 'watchFullVideo'): void
  (e: 'startTrailer'): void
  (e: 'update:showOverlay', value: boolean): void
  (e: 'countdownFinished'): void
}>()

const { $protectedAction, $axios } = useNuxtApp()
const router = useRouter()
const toast = useToast()
const loading = ref<boolean>(false)
const isProcessing = ref<boolean>(false)
const isFullscreen = ref<boolean>(false)

// Currency store
const currencyStore = useCurrencyStore()
const { selectedCurrency } = storeToRefs(currencyStore)

// Fullscreen detection
const detectFullscreen = () => {
  isFullscreen.value = !!(document.fullscreenElement || document.webkitFullscreenElement)
}

// Initialize currency store and fullscreen detection
watch(
  () => props.showOverlay,
  async (newValue) => {
    if (newValue && !selectedCurrency.value) {
      try {
        await currencyStore.fetchCurrencies()
      } catch (error) {
        console.error('Error fetching currency:', error)
      }
    }
    if (newValue) {
      detectFullscreen()
      document.addEventListener('fullscreenchange', detectFullscreen)
      document.addEventListener('webkitfullscreenchange', detectFullscreen)
    } else {
      document.removeEventListener('fullscreenchange', detectFullscreen)
      document.removeEventListener('webkitfullscreenchange', detectFullscreen)
    }
  },
  { immediate: true }
)
const notificationStore = useUpcomingPremiereNotificationStore()
const snackStore = useSnackMessageStore()
const { isUpdatePending, toggleNotification } = useNotificationState()

// Local state for optimistic updates
const localNotificationState = ref(props.isNotified)

// Track pending state
const isPending = computed(() => {
  return props.projectId ? isUpdatePending(String(props.projectId)) : false
})

// Watch for prop changes to update local state
watch(
  () => props.isNotified,
  (newValue) => {
    localNotificationState.value = newValue
  }
)

// Watch for local state changes to sync with store if needed
watch(localNotificationState, (newValue) => {
  if (
    props.projectId &&
    notificationStore.isNotified(props.projectId) !== newValue
  ) {
    // This is to keep the store in sync with our local state
    // The actual API call is handled in handleNotifyToggle
  }
})

const shouldShowOverlay = computed((): boolean => {
  if (props.isFuture) {
    return props.showOverlay && !props.isTrailerPlaying
  }

  // Show overlay when video has ended, regardless of fullscreen state
  return props.showOverlay && props.videoEnded
})

function handleBackdropClick(): void {
  // Only allow closing on backdrop click if not in future state
  if (!props.isFuture && !props.videoEnded) {
    emit('update:showOverlay', false)
  }
}



const showNotifyButton = computed((): boolean => {
  return Boolean(
    props.isFuture &&
      props.status === 'published' &&
      props.paymentStatus === 'completed'
  )
})

const isNotified = computed((): boolean => {
  return props.projectId
    ? notificationStore.isNotified(props.projectId)
    : props.isNotified || false
})

const watchFeeText = computed(() => {
  return 'Watch Full Video'
})

async function handleWatchFullClick(): Promise<void> {
  await $protectedAction(
    async () => {
      await processPayment()
    },
    { requiresAuth: true }
  )
}

async function processPayment(): Promise<void> {
  if (!props.project?.watch_fee || !selectedCurrency.value) {
    toast.error('Payment information not available. Please try again later.')
    return
  }

  try {
    isProcessing.value = true

    const payload = {
      paying_amount: props.project.watch_fee.amount,
      currency_id: selectedCurrency.value.id,
      payment_type: 'project_watching',
      payable_type: 'App\\Models\\Project',
      payable_id: props.project.id,
    }

    const response = await $axios.post('/api/cart/items', payload)

    if (response.data?.success) {
      toast.success(
        response.data.message || 'Watch fee added to cart successfully!'
      )
      router.push('/checkout')
    } else {
      throw new Error(response.data?.message || 'Transaction failed')
    }
  } catch (error) {
    if (error.response?.status === 422) {
      toast.error(error.response.data.message || 'Invalid transaction data')
    } else if (error.response?.status === 403) {
      toast.error('You are not authorized to perform this transaction')
    } else if (error.response?.status === 429) {
      toast.error('Too many attempts. Please try again later')
    } else {
      console.error('Error processing payment:', error)
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to process payment. Please try again.'
      )
    }
  } finally {
    isProcessing.value = false
  }
}

async function handleNotifyToggle(): Promise<void> {
  if (!props.projectId || !props.accessUuid) return

  await $protectedAction(
    async () => {
      try {
        // The local state is already updated via v-model
        // Now we need to handle the background save
        const saveCallback = async (newState: boolean) => {
          await notificationStore.toggleNotification({
            id: props.projectId,
            access_uuid: props.accessUuid,
            status: props.status,
            payment_status: props.paymentStatus,
          })

          snackStore.success(
            newState
              ? 'You will be notified when this premiere starts'
              : 'Notification removed successfully'
          )
        }

        // Toggle notification with optimistic update
        await toggleNotification(
          String(props.projectId),
          localNotificationState.value,
          saveCallback
        )
      } catch (error) {
        snackStore.error('Failed to update notification settings')
        console.error('Notification toggle error:', error)
      }
    },
    { requiresAuth: true }
  )
}

async function emitStartTrailer(): Promise<void> {
  loading.value = true
  try {
    emit('startTrailer')
  } finally {
    loading.value = false
  }
}

function handleCountdownFinished(): void {
  emit('countdownFinished')
}

function handlePreviewEnded(): void {
  // Don't auto-trigger payment dialog, just show overlay
  // User must manually click "Watch Full Video" button
}
</script>

<style scoped lang="scss">
.overlay-fade-enter-active {
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.overlay-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(8px);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.video-overlay-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.95));
  backdrop-filter: blur(8px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  -webkit-backdrop-filter: blur(8px);
}

.overlay-content {
  width: 100%;
  max-width: 480px;
  display: flex;
  justify-content: center;
}

.overlay-content-modal {
  width: 100%;
  max-width: 400px;
  display: flex;
  justify-content: center;
}

.overlay-card {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 40px 32px;
  text-align: center;
  color: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  width: 100%;
}

.overlay-card-modal {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  color: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.overlay-icon {
  margin-bottom: 24px;
  opacity: 0.8;
  
  svg {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
}

.overlay-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.overlay-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 16px;
}

.overlay-description {
  font-size: 16px;
  line-height: 1.5;
  opacity: 0.85;
  margin-bottom: 32px;
}

.countdown-container {
  margin: 24px 0;
}

.overlay-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.watch-fee-display {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.action-button {
  background: none;
  border: 2px solid;
  border-radius: 50px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  position: relative;
  overflow: hidden;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: transparent;
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
  }
  
  &.secondary {
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
    
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }
}

// Mobile optimizations
@media (max-width: 768px) {
  .video-overlay {
    padding: 16px;
  }
  
  .video-overlay-modal {
    padding: 16px;
  }
  
  .overlay-card,
  .overlay-card-modal {
    padding: 24px 20px;
    border-radius: 16px;
  }
  
  .overlay-title {
    font-size: 20px;
  }
  
  .overlay-description {
    font-size: 14px;
    margin-bottom: 24px;
  }
  
  .action-button {
    padding: 12px 24px;
    font-size: 14px;
    min-width: 160px;
  }
  
  .watch-fee-display {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .overlay-card,
  .overlay-card-modal {
    padding: 20px 16px;
    border-radius: 12px;
  }
  
  .overlay-title {
    font-size: 18px;
  }
  
  .overlay-actions {
    gap: 8px;
  }
  
  .action-button {
    padding: 10px 20px;
    font-size: 13px;
    min-width: 140px;
  }
  
  .watch-fee-display {
    font-size: 14px;
  }
}
</style>
