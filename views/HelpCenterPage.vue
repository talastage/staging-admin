<!-- views/HelpCenterPage.vue -->
<template>
  <div class="help-center">
    <!-- Hero section with search -->
    <v-container class="hero-section text-center py-8">
      <h1 class="text-h3 font-weight-bold mb-4">How can we help you?</h1>
      <!-- (Optional) If you want to add a search input here, you can. -->
    </v-container>

    <!-- Popular Articles Section -->

    <!-- Categories section -->
    <v-container>
      <h2 class="text-h5 font-weight-medium mb-4" v-if="!searchActive">
        Browse by Category
      </h2>
      <h2 class="text-h5 font-weight-medium mb-4" v-else>Search Results</h2>

      <v-row v-if="!categoriesStore.error">
        <!-- Normal categories (not loading) -->
        <template
          v-if="categoriesStore.categories.length && !categoriesStore.isLoading"
        >
          <v-col
            v-for="category in displayedCategories"
            :key="category.id"
            cols="12"
            sm="6"
            md="4"
          >
            <HelpCategoryItem
              :category="category"
              :is-loading="categoriesStore.isLoading"
              @select-category="handleCategorySelect"
            />
          </v-col>
        </template>

        <!-- Loading state -->
        <template
          v-if="categoriesStore.isLoading && !categoriesStore.categories.length"
        >
          <v-col v-for="i in 6" :key="i" cols="12" sm="6" md="4">
            <HelpSearchSkeleton />
          </v-col>
        </template>

        <!-- Empty state -->
        <v-col
          v-else-if="
            !categoriesStore.isLoading && !categoriesStore.categories.length
          "
          cols="12"
        >
          <v-card variant="outlined" class="pa-6 text-center">
            <v-icon
              icon="mdi-help-circle-outline"
              size="64"
              class="mb-4"
              color="grey"
            ></v-icon>
            <h3 class="text-h6 mb-2">No help articles found</h3>
            <p class="text-body-1 text-grey">
              {{
                searchActive
                  ? 'No results match your search. Try different keywords.'
                  : 'Help articles will appear here once they are available.'
              }}
            </p>
            <v-btn
              v-if="searchActive"
              color="primary"
              class="mt-4"
              @click="resetSearch"
            >
              Clear Search
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <!-- Error state -->
      <v-alert
        v-if="categoriesStore.error"
        type="error"
        variant="tonal"
        class="my-4"
      >
        {{ categoriesStore.error }}
        <template #append>
          <v-btn
            color="error"
            variant="text"
            @click="handleRetry"
            :loading="categoriesStore.isLoading"
          >
            Retry
          </v-btn>
        </template>
      </v-alert>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from '#imports'
import { useCategoriesStore } from '~/stores/help/categories'

// New reusable component that encapsulates the popular-articles logic
import HelpPopularArticles from '@/components/help/HelpPopularArticles.vue'

// Local state
const searchQuery = ref('')
const searchActive = ref(false)
const hasArticles = ref(false)

// Categories store
const categoriesStore = useCategoriesStore()
const router = useRouter()

// Computed property for filtered categories
const displayedCategories = computed(() => {
  if (!searchActive.value) {
    return categoriesStore.categories
  }

  const query = searchQuery.value.toLowerCase()
  return categoriesStore.categories.filter((category) => {
    // Example filter by category name or article titles
    if (category.name.toLowerCase().includes(query)) {
      return true
    }
    if (category.articles) {
      return category.articles.some((article) =>
        article.title.toLowerCase().includes(query)
      )
    }
    return false
  })
})

// Category selection
const handleCategorySelect = (category: any) => {
  router.push(`/help/${category.slug}`)
}

// Reset search
const resetSearch = () => {
  searchQuery.value = ''
  searchActive.value = false
}

// Retry categories
const handleRetry = () => {
  categoriesStore.fetchCategories()
}

// Check if any articles exist
const checkForArticles = () => {
  hasArticles.value = categoriesStore.categories.some(category => 
    category.articles && category.articles.length > 0
  )
}

// Initial fetch
onMounted(async () => {
  if (!categoriesStore.categories.length) {
    await categoriesStore.fetchCategories()
  }
  checkForArticles()
})

// Watch for categories changes
watch(() => categoriesStore.categories, () => {
  checkForArticles()
}, { deep: true })
</script>

<style scoped>
.help-center {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  background-color: var(--v-surface-variant);
  border-radius: 8px;
  margin-bottom: 2rem;
}

/* Example styling; adapt as needed */
</style>
