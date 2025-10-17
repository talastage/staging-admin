<template>
  <div
    ref="wrapperRef"
    class="video-preview-wrapper"
    :style="{ width: containerWidth, height: containerHeight }"
    tabindex="0"
    @mouseenter="controlsVisible = true"
    @mouseleave="controlsVisible = false"
    @keydown="handleKeydown"
  >
    <div class="video-container">
      <video
        ref="videoRef"
        class="video-element"
        :class="{ 'is-playing': playerState === 'playing' }"
        preload="metadata"
        loop
        playsinline
        crossorigin="anonymous"
        @loadedmetadata="onMetadataLoaded"
        @playing="onPlaying"
        @pause="onPause"
        @waiting="onBuffering"
        @timeupdate="updateProgress"
        @error="onVideoError"
        @click="handleVideoClick"
      />

      <v-fade-transition>
        <div v-show="playerState !== 'playing'" class="overlay-container">
          <v-img
            :src="thumbnailUrl || defaultThumbnailUrl"
            :lazy-src="defaultThumbnailUrl"
            class="thumbnail-image"
            aspect-ratio="16/9"
            cover
          >
            <template #placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular indeterminate color="grey-lighten-4" />
              </div>
            </template>
          </v-img>

          <div v-if="playerState === 'no_url'" class="overlay-content">
            <v-icon size="48" color="grey-lighten-2">mdi-video-off</v-icon>
            <p class="text-caption mt-2 text-grey-lighten-1">
              Video is processing...
            </p>
          </div>

          <div v-if="playerState === 'loading'" class="overlay-content">
            <v-progress-circular indeterminate color="white" size="48" />
          </div>

          <div
            v-if="playerState === 'error'"
            class="overlay-content error-state"
          >
            <v-icon size="48" color="error">mdi-alert-circle-outline</v-icon>
            <p class="text-caption mt-2">Could not load video.</p>
          </div>

          <div
            v-if="playerState === 'idle' || playerState === 'paused'"
            class="play-button-overlay"
            @click.stop="play"
          >
            <v-btn
              icon="mdi-play-circle"
              color="white"
              size="x-large"
              variant="text"
              :ripple="false"
            />
          </div>
        </div>
      </v-fade-transition>

      <v-fade-transition>
        <div
          v-show="
            (controlsVisible || playerState === 'paused') &&
            playerState !== 'no_url' &&
            playerState !== 'loading' &&
            playerState !== 'error'
          "
          class="controls-bar"
        >
          <v-btn
            icon
            size="small"
            variant="text"
            color="white"
            @click.stop="togglePlayPause"
          >
            <v-icon>{{
              playerState === 'playing' ? 'mdi-pause' : 'mdi-play'
            }}</v-icon>
          </v-btn>

          <v-btn
            icon
            size="small"
            variant="text"
            color="white"
            @click.stop="toggleMute"
          >
            <v-icon>{{
              isMuted ? 'mdi-volume-off' : 'mdi-volume-high'
            }}</v-icon>
          </v-btn>

          <span class="time-display text-white text-caption mx-2">
            {{ formattedCurrentTime }} / {{ formattedDuration }}
          </span>

          <v-slider
            v-model="progress"
            class="mx-2"
            color="red"
            track-color="grey-darken-1"
            thumb-color="red"
            density="compact"
            :max="100"
            :step="0.1"
            hide-details
            @update:model-value="handleSeek"
            @click.stop
          />

          <v-btn
            icon
            size="small"
            variant="text"
            color="white"
            @click.stop="toggleFullscreen"
          >
            <v-icon>{{
              isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'
            }}</v-icon>
          </v-btn>
        </div>
      </v-fade-transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Hls from 'hls.js'

// --- PROPS & EMITS ---
const props = withDefaults(
  defineProps<{
    videoId: string
    videoUrl?: string | null
    thumbnailUrl?: string | null
    width?: string | number
    height?: string | number
  }>(),
  {
    videoUrl: null,
    thumbnailUrl: null,
    width: '100%',
    height: '200px',
  }
)

const emit = defineEmits<{
  (e: 'play', videoId: string): void
  (e: 'pause', videoId: string): void
  (e: 'error', videoId: string): void
}>()

// --- REFS ---
type PlayerState =
  | 'no_url'
  | 'loading'
  | 'idle'
  | 'playing'
  | 'paused'
  | 'error'
const playerState = ref<PlayerState>('loading')
const videoDuration = ref(0)
const currentTime = ref(0)
const progress = ref(0)
const videoRef = ref<HTMLVideoElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const hlsInstance = ref<Hls | null>(null)
const controlsVisible = ref(false)
const isMuted = ref(true) // Start muted by default
const isFullscreen = ref(false)

// --- COMPUTED PROPERTIES ---
const defaultThumbnailUrl = '/images/default-thumbnail.jpg'

const containerWidth = computed(() =>
  typeof props.width === 'number' ? `${props.width}px` : props.width
)
const containerHeight = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height
)

