<!-- components/project/ProjectCreditCarousel.vue -->
<template>
  <div class="project-credits">
    <BaseHeader title="Cast and Crew" class="mb-3">
      <template #actionable>
        <ViewAllButton
          :route="`/project/${accessUuid}/cast-crew`"
          prepend-icon="mdi-chevron-right"
          height="36"
        />
      </template>
    </BaseHeader>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div v-for="n in skeletonCount" :key="n" class="skeleton-card">
        <v-skeleton-loader
          type="image, list-item-two-line"
          class="skeleton-loader"
        >
          <template #default>
            <div class="d-flex align-center gap-4">
              <v-skeleton-loader type="avatar" width="56" height="56" />
              <div class="flex-grow-1">
                <v-skeleton-loader type="text" class="mb-1" />
                <v-skeleton-loader type="text" width="60%" />
              </div>
            </div>
          </template>
        </v-skeleton-loader>
      </div>
    </div>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>

    <!-- Carousel Content -->
    <BaseCarousel
      v-else-if="credits.length"
      ref="carouselRef"
      :slides-per-view="slidesPerView"
      :space-between="spaceBetween"
      :autoplay="false"
      :navigation="true"
      :pagination="false"
      :breakpoints="carouselBreakpoints"
      @slideChange="onSlideChange"
      @reachEnd="$emit('reachEnd')"
    >
      <SwiperSlide
        v-for="credit in credits"
        :key="credit.id"
        class="swiper-slide"
      >
        <ProjectCreditCard :credit="credit" :size="cardSize">
          <template #action>
            <TipButton
              :entity="credit.user"
              entity-type="user"
              size="small"
              @transaction-complete="handleTransactionComplete"
            />
          </template>
        </ProjectCreditCard>
      </SwiperSlide>
    </BaseCarousel>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p class="text-body-1 text-center">No cast and crew found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { SwiperSlide } from 'swiper/vue'
import { useWindowSize } from '@vueuse/core'

const props = defineProps<{
  accessUuid: string
  credits: any[]
  loading: boolean
  error: string | null
  totalMembers: number
}>()

const emit = defineEmits(['reachEnd'])

// Refs for state management
const carouselRef = ref(null)

// Responsive window size
const { width } = useWindowSize()

// Autoplay config
const autoplayConfig = {
  delay: 4000,
  disableOnInteraction: true,
  pauseOnMouseEnter: true,
}

// Responsive breakpoints
const carouselBreakpoints = {
  320: { slidesPerView: 2, spaceBetween: 12 },
  640: { slidesPerView: 3, spaceBetween: 15 },
  768: { slidesPerView: 4, spaceBetween: 18 },
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
  if (width.value < 768) return 12
  if (width.value < 1024) return 15
  if (width.value < 1280) return 18
  return 20
})

const cardSize = computed(() => {
  if (width.value < 640) return 'sm'
  if (width.value < 1024) return 'md'
  return 'lg'
})

// Handle slide change for infinite loading
const onSlideChange = (swiper) => {
  if (!swiper || props.credits.length === 0) return

  const slideProgress = swiper.activeIndex / (props.credits.length - 1)
  if (slideProgress > 0.75) {
    emit('reachEnd')
  }
}

// Watch for window resize to update the carousel
watch(width, () => {
  setTimeout(() => {
    carouselRef.value?.update?.()
  }, 100)
})

function handleTransactionComplete() {
  // Handle transaction completion
}
</script>

<style scoped lang="scss">
.project-credits {
  .swiper-slide {
    height: auto;
    
    // Improve typography for carousel cards
    :deep(.project-credit-card__name) {
      font-size: 15px !important;
      font-weight: 600 !important;
      line-height: 1.3 !important;
    }
    
    :deep(.role-text) {
      font-size: 11px !important;
      font-weight: 500 !important;
    }
    
    // Compact mode overrides for carousel
    :deep(.project-credit-card__name--compact) {
      font-size: 16px !important;
      font-weight: 600 !important;
    }
    
    :deep(.role-text--compact) {
      font-size: 13px !important;
      font-weight: 500 !important;
    }
  }
}

.loading-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  
  .skeleton-card {
    border-radius: 12px;
    overflow: hidden;
  }
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

// Responsive adjustments
@media (max-width: 768px) {
  .project-credits {
    .swiper-slide {
      :deep(.project-credit-card__name) {
        font-size: 14px !important;
      }
      
      :deep(.role-text) {
        font-size: 10px !important;
      }
      
      :deep(.project-credit-card__name--compact) {
        font-size: 15px !important;
      }
      
      :deep(.role-text--compact) {
        font-size: 12px !important;
      }
    }
  }
}

@media (max-width: 480px) {
  .project-credits {
    .swiper-slide {
      :deep(.project-credit-card__name) {
        font-size: 13px !important;
      }
      
      :deep(.role-text) {
        font-size: 9px !important;
      }
      
      :deep(.project-credit-card__name--compact) {
        font-size: 14px !important;
      }
      
      :deep(.role-text--compact) {
        font-size: 11px !important;
      }
    }
  }
}
</style>
