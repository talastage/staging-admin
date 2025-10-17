<template>
  <v-container class="help-category-page py-6">
    <!-- Category Header -->
    <div class="category-header-wrapper mb-6">
      <v-btn
        icon
        variant="text"
        size="small"
        @click="$router.push('/help')"
        class="back-button mb-4"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <HelpCategoryHeader :category="category" />
    </div>

    <!-- Loading State -->
    <v-row v-if="isLoading && !items.length">
      <v-col cols="12">
        <div class="text-center py-12">
          <v-progress-circular indeterminate size="64" color="primary" />
          <p class="text-body-2 text-medium-emphasis mt-4">Loading help articles...</p>
        </div>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert
          type="error"
          variant="tonal"
          class="mb-4"
          :text="error.message || 'Failed to load help articles'"
        />
        <div class="text-center">
          <v-btn color="primary" @click="refresh()">
            <v-icon start>mdi-refresh</v-icon>
            Try Again
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Content -->
    <template v-else>
      <!-- Articles Grid -->
      <v-row v-if="items.length > 0">
        <v-col
          v-for="article in items"
          :key="article.id"
          cols="12"
          md="6"
          lg="4"
        >
          <HelpItem
            :article="article"
            @click="navigateToArticle(article)"
          />
        </v-col>
      </v-row>

      <!-- Empty State -->
      <v-row v-else>
        <v-col cols="12">
          <div class="text-center py-12">
            <v-icon
              icon="mdi-clock-outline"
              size="64"
              color="primary"
              class="mb-4"
            />
            <h3 class="text-h6 text-medium-emphasis mb-2">
              No articles yet
            </h3>
            <p class="text-body-2 text-medium-emphasis">
              Articles for this category are coming soon. Check back later!
            </p>
          </div>
        </v-col>
      </v-row>

      <!-- Loading More Indicator -->
      <v-row v-if="isLoading && items.length > 0">
        <v-col cols="12">
          <div class="text-center py-4">
            <v-progress-circular indeterminate size="32" color="primary" />
            <p class="text-body-2 text-medium-emphasis mt-2">Loading more articles...</p>
          </div>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { PAGE_WIDTHS } from '@/constants/layouts'

// Define page metadata
definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'help-layout',
})

// Composables
const route = useRoute()
const router = useRouter()
const { $axios } = useNuxtApp()

// State
const category = ref(null)

// Get category slug from route
const categorySlug = computed(() => route.params.categorySlug as string)

// Infinite scroll setup
const fetchItems = async (page: number) => {
  try {
    const response = await $axios.get(`/api/help/categories/${categorySlug.value}`, {
      params: {
        page,
        per_page: 12,
      },
    })
    
    // Set category data on first load
    if (page === 1) {
      category.value = response.data.category
    }
    
    return response.data.helps || []
  } catch (err) {
    console.error('Error fetching category data:', err)
    throw err
  }
}

const { items, isLoading, error, hasMore, refresh, reset } = useInfiniteScroll(fetchItems, {
  threshold: 200,
  initialLoadDelay: 0,
})

const navigateToArticle = (article: any) => {
  if (article.sub_category) {
    router.push(`/help/${article.category.slug}/${article.sub_category.slug}/${article.slug}`)
  } else {
    router.push(`/help/${article.category.slug}/${article.slug}`)
  }
}

// Watch for route changes
watch(() => route.params.categorySlug, (newSlug) => {
  if (newSlug) {
    nextTick(() => {
      reset()
    })
  }
})

// Load data on mount
onMounted(async () => {
  await nextTick()
})

// SEO
useHead(() => ({
  title: category.value 
    ? `${category.value.name} - Help Center`
    : 'Help Center',
  meta: [
    {
      name: 'description',
      content: category.value?.description || 'Help Center documentation and guides',
    },
  ],
}))
</script>

<style scoped>
.help-category-page {
  max-width: 1200px;
  margin: 0 auto;
}

.category-header-wrapper {
  width: 100%;
}

.back-button {
  margin-left: 0;
}



@media (max-width: 960px) {
  .help-category-page {
    padding: 1rem;
  }
  
  .category-header {
    padding: 1.5rem;
  }
}

@media (max-width: 600px) {
  .category-header {
    padding: 1rem;
  }
  
  .search-section {
    max-width: 100%;
  }
}
</style>