<template>
  <div class="recommended-category-projects">
    <div class="component-wrapper trending-projects-wrapper">
      <HomeTrendingProjectsCarousel />
    </div>
    <div class="component-wrapper trending-projects-wrapper">
      <HomeUpcomingProjectsCarousel />
    </div>
    <ProjectGrid
      :projects="displayedProjects"
      :is-loading="loading || initialLoading"
      :current-page="pagination.currentPage"
      :last-page="pagination.lastPage"
      :skeleton-count="8"
      variant="grid"
      @load-more="loadMoreProjects"
    >
      <!-- Custom empty state -->
      <template #empty-state>
        <div v-if="!initialLoading" class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">
            mdi-movie-open-off
          </v-icon>
          <p class="text-body-1">
            No recommended projects found
            {{ selectedCategory ? `in ${selectedCategory.name}` : '' }}.
          </p>
        </div>
      </template>
    </ProjectGrid>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { PremieringCategoryBase } from '~/types/PremieringCategoryBase'
import { usePremieringCategories } from '~/composables/premiering/usePremieringCategories'
import { useRecommendedProjects } from '~/composables/useRecommendedProjects'

const props = defineProps({
  title: {
    type: String,
    default: 'Latest Premieres',
  },
  premieringCategorySlug: {
    type: String,
    default: '',
  },
  debugMode: {
    type: Boolean,
    default: false,
  },
})

// Use the premiering categories composable for category data
const { categories, fetchCategories, getCategoryBySlug } =
  usePremieringCategories()

// Use the recommended projects composable for project data
const {
  recommendedProjects,
  currentCategoryProjects,
  selectedCategory,
  loading,
  initialLoading, // Add this
  pagination,
  fetchRecommendedProjects,
  fetchRecommendedProjectsByCategory,
  selectCategory,
  loadMoreProjects,
  resetState,
} = useRecommendedProjects()

// Computed property for displayed projects
const displayedProjects = computed(() => {
  return selectedCategory.value
    ? currentCategoryProjects.value
    : recommendedProjects.value
})

// Watch for changes to premieringCategorySlug prop
watch(
  () => props.premieringCategorySlug,
  async (newSlug) => {
    if (newSlug) {
      // Wait for categories to be loaded
      if (categories.value.length === 0) {
        await fetchCategories()
      }

      const category = getCategoryBySlug(newSlug)
      if (category) {
        await selectCategory(category)
      }
    }
  },
  { immediate: true }
)

// Initialize
onMounted(async () => {
  console.log('Premieres component mounted')

  // Fetch categories if not already loaded
  if (categories.value.length === 0) {
    await fetchCategories()
  }

  // If no category slug is provided, load all recommended projects
  if (!props.premieringCategorySlug) {
    console.log('Fetching all recommended projects')
    await fetchRecommendedProjects()
    console.log('Projects loaded:', recommendedProjects.value.length)
  }
})

// Clean up when component is unmounted
onUnmounted(() => {
  resetState()
})
</script>

<style scoped>
.recommended-category-projects {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: none;
}

.component-wrapper {
  width: 100%;
}

.debug-info {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}
</style>
