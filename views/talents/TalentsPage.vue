<template>
  <v-container>
    <!-- Hero Section -->
    <v-card class="mb-6 bg-primary-lighten-5 border-0" elevation="10">
      <v-card-text class="py-6">
        <div
          class="d-flex flex-column flex-md-row align-center justify-space-between"
        >
          <div class="mb-4 mb-md-0">
            <h1 class="text-h4 font-weight-bold text-primary mb-2">
              Find Talented individuals
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              Discover skilled professionals from around the world. Connect with
              talents that match your needs and collaborate on exciting
              projects.
            </p>
          </div>
          <div>
            <RegisterTalentButton
              v-if="!hasTalent"
              variant="flat"
              color="primary"
              size="large"
              prepend-icon="mdi-account-plus"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>
    <!-- Filters Card -->
    <v-card class="mb-6" elevation="1">
      <v-card-text>
        <v-form @submit.prevent="applyFilters">
          <v-row>
            <v-col cols="12" sm="6">
              <CountrySelect
                v-model="filters.countryId"
                :countries="countries"
                :loading="isLoadingCountries"
                :disabled="isLoading"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <CategorySelect
                v-model="filters.categoryId"
                :categories="talentCategories"
                :loading="isLoadingCategories"
                :disabled="isLoading"
              />
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="12" class="d-flex justify-end align-center">
              <v-btn
                variant="text"
                class="me-2"
                :disabled="isLoading || !hasActiveFilters"
                @click="clearFilters"
              >
                Clear
              </v-btn>
              <v-btn
                type="submit"
                color="primary"
                class="px-6"
                :loading="isLoading"
                :disabled="isLoading"
              >
                <v-icon start>mdi-filter</v-icon>
                Apply Filters
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Filter Chips -->
    <div
      v-if="talents.length > 0 && (hasActiveFilters || searchTerm)"
      class="d-flex justify-end align-center mb-4"
    >
      <v-chip-group>
        <v-chip
          v-if="activeFilters.countryId"
          closable
          size="small"
          class="ml-2"
          @click:close="removeFilter('countryId')"
        >
          <v-icon start size="small">mdi-map-marker</v-icon>
          {{ activeFilters.countryId.name }}
        </v-chip>
        <v-chip
          v-if="activeFilters.categoryId"
          closable
          size="small"
          class="ml-2"
          @click:close="removeFilter('categoryId')"
        >
          <v-icon start size="small">mdi-tag</v-icon>
          {{ activeFilters.categoryId.name }}
        </v-chip>
        <v-chip
          v-if="searchTerm"
          closable
          size="small"
          class="ml-2"
          @click:close="clearSearch"
        >
          <v-icon start size="small">mdi-magnify</v-icon>
          {{ searchTerm }}
        </v-chip>
      </v-chip-group>
    </div>

    <!-- Talents Grid -->
    <TalentGrid
      :talents="talents"
      :is-loading="showSkeletonLoaders"
      :has-more-pages="hasMorePages"
      card-size="medium"
      @load-more="loadMore"
    >
      <template #empty-state>
        <v-responsive class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4"
            >mdi-account-search</v-icon
          >
          <h3 class="text-h5 mb-2">No Talents Found</h3>
          <p
            class="text-body-1 text-medium-emphasis mb-6 mx-auto"
            style="max-width: 500px"
          >
            We couldn't find any talents matching your current filters. Try
            adjusting your search criteria or explore other options.
          </p>
          <div class="d-flex flex-wrap justify-center gap-3">
            <v-btn color="primary" variant="outlined" @click="clearFilters">
              <v-icon start>mdi-refresh</v-icon>
              Reset Filters
            </v-btn>
            <register-talent-button
              v-if="shouldShowRegisterButton"
              variant="flat"
              color="primary"
              prepend-icon="mdi-account-plus"
            />
          </div>
        </v-responsive>
      </template>
    </TalentGrid>

    <!-- Sentinel element for infinite loading -->
    <div
      ref="sentinelRef"
      class="sentinel-element"
      v-if="hasMorePages && !isLoading && !isInitialLoading"
    ></div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useUserTalentState } from '@/composables/useUserTalentState'
import { useInfiniteLoader } from '@/composables/useInfiniteLoader'

// Components
import CountrySelect from '@/components/forms/select/CountrySelect.vue'
import CategorySelect from '@/components/forms/select/CategorySelect.vue'
import SearchInput from '@/components/search/SearchInput.vue'
import TalentGrid from '@/components/talent/TalentGrid.vue'

// Get axios instance
const { $axios } = useNuxtApp()

// State
const countries = ref([])
const talentCategories = ref([])
const isLoadingCountries = ref(false)
const isLoadingCategories = ref(false)
const isSearching = ref(false)
const searchTerm = ref('')
const meta = ref(null)
const talents = ref([])
const isInitialLoading = ref(true) // Track initial data loading state
const { hasTalent, isTalentUndecided } = useUserTalentState()

