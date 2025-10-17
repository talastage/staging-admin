<template>
  <div class="talents-carousel">
    <!-- Error Message Display -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Carousel of Talents with Improved Skeletons -->
    <BaseCarousel
      v-else
      ref="carouselRef"
      :slides-per-view="slidesPerView"
      :space-between="spaceBetween"
      :navigation="true"
      :loop="false"
      :autoplay="autoplay ? autoplayOptions : false"
      :breakpoints="breakpoints"
      @slideChange="onSlideChange"
      @reachEnd="$emit('reachEnd')"
    >
      <SwiperSlide
        v-for="(talent, index) in displayTalents"
        :key="talent?.id || `skeleton-${index}`"
      >
        <!-- Use slot for custom talent card if provided -->
        <slot v-if="talent?.id" name="talentCard" :talent="talent">
          <!-- Default talent card with integrated TipButton -->
          <UserTalentCard :user="talent" :size="cardSize">
            <template #action>
              <FanButton
                :username="talent.username"
              />
            </template>
          </UserTalentCard>
        </slot>
        <TalentCardSkeleton v-else :size="cardSize" />
      </SwiperSlide>
    </BaseCarousel>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { SwiperSlide } from 'swiper/vue'
import { useWindowSize } from '@vueuse/core'

const props = defineProps({
  talents: {
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
  showHeader: {
    type: Boolean,
    default: true,
  },
  autoplay: {
    type: Boolean,
    default: false,
  },
  cardSize: {
    type: String,
    default: 'xlarge',
  },
})

const emit = defineEmits(['reachEnd', 'talentClick'])

// Refs for state management
const carouselRef = ref(null)

// Responsive window size
const { width } = useWindowSize()

// Define autoplay options
const autoplayOptions = {
  delay: 3000,
  disableOnInteraction: true,
  pauseOnMouseEnter: true,
}

// Responsive breakpoints for the carousel
const breakpoints = {
  320: { slidesPerView: 2, spaceBetween: 10 },
  640: { slidesPerView: 3, spaceBetween: 15 },
  768: { slidesPerView: 4, spaceBetween: 15 },
  1024: { slidesPerView: 5, spaceBetween: 20 },
  1280: { slidesPerView: 6, spaceBetween: 20 },
}

// Computed properties for responsive design
const slidesPerView = computed(() => {
  if (width.value < 640) return 2
  if (width.value < 768) return 3
  if (width.value < 1024) return 4
  if (width.value < 1280) return 5
  return 6
})

const spaceBetween = computed(() => {
  if (width.value < 640) return 8
  if (width.value < 768) return 10
  if (width.value < 1024) return 15
  if (width.value < 1280) return 18
  return 20
})

// Computed property to combine talents with placeholders for skeletons
const displayTalents = computed(() => {
  if (props.loading && props.talents.length === 0) {
    // Show skeletons for initial loading
    return Array(slidesPerView.value).fill({})
  }

  if (props.loadingMore) {
    // Add skeletons for loading more
    const additionalSkeletons = Math.min(3, slidesPerView.value)
    return [...props.talents, ...Array(additionalSkeletons).fill({})]
  }

  return props.talents
})

// Handle slide change for infinite loading
const onSlideChange = (swiper) => {
  if (!swiper || props.talents.length === 0) return

  // If we're past 75% of the slides, emit event to load more
  const slideProgress = swiper.activeIndex / (props.talents.length - 1)
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

// Update carousel when talents prop changes
watch(
  () => props.talents,
  () => {
    setTimeout(() => {
      carouselRef.value?.update?.()
    }, 100)
  }
)
</script>

<style scoped>
.talents-carousel {
  overflow: hidden;
}

.error-message {
  color: red;
  text-align: center;
  padding: 1rem;
  background-color: rgba(255, 0, 0, 0.05);
  border-radius: 8px;
  margin-bottom: 1rem;
}
</style>
