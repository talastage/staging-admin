<!-- components/SearchBar.vue -->
<template>
  <div
    class="search-bar-wrapper"
    :class="{ 'is-mobile': isMobile, 'is-expanded': isExpanded }"
  >
    <!-- Mobile Search Icon Button -->
    <v-btn
      v-if="isMobile"
      icon="mdi-magnify"
      variant="text"
      size="small"
      color="primary"
      class="mobile-search-icon"
      @click="expandSearch"
    ></v-btn>

    <!-- Search Form -->
    <form
      v-show="!isMobile || isExpanded"
      @submit.prevent="performSearch"
      class="search-bar"
    >
      <v-text-field
        ref="searchInput"
        v-model="searchQuery"
        :placeholder="
          isMobile ? 'Search...' : 'Search videos, users, or projects'
        "
        :loading="searchStore.loading"
        :disabled="searchStore.loading"
        density="comfortable"
        variant="outlined"
        hide-details
        rounded
        clearable
        class="search-field"
        @click:clear="clearSearch"
        @keyup.enter="performSearch"
        @focus="handleFocus"
      >
        <!-- Back Button for Mobile -->
        <template v-slot:prepend-inner v-if="isMobile && isExpanded">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            size="small"
            @click="collapseSearch"
          ></v-btn>
        </template>

        <!-- Search Button -->
        <template v-slot:append-inner>
          <v-btn
            icon="mdi-magnify"
            variant="text"
            size="small"
            color="primary"
            @click="performSearch"
          ></v-btn>
        </template>
      </v-text-field>

      <!-- Recent Searches Dropdown -->
      <div
        v-if="showRecentSearches && recentSearches.length > 0"
        class="recent-searches"
      >
        <v-list density="compact">
          <v-list-subheader>Recent Searches</v-list-subheader>
          <v-list-item
            v-for="(search, index) in recentSearches"
            :key="index"
            @click="useRecentSearch(search)"
          >
            <template v-slot:prepend>
              <v-icon size="small">mdi-history</v-icon>
            </template>
            <v-list-item-title>{{ search }}</v-list-item-title>
            <template v-slot:append>
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click.stop="removeRecentSearch(index)"
              ></v-btn>
            </template>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="clearRecentSearches">
            <v-list-item-title class="text-caption text-center"
              >Clear Recent Searches</v-list-item-title
            >
          </v-list-item>
        </v-list>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from '#app'
import { useSearchApp } from '~/stores/useSearchApp'

// Router and Store setup
const router = useRouter()
const searchStore = useSearchApp()

// Constants
const MAX_RECENT_SEARCHES = 5
const RECENT_SEARCHES_KEY = 'recent-searches'

// Refs
const searchInput = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const isExpanded = ref(false)
const showRecentSearches = ref(false)
const recentSearches = ref<string[]>([])

// SSR-safe display detection
const isMobile = ref(false)
const isSmall = ref(false)

onMounted(() => {
  if (process.client) {
    const checkDisplay = () => {
      isMobile.value = window.innerWidth <= 960
      isSmall.value = window.innerWidth <= 600
    }
    checkDisplay()
    window.addEventListener('resize', checkDisplay)
  }
})

// Methods
const loadRecentSearches = () => {
  if (!process.client) return
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
    recentSearches.value = saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Error loading recent searches:', error)
    recentSearches.value = []
  }
}

const saveRecentSearches = () => {
  if (!process.client) return
  try {
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(recentSearches.value)
    )
  } catch (error) {
    console.error('Error saving recent searches:', error)
  }
}

const addToRecentSearches = (query: string) => {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return

  // Remove if exists and add to front
  recentSearches.value = [
    trimmedQuery,
    ...recentSearches.value.filter((item) => item !== trimmedQuery),
  ].slice(0, MAX_RECENT_SEARCHES)

  saveRecentSearches()
}

