<!-- components/help/search/HelpSearchBar.vue -->
<template>
  <div class="search-bar-container">
    <v-card flat class="search-card pa-4">
      <form @submit.prevent="handleSearch" class="d-flex align-center">
        <v-text-field
          v-model="localSearchTerm"
          :error-messages="errors"
          :loading="isSearching"
          clearable
          hide-details="auto"
          variant="outlined"
          density="comfortable"
          placeholder="Search help articles..."
          @click:clear="handleClear"
          @input="debouncedSearch"
          @keydown.enter="handleSearch"
          class="flex-grow-1"
        >
          <template #append>
            <v-btn
              variant="text"
              icon="mdi-magnify"
              size="small"
              type="submit"
              :loading="isSearching"
              :disabled="!localSearchTerm || isSearching"
            />
          </template>
        </v-text-field>
      </form>
    </v-card>

    <!-- Results Container (Suggestions) -->
    <div v-if="showResults" class="search-results-container">
      <v-card class="search-results mx-0">
        <template v-if="isSearching">
          <v-list>
            <v-list-item v-for="n in 3" :key="n">
              <v-skeleton-loader type="list-item-two-line" />
            </v-list-item>
          </v-list>
        </template>

        <template v-else-if="results.length > 0">
          <v-list lines="two">
            <v-list-item
              v-for="result in results"
              :key="result.id"
              class="search-result-item"
              @click="goToSearchPage"
            >
              <template #prepend>
                <v-icon icon="mdi-help-circle-outline" color="primary" />
              </template>
              <v-list-item-title class="text-subtitle-2 font-weight-medium">
                {{ result.title }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                {{ result.category_name }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-divider v-if="totalResults > results.length" />

          <v-card-actions v-if="totalResults > results.length">
            <v-btn variant="text" block @click="goToSearchPage">
              View all {{ totalResults }} results
            </v-btn>
          </v-card-actions>
        </template>

        <template v-else-if="localSearchTerm">
          <div class="pa-4 text-center">
            <v-icon
              icon="mdi-file-search-outline"
              size="32"
              color="grey"
              class="mb-3"
            />
            <div class="text-subtitle-1 font-weight-medium mb-1">
              No results found
            </div>
            <div class="text-body-2 text-grey">
              Try different keywords or browse categories
            </div>
          </div>
        </template>
      </v-card>
    </div>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      {{ snackbar.text }}
      <template #actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useNuxtApp } from '#app'
import { useDebounceFn } from '@vueuse/core'

interface SearchResult {
  id: number
  title: string
  slug: string
  category_slug: string
  category_name: string
}

// State
const localSearchTerm = ref('')
const results = ref<SearchResult[]>([])
const totalResults = ref(0)
const isSearching = ref(false)
const showResults = ref(false)
const errors = ref<string[]>([])

// Snackbar state
const snackbar = ref({
  show: false,
  text: '',
  color: 'error',
})

// Router instance for navigation
const router = useRouter()

// Debounced search function
const debouncedSearch = useDebounceFn(async () => {
  if (localSearchTerm.value.length >= 2) {
    await performSearch()
  } else {
    // Clear suggestions if term is too short
    results.value = []
    totalResults.value = 0
    showResults.value = false
  }
}, 300)

// API call for suggestions
const performSearch = async () => {
  if (localSearchTerm.value.length < 2) {
    errors.value = ['Please enter at least 2 characters']
    return
  }

  isSearching.value = true
  errors.value = []

  try {
    const { $axios } = useNuxtApp()
    const { data } = await $axios.get('/api/help/search', {
      params: {
        q: localSearchTerm.value,
        limit: 5,
      },
    })

    results.value = data.data || []
    totalResults.value = data.total || 0
    showResults.value = true
  } catch (err) {
    console.error('Search error:', err)
    snackbar.value = {
      show: true,
      text: 'Failed to perform search',
      color: 'error',
    }
    results.value = []
    totalResults.value = 0
  } finally {
    isSearching.value = false
  }
}

// When the user submits the form, navigate to the dedicated search page.
const handleSearch = async (event: Event) => {
  if (event) {
    event.preventDefault()
  }

  if (!localSearchTerm.value) {
    errors.value = ['Please enter a search term']
    return
  }

  // Ensure suggestions are fetched
  await performSearch()
  goToSearchPage()
}

// Navigate to the full search results page.
const goToSearchPage = () => {
  router.push({
    path: '/help/search',
    query: { q: localSearchTerm.value },
  })
  hideResults()
}

// Clear search state
const handleClear = () => {
  localSearchTerm.value = ''
  results.value = []
  totalResults.value = 0
  showResults.value = false
  errors.value = []
}

// Hide inline results dropdown
const hideResults = () => {
  showResults.value = false
}

// Click outside handler to hide results
const handleClickOutside = (event: MouseEvent) => {
  const container = document.querySelector('.search-bar-container')
  if (container && !container.contains(event.target as Node)) {
    hideResults()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  handleClear()
})
</script>

<style scoped>
.search-bar-container {
  position: relative;
  width: 100%;
  z-index: 100;
}

.search-card {
  position: relative;
  margin-bottom: 4px;
}

.search-results-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.search-result-item {
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: rgb(var(--v-theme-surface-variant));
}

@media (max-width: 600px) {
  .search-results-container {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
    background: white;
  }

  .search-results {
    max-height: 80vh;
    border-radius: 16px 16px 0 0;
  }
}
</style>