const formatTime = (totalSeconds: number) => {
  const seconds = Math.floor(totalSeconds % 60)
  const minutes = Math.floor(totalSeconds / 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const formattedDuration = computed(() => formatTime(videoDuration.value))
const formattedCurrentTime = computed(() => formatTime(currentTime.value))

// --- CORE METHODS ---
const initializePlayer = (url: string) => {
  cleanup()
  if (!videoRef.value) return

  playerState.value = 'loading'
  videoRef.value.muted = isMuted.value

  if (url.includes('.m3u8')) {
    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        nudgeOffset: 0.1,
        nudgeMaxRetry: 3,
        maxFragLookUpTolerance: 0.25,
        maxStarvationDelay: 4,
        maxLoadingDelay: 4,
        // CORS settings for CloudFront
        xhrSetup: (xhr: XMLHttpRequest) => {
          xhr.withCredentials = false
        },
        fetchSetup: (context: any, initParams: any) => {
          return new Request(context.url, {
            ...initParams,
            mode: 'cors',
            credentials: 'omit'
          })
        }
      })
      
      hlsInstance.value = hls
      
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('HLS media attached')
      })
      
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('HLS manifest parsed, found', data.levels.length, 'quality levels')
      })
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data)
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Fatal network error, trying to recover')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Fatal media error, trying to recover')
              hls.recoverMediaError()
              break
            default:
              console.error('Fatal error, cannot recover')
              onVideoError(data)
              break
          }
        }
      })
      
      hls.loadSource(url)
      hls.attachMedia(videoRef.value)
    } else if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      videoRef.value.src = url
    } else {
      console.error('HLS not supported')
      onVideoError('HLS not supported')
    }
  } else {
    videoRef.value.src = url
  }
}

const play = () => {
  if (
    !videoRef.value ||
    playerState.value === 'no_url' ||
    playerState.value === 'error'
  )
    return

  videoRef.value.play().catch(onVideoError)
  emit('play', props.videoId)
}

const pause = () => {
  videoRef.value?.pause()
}

const togglePlayPause = () => {
  if (playerState.value === 'playing') {
    pause()
  } else {
    play()
  }
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
  if (videoRef.value) {
    videoRef.value.muted = isMuted.value
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    wrapperRef.value?.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const cleanup = () => {
  if (hlsInstance.value) {
    hlsInstance.value.destroy()
    hlsInstance.value = null
  }
  if (videoRef.value) {
    videoRef.value.removeAttribute('src')
    videoRef.value.load()
  }
  videoDuration.value = 0
  currentTime.value = 0
  progress.value = 0
}

// --- EVENT HANDLERS ---
const onMetadataLoaded = () => {
  if (!videoRef.value) return
  videoDuration.value = videoRef.value.duration
  playerState.value = 'idle'
}

const onPlaying = () => {
  playerState.value = 'playing'
}

const onPause = () => {
  if (playerState.value === 'playing') {
    playerState.value = 'paused'
    emit('pause', props.videoId)
  }
}

const onBuffering = () => {
  // Can be used to show a buffering indicator if needed
}

const updateProgress = () => {
  if (!videoRef.value || videoDuration.value === 0) return
  currentTime.value = videoRef.value.currentTime
  progress.value = (currentTime.value / videoDuration.value) * 100
}

const handleSeek = (newProgress: number) => {
  if (!videoRef.value || videoDuration.value === 0) return
  videoRef.value.currentTime = (newProgress / 100) * videoDuration.value
}

const handleVideoClick = () => {
  togglePlayPause()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.videoUrl) return
  if (event.target instanceof HTMLInputElement) return

  switch (event.code) {
    case 'Space':
      event.preventDefault()
      togglePlayPause()
      break
    case 'KeyM':
      event.preventDefault()
      toggleMute()
      break
    case 'KeyF':
      event.preventDefault()
      toggleFullscreen()
      break
  }
}

const onVideoError = (error?: any) => {
  console.error('Video error:', error)
  playerState.value = 'error'
  emit('error', props.videoId)
}

// --- WATCHERS ---
watch(
  () => props.videoUrl,
  (newUrl) => {
    if (!newUrl) {
      playerState.value = 'no_url'
      cleanup()
    } else {
      initializePlayer(newUrl)
    }
  },
  { immediate: true }
)

// Fullscreen event listeners
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// --- LIFECYCLE ---
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  
  if (props.videoUrl) {
    initializePlayer(props.videoUrl)
  } else {
    playerState.value = 'no_url'
  }
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  cleanup()
})

// Expose controls to the parent component
defineExpose({ play, pause })
</script>

<style scoped>
.video-preview-wrapper {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  outline: none;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.thumbnail-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.overlay-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  z-index: 2;
}

.error-state {
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 8px;
}

.play-button-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  cursor: pointer;
}

.controls-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 12px 16px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-display {
  font-size: 12px;
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .controls-bar {
    padding: 8px 12px 12px;
    gap: 4px;
  }
  
  .time-display {
    font-size: 11px;
  }
}
</style>