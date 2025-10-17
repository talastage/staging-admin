<!-- components/PageSearchBar.vue -->
<template>
  <div class="page-search-bar">
    <v-autocomplete
      v-model="selectedItem"
      :loading="loading"
      :items="suggestions"
      :search="searchItems"
      :filter="() => true"
      hide-no-data
      hide-selected
      placeholder="Search pages, categories, or interests..."
      prepend-inner-icon="mdi-magnify"
      clearable
      rounded
      return-object
      @update:search="handleSearchInput"
      @update:modelValue="handleSelection"
    >
      <!-- Custom item template -->
      <template v-slot:item="{ item, props }">
        <v-list-item
          v-bind="props"
          :title="item.raw.name"
          :subtitle="getItemSubtitle(item.raw)"
        >
          <template v-slot:prepend>
            <v-avatar
              v-if="item.raw.type === 'page'"
              size="40"
              :image="item.raw.avatar_url"
            />
            <v-icon v-else :icon="getItemIcon(item.raw.type)" class="mr-2" />
          </template>
        </v-list-item>
      </template>

      <!-- No results template -->
      <template v-slot:no-data>
        <v-list-item>
          <v-list-item-title>
            Press enter to search "{{ searchQuery }}"
          </v-list-item-title>
        </v-list-item>
      </template>

      <!-- Loading template -->
      <template v-slot:loading>
        <v-list-item>
          <v-list-item-title> Searching... </v-list-item-title>
        </v-list-item>
      </template>
    </v-autocomplete>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import debounce from 'lodash/debounce'

const router = useRouter()
const { $axios } = useNuxtApp()

// State
const loading = ref(false)
const searchQuery = ref('')
const suggestions = ref([])
const selectedItem = ref(null)

// Methods
const getItemIcon = (type: string) => {
  switch (type) {
    case 'category':
      return 'mdi-folder'
    case 'interest':
      return 'mdi-tag'
    default:
      return 'mdi-magnify'
  }
}

const getItemSubtitle = (item: any) => {
  switch (item.type) {
    case 'page':
      return item.tagline || ''
    case 'category':
      return 'Category'
    case 'interest':
      return 'Interest'
    default:
      return ''
  }
}

// Fetch suggestions from API
const fetchSuggestions = debounce(async (query: string) => {
  if (!query || query.length < 2) {
    suggestions.value = []
    return
  }

  try {
    loading.value = true
    const { data } = await $axios.get('/api/pages/search/suggestions', {
      params: { query },
    })

    // Format suggestions
    suggestions.value = [
      ...data.data.pages.map((page: any) => ({
        ...page,
        type: 'page',
      })),
      ...data.data.categories.map((category: any) => ({
        ...category,
        type: 'category',
      })),
      ...data.data.interests.map((interest: any) => ({
        ...interest,
        type: 'interest',
      })),
    ]
  } catch (error) {
    console.error('Error fetching suggestions:', error)
  } finally {
    loading.value = false
  }
}, 300)

// Handle search input
const handleSearchInput = (query: string) => {
  searchQuery.value = query
  if (query) {
    fetchSuggestions(query)
  }
}

// Handle selection
const handleSelection = (item: any) => {
  if (!item) return

  switch (item.type) {
    case 'page':
      router.push(`/investors/${item.slug}`)
      break
    case 'category':
    case 'interest':
      router.push({
        path: '/search',
        query: {
          [item.type]: item.slug,
        },
      })
      break
    default:
      // Handle direct search
      if (searchQuery.value) {
        router.push({
          path: '/search',
          query: { q: searchQuery.value },
        })
      }
  }

  // Reset after navigation
  selectedItem.value = null
  searchQuery.value = ''
}

// Handle enter key for direct search
const searchItems = (query: string) => {
  searchQuery.value = query
  return suggestions.value
}
</script>

<style scoped>
.page-search-bar {
  max-width: 600px;
  width: 100%;
}

:deep(.v-field) {
  border-radius: 24px !important;
}
</style>
