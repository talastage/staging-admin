<template>
  <div
    class="media-thumbnail"
    :class="sizeClass"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="$emit('click')"
  >
    <div class="thumbnail-wrapper">
      <div class="thumbnail-container">
        <!-- Preview video -->
        <video
          v-show="isPlaying && !hasError"
          ref="previewRef"
          class="preview-video"
          muted
          loop
          playsinline
          crossorigin="anonymous"
          @error="handleVideoError"
          @playing="handlePlaying"
          @waiting="isBuffering = true"
          @timeupdate="handleTimeUpdate"
        ></video>

        <!-- Thumbnail image -->
        <v-img
          v-show="!isPlaying || hasError"
          :src="thumbnailUrl || defaultThumbnailUrl"
          :lazy-src="defaultThumbnailUrl"
          class="thumbnail-image"
          cover
          @error="hasError = true"
        >
          <template #placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular
                indeterminate
                color="grey-lighten-5"
                size="32"
              />
            </div>
          </template>
        </v-img>

        <!-- Loading overlay -->
        <div v-if="isBuffering" class="buffering-overlay">
          <v-progress-circular indeterminate color="white" size="32" />
        </div>

        <!-- Views Badge (bottom-right) -->
        <div
          v-if="showViews && viewsCount !== undefined"
          class="info-badge info-badge--views"
        >
          <v-icon start icon="mdi-eye-outline" size="14" class="mr-1" />
          {{ formatViewCount(viewsCount) }}
        </div>

        <!-- Duration Badge (top-right) -->
        <div
          v-if="showDuration && formattedDuration"
          class="info-badge info-badge--duration"
        >
          {{ formattedDuration }}
        </div>

        <!-- Label if provided -->
        <div v-if="label" class="label-badge" :class="labelClass">
          {{ label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Hls from 'hls.js'
import { useDisplay } from 'vuetify'

// Props
const props = withDefaults(
  defineProps<{
    thumbnailUrl?: string
    videoUrl?: string | null
    label?: string | null
    labelVariant?: 'default' | 'primary' | 'error' | 'warning' | 'success'
    size?:
      | 'xs'
      | 'sm'
      | 'md'
      | 'lg'
      | 'xl'
      | '2xl'
      | '3xl'
      | '4xl'
      | '5xl'
      | number
    viewsCount?: number
    showViews?: boolean
    showDuration?: boolean
  }>(),
  {
    thumbnailUrl: '',
    videoUrl: '',
    label: '',
    labelVariant: 'default',
    size: 'md',
    viewsCount: undefined,
    showViews: false,
    showDuration: true,
  }
)

// Refs and state
const isPlaying = ref(false)
const isBuffering = ref(false)
const hasError = ref(false)
const previewRef = ref<HTMLVideoElement | null>(null)
const hlsInstance = ref<Hls | null>(null)
const retryCount = ref(0)
const maxRetries = 3
const videoDuration = ref(0)
const currentTime = ref(0)
let previewTimeout: number | null = null

// Responsive
const { mobile, smAndDown } = useDisplay()

// Constants
const defaultThumbnailUrl = '/images/default-thumbnail.jpg'
const sizeMap = {
  xs: { width: 160, height: 90 },
  sm: { width: 240, height: 135 },
  md: { width: 320, height: 180 },
  lg: { width: 480, height: 270 },
  xl: { width: 640, height: 360 },
  '2xl': { width: 800, height: 450 },
  '3xl': { width: 960, height: 540 },
  '4xl': { width: 1120, height: 630 },
  '5xl': { width: 1280, height: 720 },
}

// Format views (K, M, etc.)
const formatViewCount = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return count.toString()
}

// Computed
const sizeClass = computed(() =>
  typeof props.size === 'string' ? `size-${props.size}` : ''
)

const labelClass = computed(() => {
  return props.labelVariant !== 'default'
    ? `label-badge--${props.labelVariant}`
    : ''
})

const formattedDuration = computed(() => {
  // Show live progress if user is hovering (playing preview), else total duration
  const timeToFormat = isPlaying.value ? currentTime.value : videoDuration.value
  if (!timeToFormat) return ''

  const totalSeconds = Math.floor(timeToFormat)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Video preview handling
function handleTimeUpdate(event: Event) {
  const video = event.target as HTMLVideoElement
  currentTime.value = video.currentTime
}

function setupHls(url: string, videoEl: HTMLVideoElement) {
  if (!Hls.isSupported()) {
    videoEl.src = url
    return
  }

  if (hlsInstance.value) {
    hlsInstance.value.destroy()
  }

  const hls = new Hls()
  hls.loadSource(url)
  hls.attachMedia(videoEl)
  hls.on(Hls.Events.ERROR, (_event, data) => {
    if (data.fatal) hasError.value = true
  })
  hlsInstance.value = hls
}

function loadVideoDuration() {
  const tempVideo = document.createElement('video')
  tempVideo.style.display = 'none'
  document.body.appendChild(tempVideo)

  tempVideo.onloadedmetadata = () => {
    videoDuration.value = tempVideo.duration
    if (tempVideo.parentNode === document.body) {
      document.body.removeChild(tempVideo)
    }
  }

  tempVideo.onerror = () => {
    if (tempVideo.parentNode === document.body) {
      document.body.removeChild(tempVideo)
    }
  }

  if (props.videoUrl?.endsWith('.m3u8')) {
    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(props.videoUrl)
      hls.attachMedia(tempVideo)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setTimeout(() => {
          videoDuration.value = tempVideo.duration
          hls.destroy()
          if (tempVideo.parentNode === document.body) {
            document.body.removeChild(tempVideo)
          }
        }, 1000)
      })
    }
  } else if (props.videoUrl) {
    tempVideo.src = props.videoUrl
  }
}

