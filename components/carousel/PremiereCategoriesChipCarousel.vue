<template>
  <div class="premiere-categories-carousel-wrapper">
    <div
      class="premiere-categories-carousel"
      :class="{ sticky: isSticky }"
      ref="carouselRef"
    >
      <v-skeleton-loader
        v-if="categoriesLoading"
        type="chip-group"
        class="mb-2"
      ></v-skeleton-loader>

      <div v-else class="carousel-container">
        <v-chip-group
          v-model="selectedCategoryIndex"
          class="flex-nowrap"
          show-arrows
          @update:model-value="handleCategoryChange"
        >
          <v-chip
            filter
            variant="elevated"
            :value="null"
            :color="selectedCategoryIndex === null ? 'primary' : undefined"
            class="category-chip"
          >
            All
          </v-chip>

          <v-chip
            v-for="category in categories"
            :key="category.id"
            filter
            variant="elevated"
            :value="category.id"
            :color="
              selectedCategoryIndex === category.id ? 'primary' : undefined
            "
            class="category-chip"
          >
            <v-avatar v-if="category.avatar_url" start class="mr-1">
              <v-img :src="category.avatar_url" alt="Category avatar"></v-img>
            </v-avatar>
            {{ category.name }}
          </v-chip>
        </v-chip-group>
      </div>
    </div>

    <!-- Spacer element to prevent content jump when carousel becomes sticky -->
    <div
      v-if="isSticky"
      class="carousel-spacer"
      :style="{ height: `${carouselHeight}px` }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import type { PremieringCategoryBase } from '~/types/PremieringCategoryBase'
import { usePremieringCategories } from '~/composables/premiering/usePremieringCategories'

const emit = defineEmits<{
  'update:modelValue': [category: PremieringCategoryBase | null]
  'category-selected': [category: PremieringCategoryBase | null]
}>()

const props = defineProps({
  modelValue: {
    type: Object as () => PremieringCategoryBase | null,
    default: null,
  },
  stickyOffset: {
    type: Number,
    default: 0,
  },
})

// Use the premiering categories composable
const {
  categories,
  loading: categoriesLoading,
  fetchCategories,
} = usePremieringCategories()

const selectedCategoryIndex = ref(null)
const carouselRef = ref<HTMLElement | null>(null)
const isSticky = ref(false)
const carouselHeight = ref(0)
const carouselOffsetTop = ref(0)

// Handle category selection
const handleCategoryChange = (index: number | null) => {
  if (index === null) {
    // "All" selected
    emit('update:modelValue', null)
    emit('category-selected', null)
    return
  }

  // Find the selected category by ID
  const selectedCategory = categories.value.find((cat) => cat.id === index)
  emit('update:modelValue', selectedCategory || null)
  emit('category-selected', selectedCategory || null)
}

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      selectedCategoryIndex.value = newValue.id
    } else {
      selectedCategoryIndex.value = null
    }
  },
  { immediate: true }
)

// Handle scroll event to make carousel sticky
const handleScroll = () => {
  if (!carouselRef.value) return

  const scrollY = window.scrollY
  const triggerPoint = carouselOffsetTop.value - props.stickyOffset

  if (scrollY > triggerPoint && !isSticky.value) {
    isSticky.value = true
  } else if (scrollY <= triggerPoint && isSticky.value) {
    isSticky.value = false
  }
}

// Initialize carousel position and dimensions
const initCarouselPosition = () => {
  if (!carouselRef.value) return

  // Get the carousel's height and position
  carouselHeight.value = carouselRef.value.offsetHeight
  carouselOffsetTop.value =
    carouselRef.value.getBoundingClientRect().top + window.scrollY

  // Initial check for scroll position
  handleScroll()
}

onMounted(async () => {
  await fetchCategories()

  // Wait for the DOM to update after categories are loaded
  await nextTick()

  // Initialize carousel position
  initCarouselPosition()

  // Add scroll event listener
  window.addEventListener('scroll', handleScroll, { passive: true })

  // Add resize event listener to recalculate dimensions
  window.addEventListener('resize', initCarouselPosition, { passive: true })
})

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', initCarouselPosition)
})
</script>

<style scoped>
.premiere-categories-carousel-wrapper {
  width: 100%;
  position: relative;
}

.premiere-categories-carousel {
  width: 100%;
  position: relative;
  background-color: var(--v-background);
  z-index: 10;
  padding: 8px 0;
  transition: box-shadow 0.3s ease;
}

.premiere-categories-carousel.sticky {
  position: fixed;
  top: v-bind('props.stickyOffset + "px"');
  left: 0;
  right: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 8px 16px;
}

.carousel-container {
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
}

.carousel-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.category-chip {
  margin-right: 8px;
  white-space: nowrap;
  font-weight: 500;
}

/* Make the chip group scrollable */
:deep(.v-chip-group) {
  flex-wrap: nowrap;
  padding: 8px 0;
}
</style>
