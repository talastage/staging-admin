<template>
  <div>
    <BaseCarousel
      ref="carouselRef"
      :navigation="true"
      :loop="false"
      :spaceBetween="20"
      :slides-per-view="3"
      :breakpoints="carouselBreakpoints"
      :loading="loading"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
      @reachEnd="$emit('reachEnd')"
    >
      <SwiperSlide
        v-for="(project, index) in displayProjects"
        :key="project?.id || index"
      >
        <TrendingProjectCard
          v-if="project?.id"
          :video="project"
          :size="projectCardSize"
          @click="$emit('projectClick', project)"
        />
        <ProjectCardSkeleton v-else :size="projectCardSize" />
      </SwiperSlide>
    </BaseCarousel>

    <div v-if="error" class="d-flex justify-center mt-4">
      <v-alert
        type="error"
        text="Failed to load projects. Please try again later."
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { SwiperSlide } from 'swiper/vue'
import type { Swiper } from 'swiper/types'
import type { Project } from '~/types/project'
import { useWindowSize } from '@vueuse/core'

const props = defineProps({
  projects: {
    type: Array as () => Project[],
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingMore: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['reachEnd', 'projectClick'])

const carouselRef = ref<any>(null)
const { width } = useWindowSize()
const swiperInstance = ref<Swiper | null>(null)

// Responsive configuration
const slidesPerViewValue = computed(() => {
  if (width.value < 640) return 1
  if (width.value < 960) return 2
  return 3 // Default to 3 slides
})

const carouselBreakpoints = ref({
  320: { slidesPerView: 1, spaceBetween: 10 },
  640: { slidesPerView: 2, spaceBetween: 15 },
  960: { slidesPerView: 3, spaceBetween: 20 },
})

const projectCardSize = computed(() => {
  if (width.value < 640) return 'md'
  return 'lg'
})

// Calculate how many items to display based on viewport
const itemsPerView = computed(() => {
  return slidesPerViewValue.value + 1 // Add one more for better UX
})

const displayProjects = computed(() => {
  if (props.loading && props.projects.length === 0) {
    return Array(itemsPerView.value).fill(null)
  }

  const items = [...props.projects]
  if (props.loadingMore) {
    items.push(...Array(itemsPerView.value).fill(null))
  }
  return items
})

// Swiper event handlers
const onSwiper = (swiper: Swiper) => {
  swiperInstance.value = swiper
}

const onSlideChange = (swiper: Swiper) => {
  if (!swiper || props.projects.length === 0) return

  // Calculate how close we are to the end
  const totalSlides = props.projects.length
  const activeIndex = swiper.activeIndex
  const slidesPerView = slidesPerViewValue.value

  // Preload more data when user is nearing the end (within 2 * slidesPerView items)
  const preloadThreshold = slidesPerView * 2
  const isNearEnd = totalSlides - activeIndex <= preloadThreshold

  if (isNearEnd && !props.loadingMore) {
    emit('reachEnd')
  }
}

// Refresh data if viewport changes significantly
watch(slidesPerViewValue, () => {
  if (swiperInstance.value) {
    swiperInstance.value.update()
  }
})

// Make sure swiper updates when the projects prop changes
watch(
  () => props.projects,
  () => {
    setTimeout(() => {
      swiperInstance.value?.update()
    }, 100)
  }
)
</script>

<style scoped>
/* Any additional custom styling */
</style>
