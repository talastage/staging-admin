<template>
  <div class="categories-carousel">
    <BaseHeader title="Premiering Categories" class="mb-3">
      <template #subtitle>
        Discover upcoming premieres and ongoing projects.
      </template>
      <template #actionable>
        <ViewAllButton
          route="/projects/premiering-categories"
          label="View All"
          color="primary"
        />
      </template>
    </BaseHeader>

    <!-- Error Message Display with Retry -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="retryFetch" class="retry-button">Retry</button>
    </div>

    <!-- Carousel of Categories with Skeletons -->
    <BaseCarousel
      v-else
      ref="carouselRef"
      :slides-per-view="slidesPerView"
      :space-between="spaceBetween"
      :navigation="true"
      :loop="false"
      :autoplay="{ delay: 3500, disableOnInteraction: false }"
      :breakpoints="breakpoints"
      @slideChange="onSlideChange"
      @reachEnd="handleReachEnd"
    >
      <SwiperSlide
        v-for="(category, index) in displayCategories"
        :key="category.id ? `category-${category.id}` : `loading-${index}`"
      >
        <CategoryCard
          v-if="!isLoadingCategory(index)"
          :category="category"
          :size="cardSize"
          @click="navigateToCategory"
        />
        <CategoryCardSkeleton
          v-else
          variant="image-card"
          :size="cardSize"
          :aspectRatio="1.5"
        />
      </SwiperSlide>
    </BaseCarousel>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { SwiperSlide } from 'swiper/vue'
import { usePremieringCategories } from '~/composables/premiering/useHomePremieringCategories'
import { useRouter } from 'vue-router'

const router = useRouter()
// Destructure the composable
const {
  categories: loadedCategories,
  carouselRef,
  error,
  isLoading,
  isLoadingMore,
  slidesPerView,
  spaceBetween,
  breakpoints,
  displayCategories,
  fetchCategories,
  onSlideChange,
  hasMorePages,
} = usePremieringCategories()

// Compute card size based on viewport width
const cardSize = computed(() => {
  const innerWidth = window.innerWidth
  if (innerWidth < 640) return 'small'
  if (innerWidth < 1024) return 'medium'
  return 'large'
})

const navigateToCategory = (category) => {
  if (category && category.slug) {
    router.push(`/watch/category/${category.slug}`)
  }
}

// Determine if an item at a specific index should show a skeleton loader
const isLoadingCategory = (index) => {
  if (isLoading.value && loadedCategories.value.length === 0) {
    return true
  }
  if (isLoadingMore.value && index >= loadedCategories.value.length) {
    return true
  }
  return false
}

// Handle when carousel reaches the end
const handleReachEnd = () => {
  if (hasMorePages.value && !isLoadingMore.value) {
    fetchCategories(null, true) // Fetch next page
  }
}

// Retry fetching categories
const retryFetch = () => {
  error.value = null
  fetchCategories(1)
}

// Fetch initial categories on mount
onMounted(async () => {
  await fetchCategories()
  if (carouselRef.value?.swiper) {
    carouselRef.value.swiper.update()
  }
})
</script>

<style scoped>
.categories-carousel {
  overflow: hidden;
}

.error-message {
  color: #721c24;
  background-color: #f8d7da;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.retry-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #c82333;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .categories-carousel {
    margin: 0 -8px;
  }
}
</style>
