<template>
  <v-sheet class="recommended-categories pa-4">
    <v-row class="mb-4" align="center">
      <v-col cols="auto">
        <h2 class="text-h5">Explore Talents</h2>
        <span class="text-subtitle-1 text-medium-emphasis">
          Discover amazing talents in various categories
        </span>
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-btn variant="text" color="primary" to="/talents/categories">
          View All
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="store.loading && !store.categories.length">
      <v-col v-for="n in 5" :key="n" :cols="12" :sm="6" :md="4" :lg="3">
        <v-skeleton-loader type="card" :height="240" />
      </v-col>
    </v-row>

    <CarouselWrapper
      v-else-if="store.categories.length"
      :modules="swiperModules"
      :slides-per-view="5"
      :space-between="24"
      :navigation="true"
      :pagination="false"
      :autoplay="{
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }"
      :breakpoints="breakpoints"
      :loop="true"
      :arrow-color="'#FFFFFF'"
      :arrow-bg-color="'rgba(0, 0, 0, 0.5)'"
      :arrow-size="'medium'"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
    >
      <SwiperSlide
        v-for="category in store.categories"
        :key="category.id"
        class="category-slide"
      >
        <CategoryCard
          :category="category"
          size="md"
          @click="handleCategoryClick"
        />
      </SwiperSlide>
    </CarouselWrapper>

    <v-alert v-else-if="store.error" type="error" variant="tonal" class="mt-4">
      {{ store.error }}
    </v-alert>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import type { Swiper } from 'swiper/types'
import { useRecommendedTalentCategoriesStore } from '@/stores/useRecommendedTalentCategoriesStore'
import type { TalentCategory } from '@/types/talent-categories'
import { useRouter } from 'vue-router'

const store = useRecommendedTalentCategoriesStore()
const router = useRouter()
const swiperInstance = ref<Swiper | null>(null)

const swiperModules = [Navigation, Autoplay, Pagination]

const breakpoints = {
  320: {
    slidesPerView: 1.2,
    spaceBetween: 12,
  },
  480: {
    slidesPerView: 2,
    spaceBetween: 16,
  },
  768: {
    slidesPerView: 3,
    spaceBetween: 20,
  },
  1024: {
    slidesPerView: 4,
    spaceBetween: 24,
  },
  1280: {
    slidesPerView: 5,
    spaceBetween: 24,
  },
}

const handleCategoryClick = async (category: TalentCategory) => {
  try {
    await router.push(`/talents/${category.slug}`)
  } catch (error) {
    console.error('Navigation error:', error)
  }
}

const onSwiper = (swiper: Swiper) => {
  swiperInstance.value = swiper
}

const onSlideChange = (swiper: Swiper) => {
  // Handle slide change if needed
}

onMounted(async () => {
  try {
    await store.fetchCategories()
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
})

onUnmounted(() => {
  if (swiperInstance.value) {
    swiperInstance.value.destroy()
  }
})
</script>

<style scoped lang="scss">
.recommended-categories {
  border-radius: 8px;
  position: relative;

  :deep(.swiper) {
    padding: 8px 4px;

    .swiper-button-prev,
    .swiper-button-next {
      width: 40px;
      height: 40px;
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      color: #ffffff;
      transition: all 0.3s ease;

      &::after {
        font-size: 20px;
        font-weight: bold;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.7);
        transform: scale(1.1);
      }
    }

    .swiper-button-prev {
      left: -12px;
    }

    .swiper-button-next {
      right: -12px;
    }

    @media (max-width: 600px) {
      .swiper-button-prev,
      .swiper-button-next {
        display: none;
      }
    }
  }

  .category-slide {
    height: auto;
    display: flex;
    align-items: stretch;
  }
}

@media (max-width: 600px) {
  .recommended-categories {
    padding: 16px;
  }
}
</style>
