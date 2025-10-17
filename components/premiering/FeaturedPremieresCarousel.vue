<!-- components/PremiereCarousel.vue -->
<template>
  <div class="premiere-carousel">
    <div class="carousel-container" ref="container">
      <div
        class="carousel-track"
        :style="trackStyle"
        @touchstart="startDrag"
        @touchmove="onDrag"
        @touchend="endDrag"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="carousel-item"
          :style="itemStyle"
        >
          <slot name="item" :item="item" :index="index">
            {{ item }}
          </slot>
        </div>
      </div>
    </div>

    <!-- Navigation Arrows -->
    <button
      v-if="showArrows"
      class="nav-button prev"
      @click="prev"
      :disabled="!canScrollPrev"
    >
      <v-icon>mdi-chevron-left</v-icon>
    </button>
    <button
      v-if="showArrows"
      class="nav-button next"
      @click="next"
      :disabled="!canScrollNext"
    >
      <v-icon>mdi-chevron-right</v-icon>
    </button>

    <!-- Pagination Dots -->
    <div v-if="showDots" class="pagination-dots">
      <button
        v-for="n in totalPages"
        :key="n"
        class="dot"
        :class="{ active: currentPage === n - 1 }"
        @click="goToPage(n - 1)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  items: any[]
  itemsPerView?: number
  gap?: number
  showArrows?: boolean
  showDots?: boolean
  autoplay?: boolean
  autoplayInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerView: 4,
  gap: 20,
  showArrows: true,
  showDots: true,
  autoplay: true,
  autoplayInterval: 5000,
})

const container = ref<HTMLElement | null>(null)
const currentPage = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)

// Computed properties
const totalPages = computed(() =>
  Math.ceil(props.items.length / props.itemsPerView)
)

const canScrollPrev = computed(() => currentPage.value > 0)
const canScrollNext = computed(() => currentPage.value < totalPages.value - 1)

const trackStyle = computed(() => ({
  display: 'flex',
  gap: `${props.gap}px`,
  transition: isDragging.value ? 'none' : 'transform 0.3s ease-in-out',
  transform: `translateX(-${currentPage.value * 100}%)`,
}))

const itemStyle = computed(() => ({
  flex: `0 0 calc((100% - ${(props.itemsPerView - 1) * props.gap}px) / ${
    props.itemsPerView
  })`,
}))

// Navigation methods
const next = () => {
  if (canScrollNext.value) {
    currentPage.value++
  }
}

const prev = () => {
  if (canScrollPrev.value) {
    currentPage.value--
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
}

// Touch/Mouse drag handling
const startDrag = (e: MouseEvent | TouchEvent) => {
  isDragging.value = true
  const x = 'touches' in e ? e.touches[0].pageX : e.pageX
  startX.value = x
  scrollLeft.value = currentPage.value * 100
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return

  e.preventDefault()
  const x = 'touches' in e ? e.touches[0].pageX : e.pageX
  const walk = (startX.value - x) * 2 // Adjust sensitivity
  const newScroll =
    scrollLeft.value + (walk / container.value!.offsetWidth) * 100

  // Update page based on drag distance
  const newPage = Math.round(newScroll / 100)
  if (newPage >= 0 && newPage < totalPages.value) {
    currentPage.value = newPage
  }
}

const endDrag = () => {
  isDragging.value = false
}

// Autoplay functionality
let autoplayInterval: NodeJS.Timeout | null = null

const startAutoplay = () => {
  if (props.autoplay && !autoplayInterval) {
    autoplayInterval = setInterval(() => {
      if (canScrollNext.value) {
        next()
      } else {
        currentPage.value = 0
      }
    }, props.autoplayInterval)
  }
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<style scoped>
.premiere-carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.carousel-container {
  overflow: hidden;
}

.carousel-track {
  display: flex;
  width: 100%;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.nav-button:hover {
  background: rgba(0, 0, 0, 0.7);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-button.prev {
  left: 10px;
}

.nav-button.next {
  right: 10px;
}

.pagination-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.3s;
}

.dot.active {
  background: var(--v-primary-base);
}
</style>
