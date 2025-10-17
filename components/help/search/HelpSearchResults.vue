// components/help/search/HelpSearchBar.vue
<template>
  <v-card flat class="search-card pa-4">
    <form @submit.prevent="handleSearch" class="d-flex align-center">
      <v-text-field
        v-model="searchStore.searchTerm"
        :loading="searchStore.isSearching"
        :disabled="searchStore.isSearching"
        :error-messages="errors"
        clearable
        hide-details="auto"
        variant="outlined"
        density="comfortable"
        placeholder="Search help articles..."
        @click:clear="clearSearch"
        class="flex-grow-1"
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-magnify"
            size="small"
            type="submit"
            :loading="searchStore.isSearching"
            :disabled="!searchStore.searchTerm || searchStore.isSearching"
          />
        </template>
      </v-text-field>
    </form>

    <v-menu
      v-model="showQuickResults"
      :close-on-content-click="false"
      :activator="'parent'"
      location="bottom"
      transition="scale-transition"
      max-width="600"
      min-width="300"
    >
      <HelpSearchResults
        v-if="searchStore.hasResults || searchStore.isSearching"
        :show-view-all="searchStore.hasMoreResults"
        :is-preview="true"
        @close="showQuickResults = false"
      />
      <HelpSearchEmpty
        v-else-if="searchStore.searchTerm && !searchStore.isSearching"
      />
    </v-menu>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const searchStore = useHelpSearch()
const showQuickResults = ref(false)
const errors = ref<string[]>([])

const handleSearch = async (event?: Event) => {
  event?.preventDefault()

  if (!searchStore.searchTerm) {
    errors.value = ['Please enter a search term']
    return
  }

  if (searchStore.searchTerm.length < 2) {
    errors.value = ['Please enter at least 2 characters']
    return
  }

  errors.value = []
  showQuickResults.value = true
  await searchStore.performSearch({ limit: 5 })
}

const clearSearch = () => {
  searchStore.clearSearch()
  showQuickResults.value = false
  errors.value = []
}

watch(() => searchStore.searchTerm, (newVal) => {
  errors.value = []
  if (!newVal) {
    clearSearch()
  }
})

onBeforeUnmount(() => {
  clearSearch()
})
</script>

<style scoped>
.search-card {
  position: relative;
  margin-bottom: 24px;
}

:deep(.v-field__append-inner) {
  padding-inline-start: 0;
}

:deep(.v-menu__content) {
  max-height: 80vh !important;
}
</style>