function handleVideoError() {
  if (retryCount.value < maxRetries) {
    retryCount.value++
    setTimeout(() => previewRef.value?.load(), 1000)
  } else {
    hasError.value = true
    isPlaying.value = false
    isBuffering.value = false
  }
}

function handlePlaying() {
  isPlaying.value = true
  isBuffering.value = false
}

function handleMouseEnter() {
  if (!hasError.value && props.videoUrl) {
    if (previewTimeout) clearTimeout(previewTimeout)
    previewTimeout = window.setTimeout(async () => {
      if (previewRef.value) {
        try {
          previewRef.value.currentTime = 0
          previewRef.value.muted = true
          isBuffering.value = true
          const playPromise = previewRef.value.play()
          if (playPromise) await playPromise
        } catch {
          handleVideoError()
        }
      }
    }, 300)
  }
}

function handleMouseLeave() {
  if (previewTimeout) clearTimeout(previewTimeout)
  isPlaying.value = false
  isBuffering.value = false
  currentTime.value = 0
  if (previewRef.value) {
    previewRef.value.pause()
    previewRef.value.currentTime = 0
  }
}

// Lifecycle
onMounted(() => {
  if (props.videoUrl) {
    loadVideoDuration()
    if (previewRef.value) {
      if (props.videoUrl.endsWith('.m3u8')) {
        setupHls(props.videoUrl, previewRef.value)
      } else {
        previewRef.value.src = props.videoUrl
      }
    }
  }
})

onUnmounted(() => {
  if (previewTimeout) clearTimeout(previewTimeout)
  if (hlsInstance.value) hlsInstance.value.destroy()
})

watch(
  () => props.videoUrl,
  (newUrl) => {
    if (newUrl) {
      hasError.value = false
      isPlaying.value = false
      isBuffering.value = false
      retryCount.value = 0
      currentTime.value = 0

      loadVideoDuration()
      if (previewRef.value) {
        if (newUrl.endsWith('.m3u8')) {
          setupHls(newUrl, previewRef.value)
        } else {
          previewRef.value.src = newUrl
        }
      }
    }
  }
)
</script>

<style lang="scss" scoped>
.media-thumbnail {
  position: relative;
  width: 100%;
  background-color: #000;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;

  .thumbnail-wrapper {
    position: relative;
    width: 100%;
    padding-top: 56.25%; /* 16:9 aspect ratio */
  }

  .thumbnail-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .preview-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.3s ease;
  }

  .thumbnail-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
  }

  .buffering-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    z-index: 2;
  }

  /* Info badges (views & duration) */
  .info-badge {
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    z-index: 2;
    letter-spacing: 0.5px;
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    gap: 4px;

    &--views {
      bottom: 8px;
      right: 8px;
    }
    &--duration {
      top: 8px;
      right: 8px;
    }
  }

  /* Label badge (top-left) */
  .label-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    z-index: 3;

    &--primary {
      background: rgba(25, 118, 210, 0.9);
    }
    &--error {
      background: rgba(211, 47, 47, 0.9);
    }
    &--warning {
      background: rgba(245, 124, 0, 0.9);
    }
    &--success {
      background: rgba(46, 125, 50, 0.9);
    }
  }

  &:hover .thumbnail-image {
    transform: scale(1.05);
  }

  @media (max-width: 600px) {
    border-radius: 8px;
    width: 100%;
    
    .info-badge {
      padding: 2px 6px;
      font-size: 10px;
      
      &--views {
        bottom: 4px;
        right: 4px;
      }
      &--duration {
        top: 4px;
        right: 4px;
      }
    }
    
    .label-badge {
      padding: 2px 6px;
      font-size: 10px;
      top: 4px;
      left: 4px;
    }
  }

  @media (hover: none) {
    .thumbnail-image {
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .thumbnail-image,
    .preview-video {
      transition: none;
    }
  }
}
</style>