<template>
  <div
    class="progress-container"
    @click="handleClick"
    @mousemove="handleHover"
    @mouseleave="handleLeave"
  >
    <div class="progress-bar">
      <div class="buffered" :style="{ width: `${buffered}%` }"></div>
      <div class="progress" :style="{ width: `${progress}%` }"></div>
      <div 
        class="progress-handle" 
        :style="{ left: `${progress}%` }"
        :class="{ 'handle-visible': isHovering }"
      ></div>
      <div 
        class="progress-chapters"
        v-if="chapters && chapters.length > 0"
      >
        <div 
          v-for="(chapter, index) in chapters" 
          :key="index"
          class="chapter-marker"
          :style="{ left: `${(chapter.startTime / duration) * 100}%` }"
          :title="chapter.title"
        ></div>
      </div>
    </div>
    <div
      v-if="showHoverTime"
      class="progress-hover-time"
      :style="{ left: hoverPosition + 'px' }"
    >
      {{ formatTime(hoverTime) }}
      <div class="hover-preview" v-if="previewEnabled">
        <div class="preview-placeholder"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Chapter {
  title: string
  startTime: number
}

const props = defineProps({
  currentTime: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  buffered: {
    type: Number,
    default: 0
  },
  chapters: {
    type: Array as () => Chapter[],
    default: () => []
  },
  previewEnabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['seek'])

const hoverPosition = ref(0)
const hoverTime = ref(0)
const showHoverTime = ref(false)
const isHovering = ref(false)

const progress = computed(() => (props.currentTime / props.duration) * 100 || 0)

const formatTime = (seconds: number) => {
  if (!seconds) return '0:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const handleClick = (event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const clickPosition = (event.clientX - rect.left) / rect.width
  emit('seek', clickPosition * props.duration)
}

const handleHover = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const hoverPos = event.clientX - rect.left
  const percentage = hoverPos / rect.width
  hoverPosition.value = hoverPos
  hoverTime.value = props.duration * percentage
  showHoverTime.value = true
  isHovering.value = true
}

const handleLeave = () => {
  showHoverTime.value = false
  isHovering.value = false
}

// Watch for changes in duration to update hover time calculation
watch(() => props.duration, () => {
  if (isHovering.value) {
    const percentage = hoverPosition.value / (event?.currentTarget as HTMLElement)?.getBoundingClientRect().width
    if (percentage) {
      hoverTime.value = props.duration * percentage
    }
  }
})
</script>

<style scoped>
.progress-container {
  position: relative;
  width: 100%;
  margin-bottom: 10px;
  cursor: pointer;
  padding: 8px 0;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  position: relative;
  border-radius: 2px;
  transition: height 0.1s ease;
}

.progress-container:hover .progress-bar {
  height: 6px;
}

.progress,
.buffered {
  height: 100%;
  position: absolute;
  border-radius: 2px;
  top: 0;
}

.buffered {
  background: rgba(255, 255, 255, 0.4);
  z-index: 1;
}

.progress {
  background: #ff0000;
  transition: width 0.1s linear;
  z-index: 2;
}

.progress-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #ff0000;
  border-radius: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  opacity: 0;
  transition: opacity 0.2s, transform 0.1s;
}

.handle-visible {
  opacity: 1;
}

.progress-container:hover .progress-handle {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.2);
}

.progress-hover-time {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  bottom: 100%;
  transform: translateX(-50%);
  pointer-events: none;
  margin-bottom: 8px;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.hover-preview {
  width: 160px;
  height: 90px;
  background: #000;
  margin-top: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  background: #333;
}

.progress-chapters {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.chapter-marker {
  position: absolute;
  width: 2px;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  transform: translateX(-50%);
}
</style>