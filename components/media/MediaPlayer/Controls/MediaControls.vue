<template>
  <div 
    class="video-controls" 
    :class="{ 'controls-hidden': hideControls }"
  >
    <slot name="progress"></slot>

    <div class="controls-main">
      <div class="controls-left">
        <button
          class="control-button"
          @click.stop="emit('play-pause')"
          :aria-label="isPlaying ? 'Pause' : 'Play'"
        >
          <svg v-if="isPlaying" viewBox="0 0 24 24" class="control-icon">
            <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" class="control-icon">
            <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
          </svg>
        </button>

        <div class="time-display">
          {{ formatTime(currentTime || 0) }} / {{ formatTime(duration || 0) }}
        </div>
      </div>

      <div class="spacer"></div>

      <div class="controls-right">
        <slot name="controls-right"></slot>

        <button
          class="control-button"
          @click.stop="emit('fullscreen')"
          :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
        >
          <svg v-if="isFullscreen" viewBox="0 0 24 24" class="control-icon">
            <path
              fill="currentColor"
              d="M14,14H19V16H16V19H14V14M5,14H10V19H8V16H5V14M8,5H10V10H5V8H8V5M19,8V10H14V5H16V8H19Z"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" class="control-icon">
            <path
              fill="currentColor"
              d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  isPlaying: boolean
  currentTime: number
  duration: number
  isFullscreen: boolean
  hideControls?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hideControls: false
})

const emit = defineEmits<{
  'play-pause': []
  'fullscreen': []
  'seek': [time: number]
}>()

// Format time in seconds to MM:SS or HH:MM:SS format
const formatTime = (timeInSeconds: number): string => {
  if (!timeInSeconds) return '00:00'

  const hours = Math.floor(timeInSeconds / 3600)
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
  const seconds = Math.floor(timeInSeconds % 60)

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}`
}
</script>

<style scoped>
.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 20px 15px 10px;
  transition: opacity 0.3s ease;
  z-index: 2;
  user-select: none;
}

.controls-hidden {
  opacity: 0;
  pointer-events: none;
}

.controls-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 10px;
}

.controls-left, .controls-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  opacity: 0.9;
  transition: opacity 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-button:hover {
  opacity: 1;
  transform: scale(1.1);
}

.control-button:active {
  transform: scale(0.95);
}

.control-button:focus-visible {
  outline: 2px solid white;
  border-radius: 4px;
}

.control-icon {
  width: 24px;
  height: 24px;
}

.time-display {
  color: white;
  font-size: 14px;
  font-family: monospace;
  min-width: 100px;
  user-select: none;
  margin-left: 5px;
}

.spacer {
  flex-grow: 1;
}

@media (max-width: 768px) {
  .video-controls {
    padding: 15px 10px 8px;
  }

  .time-display {
    display: none;
  }

  .control-icon {
    width: 20px;
    height: 20px;
  }
}
</style>