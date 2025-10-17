<template>
  <v-container>
    <!-- Header Section -->
    <BaseHeader
      title="Become an Investor"
      subtitle="Invest in projects, earn from views, and grow your portfolio as an investor."
      margin-bottom="1.5rem"
    >
      <template #actionable>
        <BaseButton
          title="Become an Investor"
          :action="goToRegisterPage"
          color="primary"
        />
      </template>
    </BaseHeader>

    <!-- Title and Filters Section -->
    <BaseCard class="mb-4">
      <v-row align="center" no-gutters>
        <v-col cols="12" sm="12" md="5" lg="4" class="px-4 py-2">
          <h1 class="text-h4 text-sm-h4 text-md-h3 font-weight-bold mb-0">
            Find Investors for your project
          </h1>
        </v-col>
        <v-col cols="12" sm="12" md="7" lg="8" class="px-4 py-2">
          <!-- Country Filter using our modified CountrySelect component -->
          <CountrySelect
            v-model="filters.country_id"
            :countries="countries"
            :loading="countriesLoading"
            :disabled="isLoading"
            @update:model-value="handleFiltersChange"
          />
        </v-col>
      </v-row>
    </BaseCard>

    <!-- Content Section -->
    <!-- 1) Show skeletons if loading and we have no items yet -->
    <template v-if="isLoading && items.length === 0">
      <v-row>
        <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4">
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>
    </template>
    <template v-else>
      <!-- 2) Show loaded items -->
      <PageGrid :pages="items" :loading="isLoading" :pageType="'investor'" />

      <!-- 3) Show incremental skeletons if we are loading more while scrolling -->
      <template v-if="isLoading && items.length > 0">
        <v-row>
          <v-col v-for="n in 3" :key="n" cols="12" sm="6" md="4">
            <v-skeleton-loader type="card" />
          </v-col>
        </v-row>
      </template>

      <!-- Sentinel element for infinite loading -->
      <div ref="sentinelRef" class="sentinel" v-if="hasMoreItems"></div>

      <!-- 4) Show "No more investors to load" once hasMore is false and we already have items -->
      <v-alert
        v-if="!hasMoreItems && items.length > 0 && !isLoading"
        type="info"
        text
        class="text-center my-4"
      >
        No more investors to load
      </v-alert>

      <!-- 5) Show "No investors found" if we have 0 items and are not loading -->
      <v-row v-if="items.length === 0 && !isLoading" justify="center">
        <v-col cols="12">
          <v-alert
            type="info"
            text="No investors found matching your criteria."
          />
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInfiniteLoader } from '~/composables/useInfiniteLoader'

// --- Type Definitions ---
interface Page {
  id: number
  name: string
  // Additional fields as provided by your API...
}

interface Country {
  id: number
  name: string
  flag: string
  phone_code: string
  default?: boolean
}

interface QueryParams {
  country_id?: number | null
  status?: string
}

// --- Constants ---
const CATEGORY_SLUG = 'investor'
const PER_PAGE = 15

// --- Router & Navigation ---
const router = useRouter()
const route = useRoute()
const goToRegisterPage = (): void => {
  router.push('/investors/investor/register')
}

// --- Composables ---
const { $axios } = useNuxtApp()

// --- State ---
const items = ref<Page[]>([])
const hasMoreItems = ref(true)
const countries = ref<Country[]>([])
const countriesLoading = ref(false)

// --- Filters State ---
const filters = reactive<QueryParams>({
  country_id: null,
  status: 'active',
})

// --- Fetch Functions ---
// REFACTORED: Now uses the new API endpoint structure for fetching countries by category
const fetchCountries = async (): Promise<void> => {
  countriesLoading.value = true
  try {
    // Use the new endpoint that filters countries by category
    const response = await $axios.get(
      `/api/pages/category/${CATEGORY_SLUG}/countries`
    )
    countries.value = response.data.countries
  } catch (err) {
    console.error('Error fetching countries:', err)
  } finally {
    countriesLoading.value = false
  }
}

const fetchInvestors = async (page: number): Promise<void> => {
  const params: Record<string, any> = {
    ...filters,
    page,
    per_page: PER_PAGE,
  }

  // Remove empty filter parameters
  Object.keys(params).forEach((key) => {
    if (
      params[key] === null ||
      (Array.isArray(params[key]) && params[key].length === 0)
    ) {
      delete params[key]
    }
  })

  const response = await $axios.get(`/api/pages/category/${CATEGORY_SLUG}`, {
    params,
  })

  const newItems = response.data.data as Page[]

  if (page === 1) {
    // Replace all items if this is the first page
    items.value = newItems
  } else {
    // Append items for subsequent pages
    items.value = [...items.value, ...newItems]
  }

  // Check if we have more items to load
  hasMoreItems.value = newItems.length === PER_PAGE
}

// --- Use the infinite loader composable ---
const { sentinelRef, isLoading, initLoader } = useInfiniteLoader(
  fetchInvestors,
  hasMoreItems
)

// --- URL Query Management ---
const updateQueryParams = (): void => {
  const query: Record<string, string> = {}
  if (filters.country_id) {
    query.country_id = String(filters.country_id)
  }
  router.replace({ query })
}

const initializeFromQuery = (): void => {
  const query = route.query
  if (query.country_id) {
    filters.country_id = Number(query.country_id)
  }
}

// --- Filters Change Handler ---
const handleFiltersChange = (): void => {
  hasMoreItems.value = true
  initLoader() // Reset and reload from page 1
  updateQueryParams()
}

// --- Lifecycle ---
onMounted(async () => {
  try {
    // 1) Fetch countries
    await fetchCountries()

    // 2) Initialize from URL query
    initializeFromQuery()

    // 3) The useInfiniteLoader will call initLoader() automatically
    // because we've set immediate: true by default
  } catch (err) {
    console.error('Error during initialization:', err)
  }
})
</script>

<style scoped>

/* Improved responsive heading styles */
@media (max-width: 600px) {
  h1.text-h4 {
    font-size: 1.5rem !important;
    line-height: 1.2 !important;
    margin-bottom: 0.75rem !important;
  }
}

/* Sentinel element for intersection observer */
.sentinel {
  height: 10px;
  margin: 20px 0;
}
</style>
