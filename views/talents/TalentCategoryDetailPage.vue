<template>
  <div>
    <!-- Category Header -->
    <CategoryHeader v-if="category" :category="category" class="mb-5" />

    <!-- Filters Section -->
    <div class="filters-section mb-6">
      <h3 class="text-h6 mb-3">Find the perfect talent</h3>
      <v-row>
        <v-col cols="12" sm="6">
          <SelectCountry
            v-model="selectedCountry"
            label="Filter by location"
            hint="Find talent in specific countries"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <SelectTalent
            v-model="selectedTalent"
            :category="category"
            label="Specific talent"
            hint="Narrow down by specific skills"
          />
        </v-col>
      </v-row>
      <div class="d-flex justify-end mt-2">
        <v-btn
          v-if="hasActiveFilters"
          size="small"
          variant="text"
          color="primary"
          prepend-icon="mdi-filter-remove"
          @click="clearFilters"
        >
          Clear filters
        </v-btn>
      </div>
    </div>

    <!-- Loading State for Category -->
    <div v-if="isFetchingCategory">
      <v-alert type="info" variant="tonal" class="mb-4">
        Loading talent category information...
      </v-alert>
      <v-row>
        <v-col
          v-for="n in 12"
          :key="n"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          class="pa-2"
        >
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>
    </div>

    <!-- Results Section -->
    <div v-else>
      <UsersGrid :users="users" :isLoading="isLoading" :hasMore="hasMore" />
    </div>

    <!-- Infinite Scroll Trigger -->
    <div ref="infiniteScrollTrigger" class="infinite-scroll-trigger">
      <div
        v-if="hasMore && !isLoading"
        class="text-center py-4 text-body-2 text-medium-emphasis"
      >
        <v-icon size="small" class="me-1">mdi-gesture-swipe-up</v-icon>
        Scroll for more talent
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTalentCategoryStore } from '@/stores/useTalentCategories'
import { useTalentCategoryUsers } from '@/composables/useTalentCategoryUsers'

// Route and Slug
const route = useRoute()
const slug = computed(() => route.params.categorySlug as string)

// Store for Category
const talentCategoryStore = useTalentCategoryStore()
const isFetchingCategory = computed(
  () => talentCategoryStore.isFetchingCategory
)
const category = computed(() => talentCategoryStore.currentCategory)

// Composable for Users (assumed to include resetUsers)
const { users, isLoading, hasMore, loadMore, setFilters, resetUsers } =
  useTalentCategoryUsers(slug.value)

// Filter State
const selectedCountry = ref(null)
const selectedTalent = ref(null)

// Check for Active Filters
const hasActiveFilters = computed(
  () => selectedCountry.value !== null || selectedTalent.value !== null
)

// Clear Filters
const clearFilters = () => {
  selectedCountry.value = null
  selectedTalent.value = null
  resetUsers() // Reset user data
  setFilters({ country: null, talent: null })
}

// Watch Filters and Apply Them
watch(
  [selectedCountry, selectedTalent],
  () => {
    resetUsers() // Reset before applying new filters
    setFilters({
      country: selectedCountry.value?.id || null,
      talent: selectedTalent.value?.id || null,
    })
  },
  { deep: true }
)

// Watch Category Changes
watch(category, (newCategory) => {
  if (newCategory) {
    resetUsers() // Reset users for new category
    loadMore() // Start loading users
  }
})

// Infinite Scrolling Setup
const infiniteScrollTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// Initialize Data
async function initializeData() {
  try {
    await talentCategoryStore.fetchCategoryBySlug(slug.value)
    // Users will load via category watcher
  } catch (error) {
    console.error('Error initializing data:', error)
  }
}

// Lifecycle Hooks
onMounted(() => {
  resetUsers() // Reset on initial load
  initializeData()

  // Setup Infinite Scroll
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value && !isLoading.value) {
        loadMore()
      }
    },
    { threshold: 0.5 }
  )

  if (infiniteScrollTrigger.value) {
    observer.observe(infiniteScrollTrigger.value)
  }
})

onUnmounted(() => {
  if (observer && infiniteScrollTrigger.value) {
    observer.unobserve(infiniteScrollTrigger.value)
    observer = null
  }
})

// Watch Slug Changes
watch(slug, () => {
  talentCategoryStore.resetTalents()
  resetUsers() // Reset when category changes
  clearFilters()
  initializeData()
})
</script>

<style scoped>
.infinite-scroll-trigger {
  height: 40px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filters-section {
  background-color: rgba(var(--v-theme-surface-variant), 0.4);
  border-radius: 8px;
  padding: 16px;
}

.results-header {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  padding-bottom: 8px;
}

@media (max-width: 600px) {
  .filters-section {
    padding: 12px;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .results-header > div:last-child {
    margin-top: 8px;
  }
}
</style>
