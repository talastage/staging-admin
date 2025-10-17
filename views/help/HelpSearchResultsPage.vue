<template>
  <v-container class="help-search-results-page">
    <!-- Loading State -->
    <template v-if="pending">
      <v-row>
        <v-col cols="12">
          <v-skeleton-loader type="heading" class="mb-4" />
          <v-skeleton-loader type="paragraph" class="mb-2" />
          <v-skeleton-loader type="paragraph" class="mb-2" />
        </v-col>
      </v-row>
    </template>

    <!-- Error State -->
    <template v-else-if="error">
      <v-row>
        <v-col cols="12" class="text-center py-12">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">
            mdi-alert-circle-outline
          </v-icon>
          <h3 class="text-h6 text-grey-darken-1">Search Error</h3>
          <p class="text-body-2 text-grey">
            An error occurred while fetching search results.
          </p>
          <v-btn color="primary" :to="'/help'" prepend-icon="mdi-arrow-left">
            Return to Help Center
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <!-- Content State -->
    <template v-else>
      <!-- Search Results Header -->
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 font-weight-bold mb-4">
            Search Results for "{{ searchQuery }}"
          </h1>
          <p class="text-body-1 text-grey-darken-1">
            Found {{ totalResults }} results
          </p>
        </v-col>
      </v-row>

      <!-- Results List -->
      <v-row>
        <v-col cols="12">
          <v-list lines="none">
            <HelpItem
              v-for="article in results"
              :key="article.id"
              :article="article"
            />
          </v-list>
        </v-col>
      </v-row>

      <!-- Pagination -->
      <v-row v-if="totalResults > perPage">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="7"
          />
        </v-col>
      </v-row>

      <!-- No Results -->
      <v-row v-if="results.length === 0">
        <v-col cols="12" class="text-center py-12">
          <v-icon
            icon="mdi-file-search-outline"
            size="64"
            color="grey"
            class="mb-3"
          />
          <div class="text-subtitle-1 font-weight-medium mb-1">
            No results found
          </div>
          <div class="text-body-2 text-grey">
            Try different keywords or browse categories
          </div>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'

/** Update interface to include 'category' property with a 'slug' */
interface SearchResult {
  id: number
  title: string
  slug: string
  description: string | null
  category: {
    slug: string
  }
}

// State
const route = useRoute()
const router = useRouter()
const searchQuery = ref(route.query.q?.toString() || '')
const results = ref<SearchResult[]>([])
const totalResults = ref(0)
const currentPage = ref(1)
const perPage = ref(10)
const pending = ref(true)
const error = ref(false)

// Computed properties
const totalPages = computed(() => Math.ceil(totalResults.value / perPage.value))

// Fetch search results
const fetchSearchResults = async () => {
  if (!searchQuery.value) {
    results.value = []
    totalResults.value = 0
    pending.value = false
    return
  }

  pending.value = true
  error.value = false

  try {
    const { get } = useApi()
    const response = await get<{
      data: SearchResult[]
      total: number
      current_page: number
      last_page: number
      per_page: number
    }>('/api/help/search', {
      params: {
        q: searchQuery.value,
        page: currentPage.value,
        limit: perPage.value,
      },
    })

    results.value = response.data
    totalResults.value = response.total
  } catch (err) {
    console.error('Failed to fetch search results:', err)
    error.value = true
  } finally {
    pending.value = false
  }
}

// Watchers
watch(currentPage, fetchSearchResults)

watch(
  () => route.query.q,
  (newQuery) => {
    searchQuery.value = newQuery?.toString() || ''
    currentPage.value = 1
    fetchSearchResults()
  },
  { immediate: true }
)
</script>

<style scoped>
.help-search-results-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
