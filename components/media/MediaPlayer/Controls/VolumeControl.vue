<template>
  <div
    class="volume-control"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <button
      class="control-button"
      @click.stop="emit('toggle-mute')"
      :aria-label="isMuted ? 'Unmute' : 'Mute'"
    >
      <svg
        v-if="volumeIcon === 'muted'"
        viewBox="0 0 24 24"
        class="control-icon"
      >
        <path
          fill="currentColor"
          d="M3,9H7L12,4V20L7,15H3V9M16.59,12L14,9.41L15.41,8L18,10.59L20.59,8L22,9.41L19.41,12L22,14.59L20.59,16L18,13.41L15.41,16L14,14.59L16.59,12Z"
        />
      </svg>
      <svg
        v-else-if="volumeIcon === 'low'"
        viewBox="0 0 24 24"
        class="control-icon"
      >
        <path
          fill="currentColor"
          d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z"
        />
      </svg>
      <svg v-else viewBox="0 0 24 24" class="control-icon">
        <path
          fill="currentColor"
          d="M3,9H7L12,4V20L7,15H3V9M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12Z"
        />
      </svg>
    </button>

    <div
      class="volume-slider-container"
      :class="{ 'slider-visible': showSlider || isDragging }"
    >
      <input
        type="range"
        class="volume-slider"
        :min="0"
        :max="1"
        :step="0.05"
        :value="localVolume"
        @input="handleVolumeChange"
        @mousedown="isDragging = true"
        @mouseup="handleMouseUpSlider"
        @mouseleave="handleSliderMouseLeave"
        :aria-label="'Volume slider'"
      />
      <div
        class="volume-level"
        :style="{ width: `${localVolume * 100}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps({
  volume: Number,
  isMuted: Boolean,
})

const emit = defineEmits(['update:volume', 'toggle-mute'])

const localVolume = ref(props.volume)
const isDragging = ref(false)
const showSlider = ref(false)
const hideTimeout = ref(null)

const volumeIcon = computed(() => {
  if (props.isMuted || localVolume.value === 0) return 'muted'
  if (localVolume.value < 0.5) return 'low'
  return 'high'
})

watch(
  () => props.volume,
  (newVal) => {
    localVolume.value = newVal
  }
)

const handleVolumeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:volume', parseFloat(target.value))
}

const handleMouseEnter = () => {
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value)
    hideTimeout.value = null
  }
  showSlider.value = true
}

const handleMouseLeave = () => {
  if (!isDragging.value) {
    hideTimeout.value = setTimeout(() => {
      showSlider.value = false
      hideTimeout.value = null
    }, 800)
  }
}

const handleMouseUpSlider = () => {
  isDragging.value = false
}

const handleSliderMouseLeave = () => {
  if (!isDragging.value) {
    hideTimeout.value = setTimeout(() => {
      showSlider.value = false
      hideTimeout.value = null
    }, 800)
  }
}
</script>

<style scoped>
.volume-control {
  display: flex;
  align-items: center;
  position: relative;
  height: 36px;
  padding: 0 4px;
}

.control-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  opacity: 0.9;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
}

.control-button:hover {
  opacity: 1;
}

.control-icon {
  width: 20px;
  height: 20px;
}

.volume-slider-container {
  position: relative;
  width: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  transition: width 0.3s ease, margin-left 0.3s ease;
  margin-left: 0;
}

.slider-visible {
  width: 60px;
  margin-left: 8px;
}

.volume-slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -webkit-appearance: none;
  background: transparent;
  margin: 0;
  padding: 0;
  cursor: pointer;
  z-index: 2;
}

.volume-level {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: white;
  border-radius: 2px;
  pointer-events: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

@media (max-width: 768px) {
  .volume-control {
    display: none;
  }
}
</style>