<template>
  <div class="talent-search">
    <v-text-field
      v-model="searchQuery"
      placeholder="Search for talents..."
      variant="outlined"
      density="comfortable"
      hide-details
      clearable
      prepend-inner-icon="mdi-magnify"
      @update:model-value="debouncedSearch"
      :loading="loading"
    ></v-text-field>

    <div v-if="loading" class="mt-2">
      <v-progress-linear indeterminate color="primary"></v-progress-linear>
    </div>

    <div v-else-if="searchResults.length > 0" class="search-results mt-2">
      <v-chip-group column class="talent-chips">
        <v-chip
          v-for="talent in searchResults"
          :key="talent.id"
          variant="elevated"
          size="large"
          class="talent-chip text-body-2"
          @click="selectTalent(talent)"
        >
          {{ talent.name }}
          <template v-if="talent.category" #prepend>
            <v-avatar size="x-small" color="primary" class="mr-1">
              {{ talent.category.name.charAt(0) }}
            </v-avatar>
          </template>
        </v-chip>
      </v-chip-group>
    </div>

    <div v-else-if="searchQuery && !loading && searchPerformed" class="mt-2">
      <v-alert type="info" variant="tonal" density="compact">
        No talents found matching "{{ searchQuery }}"
      </v-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import debounce from 'lodash/debounce'

interface TalentCategory {
  id: number
  name: string
  slug: string
  avatar_url?: string | null
}

interface Talent {
  id: number
  name: string
  slug?: string
  description?: string
  avatar_url?: string | null
  category_id: number
  category?: TalentCategory
}

const props = defineProps({
  minSearchLength: {
    type: Number,
    default: 2,
  },
})

const emit = defineEmits(['talent-selected'])

const searchQuery = ref('')
const loading = ref(false)
const searchResults = ref<Talent[]>([])
const searchPerformed = ref(false)
const { $axios } = useNuxtApp()

const searchTalents = async () => {
  if (!searchQuery.value || searchQuery.value.length < props.minSearchLength) {
    searchResults.value = []
    return
  }

  loading.value = true
  searchPerformed.value = true

  try {
    const response = await $axios.get('/api/talents/search', {
      params: {
        search: searchQuery.value,
        limit: 10,
      },
    })

    if (response.data && response.data.success) {
      searchResults.value = response.data.data
    } else {
      searchResults.value = []
    }
  } catch (error) {
    console.error('Error searching talents:', error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const debouncedSearch = debounce(searchTalents, 300)

const selectTalent = (talent: Talent) => {
  emit('talent-selected', talent)
  searchQuery.value = ''
  searchResults.value = []
}

// Clear results when search is cleared
watch(searchQuery, (newVal) => {
  if (!newVal) {
    searchResults.value = []
    searchPerformed.value = false
  }
})
</script>

<style scoped>
.talent-search {
  width: 100%;
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
}

.talent-chips {
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.talent-chip {
  margin: 4px;
  transition: all 0.2s ease;
  font-weight: 500;
  min-height: 36px !important;
  padding: 0 16px;
}

.talent-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
</style>
