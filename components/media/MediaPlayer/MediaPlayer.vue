<template>
  <div
    class="video-player-container"
    @mousemove="handleMouseMove"
    @mouseleave="hideControls = isPlaying"
  >
    <div ref="videoWrapper" class="video-wrapper">
      <video
        ref="videoElement"
        class="video-element"
        :poster="project?.thumbnail_url"
        @timeupdate="handleTimeUpdate"
        @loadedmetadata="handleLoadedMetadata"
        @click="togglePlay"
        @dblclick="handleFullscreenChange"
        @waiting="isBuffering = true"
        @playing="isBuffering = false"
        @requestfullscreen="handleFullscreenChange"
      />

      <!-- PREMIERE STATUS BAR (Top-right corner) -->
      <UpcomingPremiereNotifyMeCard
        v-if="project?.premiering?.is_future && project?.status === 'published'"
        :premiereDate="project?.premiering?.localized"
        :showNotifyButton="project?.payment_status === 'completed'"
        :isNotified="upcomingStore.isNotified(project?.id)"
        :notifyLoading="upcomingStore.isLoading(project?.id)"
        position="top-right"
        :useCountdown="false"
        @notifyToggle="handleNotificationToggle"
        class="media-player-premiere-notification"
      />

      <MediaControls
        :is-playing="isPlaying"
        :current-time="currentTime"
        :duration="duration"
        :is-fullscreen="isFullscreen"
        :hide-controls="hideControls"
        @play-pause="togglePlay"
        @fullscreen="handleFullscreenChange"
        @seek="handleSeek"
      >
        <template #progress>
          <ProgressBar
            :current-time="currentTime"
            :duration="duration"
            :buffered="bufferedProgress"
            @seek="handleSeek"
          />
        </template>

        <template #controls-right>
          <QualitySelector
            :qualities="availableQualities"
            :current="currentQuality"
            @change="handleQualityChange"
          />
          <VolumeControl
            :volume="volume"
            :is-muted="isMuted"
            @update:volume="handleVolumeChange"
            @toggle-mute="toggleMute"
          />
        </template>
      </MediaControls>

      <div v-if="isBuffering" class="loading-spinner">
        <div class="spinner"></div>
      </div>

      <div v-if="hlsError" class="error-message">
        {{ hlsError }}
      </div>

      <!-- Keyboard shortcuts overlay -->
      <div
        v-if="showKeyboardShortcuts"
        class="keyboard-shortcuts-overlay"
        @click="showKeyboardShortcuts = false"
      >
        <div class="keyboard-shortcuts-panel" @click.stop>
          <div class="shortcuts-header">
            <h3>Keyboard Shortcuts</h3>
            <button class="close-button" @click="showKeyboardShortcuts = false">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="currentColor"
                  d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                />
              </svg>
            </button>
          </div>
          <div class="shortcuts-content">
            <div class="shortcuts-column">
              <div class="shortcut-item">
                <span class="key">Space</span> or <span class="key">K</span>
                <span class="description">Play/Pause</span>
              </div>
              <div class="shortcut-item">
                <span class="key">M</span>
                <span class="description">Mute/Unmute</span>
              </div>
              <div class="shortcut-item">
                <span class="key">F</span>
                <span class="description">Fullscreen</span>
              </div>
              <div class="shortcut-item">
                <span class="key">↑</span>
                <span class="description">Volume Up</span>
              </div>
              <div class="shortcut-item">
                <span class="key">↓</span>
                <span class="description">Volume Down</span>
              </div>
            </div>
            <div class="shortcuts-column">
              <div class="shortcut-item">
                <span class="key">←</span> or <span class="key">J</span>
                <span class="description">Rewind 10s</span>
              </div>
              <div class="shortcut-item">
                <span class="key">→</span> or <span class="key">L</span>
                <span class="description">Forward 10s</span>
              </div>
              <div class="shortcut-item">
                <span class="key">0-9</span>
                <span class="description">Jump to position</span>
              </div>
              <div class="shortcut-item">
                <span class="key">?</span>
                <span class="description">Show this help</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, defineProps, defineEmits } from 'vue'
import { useHlsStream } from '~/composables/media/useHlsStream'
import { useFullscreen } from '~/composables/media/useFullscreen'
import { useKeyboardControls } from '~/composables/media/useKeyboardControls'
import { useUpcomingPremiereNotificationStore } from '@/stores/useUpcomingPremiereNotificationStore'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  setCurrentTime: {
    type: Function,
    default: () => {},
  },
  setDuration: {
    type: Function,
    default: () => {},
  },
})

const emit = defineEmits(['timeupdate', 'qualitychange', 'fullscreenchange', 'video-ended', 'trailer-end'])

// Refs
const videoElement = ref<HTMLVideoElement | null>(null)
const videoWrapper = ref<HTMLElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const isBuffering = ref(false)
const hideControls = ref(false)
const controlsTimeout = ref<number | null>(null)
const showKeyboardShortcuts = ref(false)

