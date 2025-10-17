<!-- Media.vue -->
<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters>
      <v-col cols="12">
        <div class="media-overlay-container">
          <ClientOnly>
            <Suspense>
              <MediaPlayer
                :project="project"
                :set-current-time="setCurrentTime"
                :set-duration="setDuration"
                @trailer-end="onTrailerEnd"
                @video-ended="onVideoEnded"
                ref="mediaPlayerRef"
              />
            </Suspense>
            <template #fallback>
              <v-skeleton-loader type="image" height="500" />
            </template>
          </ClientOnly>

          <MediaOverlay
            v-model:showOverlay="overlayVisible"
            :is-creator="isCreator"
            :video-ended="videoEnded"
            :is-future="project?.premiering?.is_future"
            :premiere-date="project?.premiering?.utc"
            :premiere-timezone="project?.premiering?.timezone"
            :project-id="project?.id"
            :access-uuid="project?.access_uuid"
            :is-notified="project?.is_notified"
            :status="project?.status"
            :payment-status="project?.payment_status"
            :is-trailer-playing="isTrailerPlaying"
            :project="project"
            @watchFullVideo="onWatchFullVideo"
            @startTrailer="onStartTrailer"
          />
        </div>


      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Creator {
  username: string
  display_name: string
  profile_photo: string
}

interface Premiering {
  utc: string
  localized: string
  timezone: string
  is_future: boolean
}

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
  thumbnail_url: string
  video_url: string
  premiering_start_date: string
  premiering_time: string
  time_zone: string
  is_notified: boolean
  status: 'published' | 'draft' | 'pending'
  payment_status: 'pending' | 'completed' | 'failed'
  has_paid_watch_fee: boolean
  watch_fee?: WatchFee
  premiering: Premiering
  creator?: Creator
}

interface Props {
  project: Project
  isCreator?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCreator: false,
})

// State
const overlayVisible = ref<boolean>(false)
const currentTime = ref<number>(0)
const duration = ref<number>(0)
const isTrailerPlaying = ref<boolean>(false)
const videoEnded = ref<boolean>(false)
const mediaPlayerRef = ref<InstanceType<typeof MediaPlayer> | null>(null)

/**
 * Updates current playback time and checks if overlay should be shown
 */
function setCurrentTime(time: number): void {
  currentTime.value = time
  maybeShowOverlay()
}

/**
 * Sets video duration and checks if overlay should be shown
 */
function setDuration(dur: number): void {
  duration.value = dur
  maybeShowOverlay()
}

/**
 * Determines whether to show the overlay based on video state
 */
function maybeShowOverlay(): void {
  // Don't show overlay if user is the creator or has paid the watch fee
  if (props.isCreator || props.project?.has_paid_watch_fee) {
    overlayVisible.value = false
    return
  }

  if (props.project?.premiering?.is_future) {
    overlayVisible.value = !isTrailerPlaying.value
    return
  }

  // Show overlay only when video has ended
  overlayVisible.value = videoEnded.value
}

/**
 * Handles watch full video button click
 */
async function onWatchFullVideo(): Promise<void> {
  // Payment logic is now handled directly in MediaOverlay
  // This function can be removed or used for additional logic if needed
}

/**
 * Handles start trailer button click
 */
function onStartTrailer(): void {
  if (mediaPlayerRef.value) {
    isTrailerPlaying.value = true
    videoEnded.value = false
    overlayVisible.value = false
    mediaPlayerRef.value.startTrailer()
  }
}

/**
 * Handles trailer end event
 */
function onTrailerEnd(): void {
  isTrailerPlaying.value = false
  maybeShowOverlay()
}

/**
 * Handles video end event
 */
function onVideoEnded(): void {
  videoEnded.value = true
  maybeShowOverlay()
}
</script>

<style scoped>
.media-overlay-container {
  position: relative;
  width: 100%;
}
</style>
