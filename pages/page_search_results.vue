<!-- pages/page_search_results.vue -->
<template>
  <div class="search-results-page">
    <v-container>
      <!-- Search Header -->
      <div class="search-header mb-6">
        <h1 class="text-h4 mb-2">
          {{ getSearchTitle }}
        </h1>
        <div class="d-flex flex-wrap gap-2">
          <!-- Active Filters -->
          <v-chip
            v-for="(value, key) in activeFilters"
            :key="key"
            closable
            @click:close="removeFilter(key)"
          >
            {{ formatFilterLabel(key, value) }}
          </v-chip>
        </div>
      </div>

      <!-- Filters and Results Grid -->
      <v-row>
        <!-- Filters Sidebar -->
        <v-col cols="12" md="3">
          <v-card>
            <v-card-title>Filters</v-card-title>
            <v-card-text>
              <!-- Categories -->
              <v-select
                v-model="filters.category"
                :items="categories"
                label="Category"
                item-title="name"
                item-value="slug"
                clearable
                @update:modelValue="applyFilters"
              />

              <!-- Countries -->
              <v-select
                v-model="filters.country"
                :items="countries"
                label="Country"
                item-title="name"
                item-value="code"
                clearable
                @update:modelValue="applyFilters"
              />

              <!-- Verification Filter -->
              <v-switch
                v-model="filters.verified"
                label="Verified Only"
                @change="applyFilters"
              />

              <!-- Interests -->
              <v-combobox
                v-model="filters.interests"
                :items="interests"
                label="Interests"
                item-title="name"
                item-value="slug"
                multiple
                chips
                clearable
                @update:modelValue="applyFilters"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Results -->
        <v-col cols="12" md="9">
          <!-- Sort Options -->
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="text-body-1">{{ totalResults }} results found</div>
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              density="comfortable"
              hide-details
              class="sort-select"
              @update:modelValue="applyFilters"
            />
          </div>

          <!-- Loading State -->
          <v-skeleton-loader
            v-if="loading"
            type="card-list"
            :loading="loading"
          />

          <!-- Results List -->
          <template v-else>
            <v-card
              v-for="page in results"
              :key="page.id"
              :to="`/investors/${page.slug}`"
              class="mb-4"
            >
              <v-card-item>
                <template v-slot:prepend>
                  <v-avatar size="60" class="mr-4">
                    <v-img :src="page.avatar_url" />
                  </v-avatar>
                </template>

                <v-card-title>
                  {{ page.name }}
                  <v-icon
                    v-if="page.is_verified"
                    color="primary"
                    class="ml-2"
                    size="small"
                  >
                    mdi-check-decagram
                  </v-icon>
                </v-card-title>

                <v-card-subtitle>{{ page.tagline }}</v-card-subtitle>

                <template v-slot:append>
                  <div class="d-flex gap-2">
                    <v-chip
                      v-if="page.category"
                      size="small"
                      color="primary"
                      variant="outlined"
                    >
                      {{ page.category.name }}
                    </v-chip>
                    <v-chip v-if="page.country" size="small" variant="outlined">
                      {{ page.country.name }}
                    </v-chip>
                  </div>
                </template>
              </v-card-item>
            </v-card>

            <!-- Pagination -->
            <v-pagination
              v-if="totalPages > 1"
              v-model="currentPage"
              :length="totalPages"
              @update:modelValue="handlePageChange"
            />
          </template>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { $axios } = useNuxtApp()

// State
const loading = ref(false)
const results = ref([])
const totalResults = ref(0)
const currentPage = ref(1)
const perPage = ref(15)

// Filter and Sort Options
const filters = ref({
  query: '',
  category: null,
  country: null,
  verified: false,
  interests: [],
})

const sortBy = ref('relevance')
const sortOptions = [
  { title: 'Most Relevant', value: 'relevance' },
  { title: 'Newest', value: 'created_at' },
  { title: 'Name A-Z', value: 'name' },
  { title: 'Verified First', value: 'verified' },
]

// Computed
const totalPages = computed(() => Math.ceil(totalResults.value / perPage.value))

const activeFilters = computed(() => {
  return Object.entries(filters.value).reduce((acc, [key, value]) => {
    if (value && (typeof value !== 'object' || value.length > 0)) {
      acc[key] = value
    }
    return acc
  }, {})
})

const getSearchTitle = computed(() => {
  if (filters.value.query) {
    return `Search results for "${filters.value.query}"`
  }
  if (filters.value.category) {
    return `${filters.value.category} Pages`
  }
  return 'Search Results'
})

// Methods
const fetchResults = async () => {
  try {
    loading.value = true

    const { data } = await $axios.get('/api/pages/search', {
      params: {
        ...filters.value,
        sort_by: sortBy.value,
        page: currentPage.value,
        per_page: perPage.value,
      },
    })

    results.value = data.data
    totalResults.value = data.meta.total
  } catch (error) {
    console.error('Error fetching results:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  currentPage.value = 1
  router.push({
    query: {
      ...filters.value,
      sort: sortBy.value,
      page: currentPage.value,
    },
  })
}

const removeFilter = (key: string) => {
  if (Array.isArray(filters.value[key])) {
    filters.value[key] = []
  } else {
    filters.value[key] = null
  }
  applyFilters()
}

const handlePageChange = (page: number) => {
  router.push({
    query: {
      ...route.query,
      page,
    },
  })
}

const formatFilterLabel = (key: string, value: any) => {
  switch (key) {
    case 'query':
      return `Search: ${value}`
    case 'category':
      return `Category: ${value}`
    case 'country':
      return `Country: ${value}`
    case 'verified':
      return 'Verified Only'
    case 'interests':
      return `Interests: ${value.join(', ')}`
    default:
      return `${key}: ${value}`
  }
}

// Watch route changes
watch(
  () => route.query,
  (newQuery) => {
    // Update filters from URL
    filters.value = {
      query: newQuery.q || '',
      category: newQuery.category || null,
      country: newQuery.country || null,
      verified: newQuery.verified === 'true',
      interests: Array.isArray(newQuery.interests)
        ? newQuery.interests
        : newQuery.interests
        ? [newQuery.interests]
        : [],
    }
    sortBy.value = newQuery.sort || 'relevance'
    currentPage.value = Number(newQuery.page) || 1

    fetchResults()
  },
  { immediate: true }
)

// Initialize
onMounted(() => {
  // Initialize filters from URL
  if (Object.keys(route.query).length) {
    filters.value = {
      query: route.query.q || '',
      category: route.query.category || null,
      country: route.query.country || null,
      verified: route.query.verified === 'true',
      interests: Array.isArray(route.query.interests)
        ? route.query.interests
        : route.query.interests
        ? [route.query.interests]
        : [],
    }
    sortBy.value = route.query.sort || 'relevance'
    currentPage.value = Number(route.query.page) || 1
  }

  fetchResults()
})
</script>

<style scoped>
.search-results-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24px 0;
}

.sort-select {
  max-width: 200px;
}

.gap-2 {
  gap: 8px;
}
</style>
