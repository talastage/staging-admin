<template>
  <div class="upcoming-projects-carousel">
    <BaseCarousel
      ref="carouselRef"
      :navigation="navigation"
      :pagination="pagination"
      :loop="loop"
      :spaceBetween="spaceBetween"
      :slides-per-view="slidesPerViewValue"
      :breakpoints="carouselBreakpoints"
      :loading="loading"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
      @reachEnd="$emit('reachEnd')"
    >
      <SwiperSlide
        v-for="(project, index) in displayProjects"
        :key="project?.id || `skeleton-${index}`"
      >
        <UpcomingPremiereCard
          v-if="project?.id"
          :premiere="project"
          :loading="false"
          :showPremiereBadge="true"
          @click="$emit('projectClick', project)"
        />
        <ProjectCardSkeleton v-else :size="projectCardSize" />
      </SwiperSlide>
    </BaseCarousel>

    <div v-if="error" class="d-flex justify-center mt-4">
      <v-alert
        type="error"
        :text="
          errorMessage || 'Failed to load projects. Please try again later.'
        "
      />
    </div>

    <div v-if="showMoreButton && hasMore" class="d-flex justify-center mt-4">
      <v-btn
        color="primary"
        :disabled="loadingMore"
        :loading="loadingMore"
        @click="$emit('loadMore')"
      >
        {{ loadMoreText }}
      </v-btn>
    </div>

    <slot name="footer"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { SwiperSlide } from 'swiper/vue'
import type { Swiper } from 'swiper/types'
import { useWindowSize, useBreakpoints } from '@vueuse/core'
import UpcomingPremiereCard from '~/components/upcoming/UpcomingPremiereCard.vue'
import type { UpcomingPremiere } from '~/types/premiere'

// Define props with extensive customization options
const props = defineProps({
  projects: {
    type: Array as () => UpcomingPremiere[],
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
  errorMessage: {
    type: String,
    default: '',
  },
  // Carousel configuration
  navigation: {
    type: Boolean,
    default: true,
  },
  pagination: {
    type: Boolean,
    default: false,
  },
  loop: {
    type: Boolean,
    default: false,
  },
  spaceBetween: {
    type: Number,
    default: 20,
  },
  // Behavior configuration
  preloadThresholdMultiplier: {
    type: Number,
    default: 2, // How many "screens" ahead to preload
  },
  showMoreButton: {
    type: Boolean,
    default: false,
  },
  loadMoreText: {
    type: String,
    default: 'Load More',
  },
  hasMore: {
    type: Boolean,
    default: true,
  },
  // Custom breakpoints (optional)
  customBreakpoints: {
    type: Object,
    default: null,
  },
  skeletonCount: {
    type: Number,
    default: 0, // 0 means auto-calculate based on viewport
  },
})

const emit = defineEmits(['reachEnd', 'projectClick', 'loadMore'])

const carouselRef = ref<any>(null)
const { width } = useWindowSize()
const swiperInstance = ref<Swiper | null>(null)

// Setup responsive breakpoints
const breakpoints = useBreakpoints({
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
})

const isXs = breakpoints.smaller('sm')
const isSm = breakpoints.between('sm', 'md')
const isMd = breakpoints.between('md', 'lg')
const isLg = breakpoints.between('lg', 'xl')
const isXl = breakpoints.greaterOrEqual('xl')

// Responsive configuration
const slidesPerViewValue = computed(() => {
  if (isXs.value) return 1
  if (isSm.value) return 2
  return 3 // Default to 3 slides for md screens and above
})

const defaultBreakpoints = computed(() => ({
  0: { slidesPerView: 1, spaceBetween: 10 },
  600: { slidesPerView: 2, spaceBetween: 15 },
  960: { slidesPerView: 3, spaceBetween: 20 },
}))

const carouselBreakpoints = computed(
  () => props.customBreakpoints || defaultBreakpoints.value
)

const projectCardSize = computed(() => {
  if (isXs.value) return 'sm'
  if (isSm.value) return 'md'
  if (isMd.value) return 'lg'
  return 'xl'
})

// Calculate how many items to display based on viewport
const skeletonItemCount = computed(() => {
  if (props.skeletonCount > 0) return props.skeletonCount

  // Auto-calculate based on viewport
  return slidesPerViewValue.value + 1 // Add one more for better UX
})

// Prepare the display list with proper skeletons
const displayProjects = computed(() => {
  if (props.loading && props.projects.length === 0) {
    return Array(skeletonItemCount.value).fill(null)
  }

  const items = [...props.projects]

  if (props.loadingMore) {
    // Add loading skeletons at the end when loading more
    items.push(...Array(Math.min(skeletonItemCount.value, 2)).fill(null))
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

  // Preload more data when user is nearing the end
  const preloadThreshold = slidesPerView * props.preloadThresholdMultiplier
  const isNearEnd = totalSlides - activeIndex <= preloadThreshold

  if (isNearEnd && !props.loadingMore && props.hasMore) {
    emit('reachEnd')
  }
}

// Lifecycle hooks
onMounted(() => {
  // Initialize any required functionality on mount
  setTimeout(() => {
    swiperInstance.value?.update()
  }, 100)
})

// Watch for changes that require swiper update
watch([() => props.projects, width], () => {
  // Update swiper when projects or window size changes
  setTimeout(() => {
    swiperInstance.value?.update()
  }, 100)
})
</script>

<style lang="scss" scoped>
.upcoming-projects-carousel {
  position: relative;

  :deep {
    .swiper-button-next,
    .swiper-button-prev {
      color: white;
      background-color: rgba(0, 0, 0, 0.5);
      width: 40px;
      height: 40px;
      border-radius: 50%;

      &:after {
        font-size: 20px;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.8);
      }
    }

    .swiper-pagination-bullet {
      background-color: white;
      opacity: 0.5;

      &-active {
        opacity: 1;
      }
    }
  }
}

@media (max-width: 600px) {
  .upcoming-projects-carousel {
    :deep {
      .swiper-button-next,
      .swiper-button-prev {
        width: 30px;
        height: 30px;

        &:after {
          font-size: 15px;
        }
      }
    }
  }
}
</style>
