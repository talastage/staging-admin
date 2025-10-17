// composables/premiering/usePremieringCategories.ts

import { ref, computed, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useWindowSize } from '@vueuse/core'
import type { PremieringCategoryLite } from '~/types/PremieringCategoryLite'

export function usePremieringCategories() {
  const { $axios } = useNuxtApp()
  const { width } = useWindowSize()

  // State
  const categories = ref<PremieringCategoryLite[]>([])
  const carouselRef = ref(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const hasMorePages = ref(true)

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

  // Responsive breakpoints for the carousel
  const breakpoints = {
    320: { slidesPerView: 2, spaceBetween: 10 },
    640: { slidesPerView: 3, spaceBetween: 15 },
    768: { slidesPerView: 4, spaceBetween: 15 },
    1024: { slidesPerView: 5, spaceBetween: 20 },
    1280: { slidesPerView: 6, spaceBetween: 20 },
  }

  // Computed property to combine loaded categories with placeholders for skeletons
  const displayCategories = computed(() => {
    if (isLoading.value && categories.value.length === 0) {
      return Array(slidesPerView.value).fill({})
    }
    if (isLoadingMore.value) {
      const skeletons = Array(slidesPerView.value).fill({})
      return [...categories.value, ...skeletons]
    }
    return categories.value
  })

  // Fetch categories from the API with advanced pagination
  const fetchCategories = async (page = 1, isLoadMore = false) => {
    if (isLoading.value || (isLoadMore && !hasMorePages.value)) return

    try {
      if (page === 1) {
        isLoading.value = true
        isLoadingMore.value = false
      } else if (isLoadMore) {
        isLoadingMore.value = true
      }
      error.value = null

      const requestPage = isLoadMore ? currentPage.value + 1 : page
      const response = await $axios.get(
        `/api/projects/premiering-categories/home?page=${requestPage}`
      )

      if (requestPage === 1) {
        categories.value = response.data.data || []
      } else {
        categories.value = [...categories.value, ...(response.data.data || [])]
      }

      currentPage.value = requestPage
      lastPage.value = response.data.meta?.last_page || 1
      hasMorePages.value =
        response.data.meta?.has_more_pages !== undefined
          ? response.data.meta.has_more_pages
          : currentPage.value < lastPage.value && response.data.data.length > 0

      if (!response.data.data.length && isLoadMore) {
        hasMorePages.value = false // No more data to load
      }
    } catch (err) {
      console.error('Fetch error:', err)
      error.value = 'Unable to load categories. Please try again.'
      if (page === 1) categories.value = []
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }
  }

  // Handle slide change for preemptive loading
  const onSlideChange = (swiper) => {
    if (!swiper) return
    const lastVisibleIndex = swiper.activeIndex + slidesPerView.value - 1
    const loadThreshold = Math.max(1, slidesPerView.value - 1) // Load when 1–2 slides from end
    if (
      lastVisibleIndex >= categories.value.length - loadThreshold &&
      hasMorePages.value &&
      !isLoadingMore.value
    ) {
      fetchCategories(null, true)
    }
  }

  // Reset when the window size changes significantly
  watch(slidesPerView, (newVal, oldVal) => {
    if (Math.abs(newVal - oldVal) > 1 && carouselRef.value?.swiper) {
      setTimeout(() => {
        carouselRef.value.swiper.update()
      }, 100)
    }
  })

  return {
    categories,
    carouselRef,
    error,
    isLoading,
    isLoadingMore,
    slidesPerView,
    spaceBetween,
    breakpoints,
    hasMorePages,
    displayCategories,
    fetchCategories,
    onSlideChange,
  }
}
