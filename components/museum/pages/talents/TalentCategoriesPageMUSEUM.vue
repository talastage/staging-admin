<template>
  <v-container class="find-talents">
    <!-- Hero Section with CTA -->
    <v-card class="bg-lightprimary elevation-1 rounded-lg mb-8 header-card">
      <div class="px-4 px-sm-8 py-8 text-center">
        <h1 class="text-h3 font-weight-bold mb-3">
          Discover & Showcase Talent
        </h1>
        <p
          class="text-subtitle-1 text-medium-emphasis mb-6 mx-auto"
          style="max-width: 700px"
        >
          Connect with choreographers, directors, actors, and more for your
          creative projects
        </p>

        <!-- CTA Buttons -->
        <div class="d-flex flex-column flex-sm-row justify-center gap-4 mb-8">
          <v-btn
            color="primary"
            size="large"
            class="px-6 py-3"
            elevation="2"
            :to="'/register/talent'"
          >
            <v-icon start>mdi-star-outline</v-icon>
            Register Your Talent
          </v-btn>
          <v-btn
            variant="outlined"
            color="secondary"
            size="large"
            class="px-6 py-3"
            @click="scrollToCategories"
          >
            <v-icon start>mdi-magnify</v-icon>
            Browse Talents
          </v-btn>
        </div>

        <!-- Popular category chips -->
        <div class="popular-categories-section">
          <p class="text-body-1 font-weight-medium mb-3">Popular Categories:</p>
          <div v-if="isLoadingPopular" class="text-center py-2">
            <v-progress-circular
              indeterminate
              size="24"
              width="2"
              color="primary"
            />
            <span class="ml-2">Loading popular categories...</span>
          </div>
          <div v-else-if="errorPopular" class="text-center text-error py-2">
            <v-icon color="error" class="mr-1">mdi-alert-circle</v-icon>
            {{ errorPopular }}
          </div>
          <div v-else class="d-flex justify-center flex-wrap">
            <CategoryChipGroup
              :categories="popularCategories"
              color="primary"
              variant="outlined"
              show-count
              @click="handleCategorySelect"
            >
              <template #default="{ category }">
                {{ category.name }}
                <span
                  v-if="category.user_talents_count"
                  class="ml-1 text-caption"
                >
                  ({{ category.user_talents_count }})
                </span>
              </template>
            </CategoryChipGroup>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Categories Section -->
    <div ref="categoriesSection">
      <v-row>
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <h2 class="text-h5 font-weight-medium">Browse All Categories</h2>
          <v-btn
            variant="text"
            color="primary"
            :to="'/register/talent'"
            class="text-none"
          >
            Have a talent? Register now
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <!-- 1) Skeletons: show if initially loading & no data -->
      <div v-if="isInitialLoading && !categories.length" class="skeleton-grid">
        <v-row>
          <v-col
            v-for="n in 16"
            :key="'skeleton-' + n"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            class="pa-2"
          >
            <CategoryCardSkeleton />
          </v-col>
        </v-row>
      </div>

      <!-- 2) Error: show if there's an error & no data -->
      <div v-else-if="error && !categories.length" class="text-center py-8">
        <v-alert type="error" class="mx-auto" max-width="500">
          {{ error }}
          <template #append>
            <v-btn color="error" variant="text" @click="retry"> Retry </v-btn>
          </template>
        </v-alert>
      </div>

      <!-- 3) Category Grid: show if there's data -->
      <CategoryGrid
        v-else-if="categories.length"
        :categories="categories"
        @select="handleCategorySelect"
      />

      <!-- 4) Empty State: show last if not loading, no error, and no categories -->
      <div
        v-else
        class="text-center py-8 text-medium-emphasis"
        style="min-height: 200px"
      >
        <v-icon
          size="48"
          color="grey-lighten-1"
          icon="mdi-folder-open-outline"
        />
        <h3 class="text-h6 mt-4">No Categories Found</h3>
        <p class="text-body-1">
          There are no categories available at the moment.
        </p>
      </div>

      <!-- Loading More Indicator -->
      <div
        v-if="isLoadingMore && categories.length > 0"
        class="text-center py-4"
      >
        <v-progress-circular
          indeterminate
          size="32"
          width="3"
          color="primary"
        />
        <div class="mt-2">Loading more categories...</div>
      </div>

      <!-- End of List Message with CTA -->
      <div
        v-if="!hasMore && categories.length > 0 && !isLoadingMore"
        class="text-center py-6 mt-4"
      >
        <p class="text-medium-emphasis mb-4">You've seen all categories</p>
        <v-card
          class="pa-4 bg-surface-variant mx-auto"
          max-width="600"
          rounded="lg"
        >
          <p class="font-weight-medium mb-3">Ready to showcase your talent?</p>
          <v-btn
            color="primary"
            size="large"
            :to="'/register/talent'"
            class="px-6"
          >
            Register Your Talent Now
          </v-btn>
        </v-card>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTalentCategories } from '@/composables/useTalentCategories'
