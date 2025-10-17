<!-- components/search/PageSearch.vue -->
<template>
  <div class="page-search">
    <v-card>
      <v-card-text>
        <!-- Search Input -->
        <v-text-field
          v-model="searchQuery"
          :loading="searchStore.isLoading"
          :disabled="searchStore.isLoading"
          density="comfortable"
          variant="outlined"
          placeholder="Search pages by name..."
          hide-details
          clearable
          @update:model-value="handleSearch"
          @keyup.enter="handleEnterKey"
          @click:clear="handleClear"
        >
          <template #prepend>
            <v-icon
              :color="searchQuery ? 'primary' : undefined"
              icon="mdi-magnify"
            />
          </template>
        </v-text-field>

        <!-- Recent Searches -->
        <div v-if="showRecentSearches" class="recent-searches mt-2">
          <div class="d-flex align-center justify-space-between">
            <div class="text-subtitle-2">Recent Searches</div>
            <v-btn
              variant="text"
              density="comfortable"
              size="small"
              @click="searchStore.clearRecentSearches"
            >
              Clear History
            </v-btn>
          </div>
          <v-list density="compact">
            <RecentSearchItem
              v-for="search in searchStore.recentSearches"
              :key="search.timestamp"
              :search="search"
              @select="handleRecentSearch"
            />
          </v-list>
        </div>

        <!-- Search Results -->
        <v-virtual-scroll
          v-if="searchStore.hasResults"
          :items="searchStore.pages"
          height="400"
          item-height="64"
        >
          <template #default="{ item: page }">
            <PageListItem :page="page" @select="selectPage" />
          </template>
        </v-virtual-scroll>

        <!-- Loading State -->
        <div v-if="searchStore.isLoading" class="pa-4">
          <v-skeleton-loader
            v-for="n in 3"
            :key="n"
            type="list-item-avatar"
            class="mb-2"
          />
        </div>

        <!-- Error State -->
        <v-alert
          v-if="searchStore.error"
          type="error"
          variant="tonal"
          class="mt-2"
        >
          {{ searchStore.error }}
          <template #append>
            <v-btn variant="text" @click="retrySearch"> Retry </v-btn>
          </template>
        </v-alert>

        <!-- No Results -->
        <v-alert
          v-if="searchStore.noResults && searchQuery"
          type="info"
          variant="tonal"
          class="mt-2"
        >
          No pages found for "{{ searchQuery }}"
        </v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { usePageSearchStore } from '@/stores/usePageSearchStore'
import type { Page } from '@/types/page'

interface Props {
  minSearchLength?: number
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  minSearchLength: 2,
  debounceMs: 300,
})

const emit = defineEmits<{
  (e: 'page-selected', page: Page): void
}>()

const searchStore = usePageSearchStore()
const searchQuery = ref('')

// Show recent searches when no active search
const showRecentSearches = computed(
  () =>
    !searchQuery.value &&
    !searchStore.isLoading &&
    searchStore.recentSearches.length > 0
)

// Debounced search function
const debouncedSearch = useDebounceFn(async (query: string) => {
  if (query.length >= props.minSearchLength) {
    await searchStore.searchPages(query)
  } else {
    searchStore.clearSearch()
  }
}, props.debounceMs)

// Handle search input
const handleSearch = (value: string) => {
  searchQuery.value = value
  debouncedSearch(value)
}

// Handle enter key
const handleEnterKey = () => {
  if (searchQuery.value.length >= props.minSearchLength) {
    searchStore.searchPages(searchQuery.value)
  }
}

// Handle recent search click
const handleRecentSearch = (query: string) => {
  searchQuery.value = query
  searchStore.searchPages(query)
}

// Clear search
const handleClear = () => {
  searchQuery.value = ''
  searchStore.clearSearch()
}

// Retry search
const retrySearch = () => {
  if (searchQuery.value) {
    searchStore.searchPages(searchQuery.value)
  }
}

// Select page
const selectPage = (page: Page) => {
  emit('page-selected', page)
}

// Get initials for avatar fallback
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<style scoped>
.page-search {
  max-width: 600px;
  margin: 0 auto;
}

/* Responsive styles */
@media (max-width: 600px) {
  .page-search {
    max-width: 100%;
    margin: 0;
  }
}
</style>
