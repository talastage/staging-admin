<template>
  <v-card class="investor-search" flat>
    <v-card-text>
      <v-autocomplete
        v-model="selected"
        :loading="loading"
        :items="searchResults"
        :search-input.sync="searchQuery"
        @update:search="onSearchInput"
        :placeholder="placeholder"
        prepend-inner-icon="mdi-magnify"
        item-title="name"
        item-value="id"
        return-object
        hide-details
        variant="outlined"
        density="comfortable"
        clearable
        no-filter
        @click:clear="clearSearch"
        @update:model-value="onItemSelected"
      >
        <template v-slot:no-data>
          <v-list-item>
            <v-list-item-title>
              {{
                minSearchLength
                  ? `Type at least ${minSearchLength} characters to search`
                  : 'Start typing to search'
              }}
            </v-list-item-title>
          </v-list-item>
        </template>

        <template v-slot:item="{ item, props }">
          <v-list-item
            v-bind="props"
            :title="getItemTitle(item.raw)"
            :subtitle="getItemSubtitle(item.raw)"
          >
            <template v-slot:prepend>
              <v-avatar size="36" color="grey-lighten-3">
                <v-img
                  :src="getItemAvatar(item.raw)"
                  :alt="getItemTitle(item.raw)"
                />
              </v-avatar>
            </template>

            <template v-slot:append>
              <v-chip
                size="small"
                :color="item.raw.type === 'user' ? 'primary' : 'secondary'"
                text-color="white"
                class="ml-2"
              >
                {{ item.raw.type === 'user' ? 'User' : 'Page' }}
              </v-chip>
            </template>
          </v-list-item>
        </template>
      </v-autocomplete>
    </v-card-text>

    <v-dialog v-model="noResultsDialog" max-width="300">
      <v-card>
        <v-card-title class="text-h6">No Results Found</v-card-title>
        <v-card-text>
          No investors found matching your search criteria.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="noResultsDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="errorSnackbar" color="error" :timeout="3000">
      {{ errorMessage }}
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDebounce } from '~/composables/useDebounce'
import { useNuxtApp } from '#app'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search for investors by name',
  },
  minSearchLength: {
    type: Number,
    default: 2,
  },
  debounceMs: {
    type: Number,
    default: 300,
  },
  filterType: {
    type: String,
    default: null, // null means all types, 'user' or 'page' to filter
    validator: (value) => value === null || ['user', 'page'].includes(value),
  },
})

const emit = defineEmits(['user-selected', 'page-selected', 'item-selected'])

const { $axios } = useNuxtApp()
const { debounce } = useDebounce()

// Component state
const searchQuery = ref('')
const searchResults = ref([])
const selected = ref(null)
const loading = ref(false)
const noResultsDialog = ref(false)
const errorSnackbar = ref(false)
const errorMessage = ref('')
const hasSearched = ref(false) // Track if a search has been performed

// Perform the search with debounce
const onSearchInput = debounce(
  async (value) => {
    searchQuery.value = value

    if (!value || value.trim().length < props.minSearchLength) {
      searchResults.value = []
      hasSearched.value = false // Reset search state
      return
    }

    try {
      loading.value = true
      hasSearched.value = true // Mark that a search has been performed

      const response = await $axios.get('/api/search/investors', {
        params: {
          query: value.trim(),
          limit: 10,
          type: props.filterType,
        },
      })

      // Format and process results
      searchResults.value = response.data.data || []

      // Show no results dialog only if:
      // 1. A search was performed (with enough characters)
      // 2. No results were returned
      // 3. The dialog is not already open
      if (
        hasSearched.value &&
        searchResults.value.length === 0 &&
        value.trim().length >= props.minSearchLength &&
        !noResultsDialog.value
      ) {
        noResultsDialog.value = true
      } else if (searchResults.value.length > 0) {
        // Close the dialog if results are found
        noResultsDialog.value = false
      }
    } catch (error) {
      console.error('Search error:', error)
      errorMessage.value =
        error.response?.data?.message || 'An error occurred while searching'
      errorSnackbar.value = true
      searchResults.value = []
    } finally {
      loading.value = false
    }
  },
  props.debounceMs,
  'search'
)

// Handle item selection
const onItemSelected = (item) => {
  if (!item) return

  // Emit different events based on item type
  if (item.type === 'user') {
    emit('user-selected', item)
  } else {
    emit('page-selected', item)
  }

  // Also emit a generic event with the item type
  emit('item-selected', item)

  // Clear selection after emitting
  setTimeout(() => {
    selected.value = null
    searchQuery.value = ''
    // Reset search state
    hasSearched.value = false
  }, 100)
}

// Clear search
const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  selected.value = null
  hasSearched.value = false
  noResultsDialog.value = false // Ensure dialog is closed when clearing
}

// Helper to get avatar for search results
const getItemAvatar = (item) => {
  if (item.type === 'user') {
    return item.profile_photo || '/default-avatar.png'
  }
  return item.avatar_url || '/default-avatar.png'
}

// Helper to get title for search results
const getItemTitle = (item) => {
  if (item.type === 'user') {
    return item.name || item.display_name || item.username
  }
  return item.name || item.display_name || ''
}

// Helper to get subtitle for search results
const getItemSubtitle = (item) => {
  if (item.type === 'user') {
    return `@${item.username}`
  }
  return `@${item.slug}`
}

// Watch for empty search query to clear results
watch(searchQuery, (newVal) => {
  if (!newVal || newVal.trim() === '') {
    searchResults.value = []
    // Don't show no results dialog when query is cleared
    noResultsDialog.value = false
  }
})
</script>

<style scoped>
.investor-search {
  width: 100%;
}
</style>