import { useTalentCategoryStore } from '@/stores/useTalentCategories'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import type { TalentCategory } from '@/types/categories'

const router = useRouter()
const store = useTalentCategoryStore()
const categoriesSection = ref(null)

// Computed store state
const categories = computed(() => store.categories)
const error = computed(() => store.error)
const hasMore = computed(() => store.hasMorePages)

// Popular categories from composable
const {
  popularCategories,
  isLoadingPopular,
  errorPopular,
  fetchPopularCategories,
} = useTalentCategories()

// Loading states
const isInitialLoading = ref(false)
const isLoadingMore = ref(false)

// Scroll to categories section
const scrollToCategories = () => {
  if (categoriesSection.value) {
    ;(categoriesSection.value as HTMLElement).scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

// Setup infinite scroll
const fetchCategoriesPage = async (page: number) => {
  try {
    return await store.fetchCategories(page, page === 1)
  } catch (err) {
    console.error('Error fetching categories:', err)
    return []
  }
}
const infiniteScroll = useInfiniteScroll(fetchCategoriesPage, {
  threshold: 200,
  initialLoadDelay: 0,
})

// Keep infiniteScroll items in sync with store
watch(
  () => store.categories,
  (newVal) => {
    infiniteScroll.items.value = newVal
  },
  { immediate: true }
)

// Set isLoadingMore if store is fetching & we already have data
watch(
  () => store.isFetching,
  (fetching) => {
    isLoadingMore.value = fetching && store.categories.length > 0
  },
  { immediate: true }
)

// If store error changes, reflect in infinite scroll error
watch(
  () => store.error,
  (errMsg) => {
    infiniteScroll.error.value = errMsg ? new Error(errMsg) : null
  },
  { immediate: true }
)

// Handle category select
const handleCategorySelect = (category: TalentCategory) => {
  if (category.slug) {
    router.push(`/talents/${category.slug}`)
  } else {
    console.warn(`Category "${category.name}" does not have a valid slug.`)
  }
}

// Retry logic
const retry = async () => {
  infiniteScroll.reset()
  isInitialLoading.value = true
  try {
    store.resetCategories()
    await store.fetchCategories(1, true)
    await fetchPopularCategories()
  } catch (err) {
    console.error('Error during retry:', err)
  } finally {
    isInitialLoading.value = false
  }
}

// Initial load
onMounted(async () => {
  isInitialLoading.value = true
  try {
    await Promise.all([
      store.fetchCategories(1, true),
      fetchPopularCategories(),
    ])
  } catch (err) {
    console.error('Error on initial load:', err)
  } finally {
    isInitialLoading.value = false
  }
})
</script>

<style scoped>
.find-talents {
  min-height: 100vh;
}

.header-card {
  background: linear-gradient(
    to right,
    rgba(var(--v-theme-primary), 0.08),
    rgba(var(--v-theme-secondary), 0.08)
  );
  border-radius: 16px;
  margin-top: 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  animation: fadeIn 0.6s ease-out;
}

.popular-categories-section {
  padding-top: 1rem;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.skeleton-grid {
  min-height: 400px;
}
</style>
