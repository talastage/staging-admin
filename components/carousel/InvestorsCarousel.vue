<template>
  <div class="investors-carousel">
    <!-- Error Message Display -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Carousel of Investors with Skeletons -->
    <BaseCarousel
      v-else
      ref="carouselRef"
      :slides-per-view="slidesPerView"
      :space-between="spaceBetween"
      :navigation="!xsOnly"
      :pagination="true"
      :loop="false"
      :autoplay="autoplay ? autoplayOptions : false"
      :breakpoints="breakpoints"
      @slideChange="onSlideChange"
      @reachEnd="$emit('reachEnd')"
    >
      <SwiperSlide
        v-for="(investor, index) in displayInvestors"
        :key="investor?.id || `skeleton-${index}`"
        class="investor-slide"
      >
        <PageInvestorCard
          v-if="investor?.id"
          :page="investor"
          @click="$emit('investorClick', investor)"
        />
        <PageInvestorCardSkeleton v-else />
      </SwiperSlide>
    </BaseCarousel>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { SwiperSlide } from 'swiper/vue'
import { useWindowSize } from '@vueuse/core'
import { useDisplay } from 'vuetify'
import 'swiper/css'
import 'swiper/css/pagination'

const props = defineProps({
  investors: {
    type: Array,
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
    type: [String, null],
    default: null,
  },
  autoplay: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['reachEnd', 'investorClick'])

// Refs for state management
const carouselRef = ref(null)

// Responsive window size
const { width } = useWindowSize()
const { xsOnly } = useDisplay()

// Define autoplay options
const autoplayOptions = {
  delay: 3000,
  disableOnInteraction: true,
  pauseOnMouseEnter: true,
}

// Responsive breakpoints for the carousel - Updated for better mobile display
const breakpoints = {
  0: { slidesPerView: 1, spaceBetween: 12 },
  480: { slidesPerView: 2, spaceBetween: 14 },
  768: { slidesPerView: 2.5, spaceBetween: 16 },
  960: { slidesPerView: 3, spaceBetween: 18 },
  1280: { slidesPerView: 4, spaceBetween: 20 },
}

// Computed properties for responsive design - Updated for mobile
const slidesPerView = computed(() => {
  if (width.value < 480) return 1
  if (width.value < 768) return 2
  if (width.value < 960) return 2.5
  if (width.value < 1280) return 3
  return 4
})

const spaceBetween = computed(() => {
  if (width.value < 480) return 12
  if (width.value < 768) return 14
  if (width.value < 960) return 16
  if (width.value < 1280) return 18
  return 20
})

// Computed property to combine investors with placeholders for skeletons
const displayInvestors = computed(() => {
  if (props.loading && props.investors.length === 0) {
    // Show skeletons for initial loading - adjusted for mobile
    const count = Math.min(Math.max(Math.floor(slidesPerView.value), 1), 4)
    return Array(count).fill({})
  }

  if (props.loadingMore) {
    // Add skeletons for loading more - limit to 2 for better performance
    const additionalSkeletons = 2
    return [...props.investors, ...Array(additionalSkeletons).fill({})]
  }

  return props.investors
})

// Handle slide change for infinite loading
const onSlideChange = (swiper) => {
  if (!swiper || !props.investors.length) return

  // If we're past 75% of the slides, emit event to load more
  const lastIndex = Math.max(1, props.investors.length - 1)
  const slideProgress = swiper.activeIndex / lastIndex
  if (slideProgress > 0.75 && !props.loadingMore) {
    emit('reachEnd')
  }
}

// Watch for window resize to update the carousel
watch(width, () => {
  // Debounce to prevent multiple updates
  setTimeout(() => {
    carouselRef.value?.update?.()
  }, 100)
})

// Update carousel when investors prop changes
watch(
  () => props.investors,
  () => {
    setTimeout(() => {
      carouselRef.value?.update?.()
    }, 100)
  }
)
</script>

<style scoped>
.investors-carousel {
  overflow: hidden;
  padding: 10px 0;
}

.error-message {
  color: red;
  text-align: center;
  padding: 1rem;
  background-color: rgba(255, 0, 0, 0.05);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.investor-slide {
  height: auto;
  display: flex;
}

/* Ensure slides have consistent height */
.investor-slide > * {
  width: 100%;
  flex: 1;
}

:deep(.swiper-pagination) {
  bottom: -25px;
}

:deep(.swiper-pagination-bullet) {
  background: var(--v-primary-base);
  opacity: 0.5;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  background-color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: -18px;
}

:deep(.swiper-button-next:after),
:deep(.swiper-button-prev:after) {
  font-size: 18px;
  color: var(--v-primary-base);
}

/* Mobile responsive navigation - hide buttons on small screens */
@media (max-width: 599px) {
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    display: none !important;
  }
}

/* Improved mobile layout */
@media (max-width: 479px) {
  .investors-carousel {
    padding: 8px 0;
  }

  :deep(.swiper-pagination) {
    bottom: -20px;
  }
}

/* Tablet and small desktop improvements */
@media (min-width: 768px) and (max-width: 959px) {
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    width: 40px;
    height: 40px;
    margin-top: -20px;
  }
}
</style>