// Composables
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(videoWrapper)
const {
  availableQualities,
  currentQuality,
  error: hlsError,
  initialize: initHls,
  changeQuality,
} = useHlsStream(videoElement, props.project?.video_url)
useKeyboardControls(
  videoElement,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted
)

// Computed
const progress = computed(() => (currentTime.value / duration.value) * 100 || 0)
const bufferedProgress = computed(() => {
  if (!videoElement.value) return 0
  const buffered = videoElement.value.buffered
  return buffered.length
    ? (buffered.end(buffered.length - 1) / duration.value) * 100
    : 0
})

const upcomingStore = useUpcomingPremiereNotificationStore()
const { $protectedAction } = useNuxtApp()

/**
 * Handle toggling the "Notify me" state.
 * Ensures user is authenticated (via $protectedAction) before sending the POST.
 */
const handleNotificationToggle = async () => {
  // Guard: if project is missing or invalid, do nothing
  if (!props.project?.id || !props.project?.access_uuid) return

  await $protectedAction(
    async () => {
      try {
        await upcomingStore.toggleNotification(props.project)
      } catch (error) {
        console.error('Failed to toggle notification:', error)
      }
    },
    { requiresAuth: true }
  )
}

// Methods
const togglePlay = () => {
  if (!videoElement.value) return
  isPlaying.value = !isPlaying.value
  isPlaying.value ? videoElement.value.play() : videoElement.value.pause()
}

const handleTimeUpdate = () => {
  if (!videoElement.value) return
  currentTime.value = videoElement.value.currentTime
  props.setCurrentTime(currentTime.value)
  emit('timeupdate', currentTime.value)
}

const handleLoadedMetadata = () => {
  if (!videoElement.value) return
  duration.value = videoElement.value.duration
  props.setDuration(duration.value)
  emit('timeupdate', 0)
}

const handleVolumeChange = (newVolume: number) => {
  if (!videoElement.value) return
  volume.value = newVolume
  videoElement.value.volume = newVolume
  isMuted.value = newVolume === 0
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
  if (videoElement.value) {
    if (isMuted.value) {
      videoElement.value.volume = 0
    } else {
      videoElement.value.volume = volume.value > 0 ? volume.value : 0.5
      if (volume.value === 0) volume.value = 0.5
    }
  }
}

const handleQualityChange = (quality: string) => {
  changeQuality(quality)
  emit('qualitychange', quality)
}

const handleSeek = (time: number) => {
  if (videoElement.value) {
    videoElement.value.currentTime = time
  }
}

const handleFullscreenChange = () => {
  toggleFullscreen()
  emit('fullscreenchange', !isFullscreen.value)
}

const handleMouseMove = () => {
  hideControls.value = false

  // Clear any existing timeout
  if (controlsTimeout.value) {
    window.clearTimeout(controlsTimeout.value)
  }

  // Set a new timeout to hide controls after 3 seconds of inactivity
  if (isPlaying.value) {
    controlsTimeout.value = window.setTimeout(() => {
      hideControls.value = true
    }, 3000)
  }
}

// Handle keyboard shortcut for help overlay
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
    event.preventDefault()
    showKeyboardShortcuts.value = !showKeyboardShortcuts.value
  }
}

// Lifecycle
onMounted(() => {
  initHls()
  if (videoElement.value) {
    videoElement.value.volume = volume.value
    videoElement.value.onwaiting = () => (isBuffering.value = true)
    videoElement.value.onplaying = () => (isBuffering.value = false)
    videoElement.value.onended = () => {
      isPlaying.value = false
      emit('video-ended')
    }
  }

  document.addEventListener('keydown', handleKeyDown)
})

watch(
  () => props.project?.video_url,
  (newUrl) => {
    if (newUrl) initHls()
  }
)

watch(isFullscreen, (newVal) => {
  emit('fullscreenchange', newVal)
})

// Expose method for external calls (e.g., start trailer)
defineExpose({
  startTrailer: () => {
    if (videoElement.value) {
      videoElement.value.currentTime = 0
      videoElement.value.play()
      isPlaying.value = true
    }
  },
})
</script>

<style scoped>
.video-player-container {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.video-wrapper {
  position: relative;
  padding-top: 56.25%;
}

.video-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-align: center;
  z-index: 10;
  max-width: 80%;
}

.media-player-premiere-notification {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  width: auto;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.keyboard-shortcuts-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.keyboard-shortcuts-panel {
  background: rgba(28, 28, 28, 0.95);
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.shortcuts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.shortcuts-header h3 {
  margin: 0;
  color: white;
  font-size: 18px;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcuts-content {
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.shortcuts-column {
  flex: 1;
  min-width: 200px;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: white;
}

.key {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
  margin-right: 4px;
}

.description {
  color: rgba(255, 255, 255, 0.8);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

:fullscreen .video-wrapper {
  padding-top: 0;
  height: 100vh;
}

@media (max-width: 768px) {
  .video-player-container {
    border-radius: 0;
  }

  .shortcuts-content {
    flex-direction: column;
  }
}
</style>