const removeRecentSearch = (index: number) => {
  recentSearches.value.splice(index, 1)
  saveRecentSearches()
}

const clearRecentSearches = () => {
  recentSearches.value = []
  localStorage.removeItem(RECENT_SEARCHES_KEY)
  showRecentSearches.value = false
}

const useRecentSearch = (query: string) => {
  searchQuery.value = query
  performSearch()
}

const performSearch = async () => {
  const trimmedQuery = searchQuery.value.trim()
  if (trimmedQuery) {
    // Add to recent searches before navigating
    addToRecentSearches(trimmedQuery)

    await router.push({
      path: '/search_results',
      query: { search_query: trimmedQuery },
    })

    if (isMobile.value) {
      collapseSearch()
    }
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  // Fixed: Check if the method exists before calling it
  if (
    searchStore.clearSearchResults &&
    typeof searchStore.clearSearchResults === 'function'
  ) {
    searchStore.clearSearchResults()
  }
  showRecentSearches.value = false
}

const expandSearch = () => {
  isExpanded.value = true
  nextTick(() => {
    searchInput.value?.focus()
  })
}

const collapseSearch = () => {
  isExpanded.value = false
  searchQuery.value = ''
  showRecentSearches.value = false
}

const handleFocus = () => {
  showRecentSearches.value = true
}

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  const searchBar = document.querySelector('.search-bar-wrapper')
  if (searchBar && !searchBar.contains(event.target as Node)) {
    showRecentSearches.value = false
    if (isMobile.value && isExpanded.value) {
      collapseSearch()
    }
  }
}

// Escape key handler
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    showRecentSearches.value = false
    if (isMobile.value && isExpanded.value) {
      collapseSearch()
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  loadRecentSearches()
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.search-bar-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
  transition: all 0.3s ease;

  &.is-mobile {
    padding: 0;
    width: 40px;

    .mobile-search-icon {
      display: flex;
    }

    .search-bar {
      display: none;
    }

    &.is-expanded {
      width: 100%;
      position: fixed;
      left: 0;
      top: 0;
      height: 70px;
      z-index: 1001;
      background: rgb(var(--v-theme-background));
      padding: 0 16px;
      display: flex;
      align-items: center;

      .mobile-search-icon {
        display: none;
      }

      .search-bar {
        display: block;
        width: 100%;
      }
    }
  }
}

.mobile-search-icon {
  display: none;
}

.search-bar {
  width: 100%;
  position: relative;

  .search-field {
    width: 100%;

    :deep(.v-field__input) {
      padding: 8px 12px;
      min-height: 40px;
    }

    :deep(.v-field__outline) {
      --v-field-border-width: 1px;
    }

    :deep(.v-field__append-inner) {
      padding-inline-start: 8px;
    }

    :deep(.v-field__prepend-inner) {
      padding-inline-end: 8px;
    }
  }
}

.recent-searches {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: rgb(var(--v-theme-background));
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1002;
  max-height: 400px;
  overflow-y: auto;

  .v-list-item {
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgb(var(--v-theme-surface-variant));
    }
  }

  @media (max-width: 959px) {
    position: fixed;
    left: 0;
    right: 0;
    margin: 0;
    border-radius: 0 0 8px 8px;
    top: 70px; // Adjust based on your header height
  }
}

// Improve mobile experience
@media (max-width: 959px) {
  .search-bar-wrapper {
    max-width: 100%;
  }
}

@media (max-width: 599px) {
  .search-bar-wrapper:not(.is-expanded) {
    padding: 0 8px;
  }
  
  .search-field {
    :deep(.v-field__input) {
      padding: 4px 8px !important;
      min-height: 36px !important;
    }
  }
  
  .search-bar-wrapper.is-expanded .search-bar {
    padding: 0 8px;
  }
}

// Optional: Add hover effect to the search field
:deep(.v-field:hover) {
  .v-field__outline {
    --v-field-border-width: 1.5px;
  }
}
</style>