// Filter state
interface FilterItem {
  id: number
  name: string
  [key: string]: any
}

interface FilterState {
  countryId: FilterItem | null
  categoryId: FilterItem | null
}

const filters = reactive<FilterState>({
  countryId: null,
  categoryId: null,
})

const activeFilters = reactive<FilterState>({
  countryId: null,
  categoryId: null,
})

// Computed properties
const shouldShowRegisterButton = computed(() => {
  return !hasTalent.value || isTalentUndecided.value
})

const hasActiveFilters = computed(() => {
  return !!activeFilters.countryId || !!activeFilters.categoryId
})

const hasMorePages = computed(() => {
  if (!meta.value) return false
  return meta.value.current_page < meta.value.last_page
})

// Fetch countries
const fetchCountries = async () => {
  if (countries.value.length > 0) return

  isLoadingCountries.value = true
  try {
    const response = await $axios.get('/api/talents/countries')
    if (response.data && response.data.countries) {
      countries.value = response.data.countries
    }
  } catch (error) {
    console.error('Error fetching countries:', error)
  } finally {
    isLoadingCountries.value = false
  }
}

// Fetch categories
const fetchCategories = async () => {
  if (talentCategories.value.length > 0) return

  isLoadingCategories.value = true
  try {
    const response = await $axios.get('/api/talents/categories')
    if (response.data && response.data.categories) {
      talentCategories.value = response.data.categories
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
  } finally {
    isLoadingCategories.value = false
  }
}

// Fetch talents with filters
const fetchTalents = async (page: number) => {
  const params: Record<string, any> = {
    page,
    per_page: 12,
  }

  if (activeFilters.countryId) {
    params.country_id = activeFilters.countryId.id
  }

  if (activeFilters.categoryId) {
    params.category_id = activeFilters.categoryId.id
  }

  if (searchTerm.value) {
    params.search = searchTerm.value
  }

  try {
    const response = await $axios.get('/api/talents', {
      params,
      timeout: 8000,
    })

    if (response && response.data) {
      meta.value = response.data.meta || null

      const newTalents = response.data.data || []

      if (page === 1) {
        talents.value = newTalents
      } else {
        talents.value = [...talents.value, ...newTalents]
      }
    }
  } catch (error) {
    console.error('Error fetching talents:', error)
  }
}

// Initialize infinite loader
const { sentinelRef, isLoading, initLoader, loadNextPage } = useInfiniteLoader(
  fetchTalents,
  hasMorePages,
  { immediate: false } // Prevent auto-loading on mount
)

// Computed property to determine when to show skeleton loaders
const showSkeletonLoaders = computed(() => {
  return isInitialLoading.value || isLoading.value
})

// Methods
const applyFilters = () => {
  activeFilters.countryId = filters.countryId ? { ...filters.countryId } : null
  activeFilters.categoryId = filters.categoryId
    ? { ...filters.categoryId }
    : null

  // Reset and reload
  talents.value = []
  isInitialLoading.value = true
  initLoader().finally(() => {
    isInitialLoading.value = false
  })
}

const removeFilter = (filterName: keyof FilterState) => {
  filters[filterName] = null
  activeFilters[filterName] = null

  // Reset and reload
  talents.value = []
  isInitialLoading.value = true
  initLoader().finally(() => {
    isInitialLoading.value = false
  })
}

const clearFilters = () => {
  filters.countryId = null
  filters.categoryId = null
  activeFilters.countryId = null
  activeFilters.categoryId = null
  searchTerm.value = ''

  // Reset and reload
  talents.value = []
  isInitialLoading.value = true
  initLoader().finally(() => {
    isInitialLoading.value = false
  })
}

const handleSearch = () => {
  isSearching.value = true
  isInitialLoading.value = true
  talents.value = []
  initLoader().finally(() => {
    isSearching.value = false
    isInitialLoading.value = false
  })
}

const clearSearch = () => {
  searchTerm.value = ''
  if (hasActiveFilters.value) {
    talents.value = []
    isInitialLoading.value = true
    initLoader().finally(() => {
      isInitialLoading.value = false
    })
  }
}

// Load more function for TalentGrid
const loadMore = () => {
  if (!isLoading.value && hasMorePages.value) {
    loadNextPage()
  }
}

// Watch for search term changes with debounce
let searchTimeout: NodeJS.Timeout | null = null
watch(searchTerm, (newValue) => {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (!newValue) {
    clearSearch()
    return
  }

  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 500)
})

// Initial setup
onMounted(async () => {
  isInitialLoading.value = true
  try {
    // Fetch initial data in parallel
    await Promise.all([fetchCountries(), fetchCategories()])

    // Manually initialize the loader after fetching initial data
    await initLoader()
  } catch (error) {
    console.error('Error fetching initial data:', error)
  } finally {
    isInitialLoading.value = false
  }
})
</script>

<style scoped>
.hero-section {
  padding: 2rem 0;
}

.sentinel-element {
  height: 20px;
  width: 100%;
  margin-top: 20px;
}
</style>
