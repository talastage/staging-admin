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
        <v-col cols="12" sm="4">
          <h1 class="text-h4 mb-0">Find Investors</h1>
        </v-col>
        <v-col cols="12" sm="8">
          <v-row>
            <!-- Country Filter -->
            <v-col cols="12" md="6">
              <v-select
                class="no-truncate"
                v-model="filters.country_id"
                :items="countries"
                item-title="name"
                item-value="id"
                label="Select Country"
                clearable
                density="comfortable"
                :loading="countryStore.loading"
                @update:model-value="handleFiltersChange"
              />
            </v-col>
            <!-- Talent Categories Filter -->
            <v-col cols="12" md="6">
              <v-select
                class="no-truncate"
                v-model="filters.talent_interests"
                :items="talentCategories"
                item-title="name"
                item-value="id"
                label="Talent Interests"
                multiple
                chips
                clearable
                density="comfortable"
                :loading="isLoadingTalentCategories"
                @update:model-value="handleFiltersChange"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </BaseCard>

    <!-- Content Section -->
    <!-- 1) Show skeletons if the infinite scroller is loading *and* we have no items yet -->
    <template v-if="infiniteLoading && items.length === 0">
      <v-row>
        <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4">
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>
    </template>
    <template v-else>
      <!-- 2) Show loaded items -->
      <PageGrid
        :pages="items"
        :loading="infiniteLoading"
        :pageType="'investor'"
      />

      <!-- 3) Show incremental skeletons if we are loading more while scrolling -->
      <template v-if="infiniteLoading && items.length > 0">
        <v-row>
          <v-col v-for="n in 3" :key="n" cols="12" sm="6" md="4">
            <v-skeleton-loader type="card" />
          </v-col>
        </v-row>
      </template>

      <!-- 4) Show "No more investors to load" once hasMore is false and we already have items -->
      <v-alert
        v-if="!hasMore && items.length > 0 && !infiniteLoading"
        type="info"
        text
        class="text-center my-4"
      >
        No more investors to load
      </v-alert>

      <!-- 5) Show "No investors found" if we have 0 items and are not loading -->
      <v-row v-if="items.length === 0 && !infiniteLoading" justify="center">
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCountryStore } from '~/stores/useCountries'
import { useTalentCategories } from '~/composables/useTalentCategories'
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'

// --- Type Definitions ---
interface Country {
  id: number
  name: string
}

interface TalentCategory {
  id: number
  name: string
}

interface Page {
  id: number
  name: string
  // Additional fields as provided by your API...
}

interface QueryParams {
  country_id?: number
  talent_interests?: number[]
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

// --- Stores & Composables ---
const countryStore = useCountryStore()
const {
  categories: talentCategories,
  isLoading: isLoadingTalentCategories,
  fetchCategories,
} = useTalentCategories()

// --- Filters State ---
const filters = reactive<QueryParams>({
  country_id: null,
  talent_interests: [],
  status: 'active',
})

// --- Computed for Countries ---
const countries = computed<Country[]>(() => countryStore.countries)

// --- Infinite Scroll Setup ---
const { $axios } = useNuxtApp()

// 1) The fetch function for pages using the current filters + page number
const fetchPagesInfinite = async (page: number): Promise<Page[]> => {
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
  return response.data.data as Page[]
}

// 2) Use the infinite scroll composable
const {
  items, // The array of loaded items
  isLoading: infiniteLoading,
  error,
  hasMore,
  refresh, // Resets and loads from page=1
} = useInfiniteScroll<Page>(fetchPagesInfinite, {
  threshold: 200,
  throttle: 300,
})

// --- URL Query Management ---
const updateQueryParams = (): void => {
  const query: Record<string, string> = {}
  if (filters.country_id) {
    query.country_id = String(filters.country_id)
  }
  if (filters.talent_interests && filters.talent_interests.length > 0) {
    query.talent_interests = filters.talent_interests.join(',')
  }
  router.replace({ query })
}

const initializeFromQuery = (): void => {
  const query = route.query
  if (query.country_id) {
    filters.country_id = Number(query.country_id)
  }
  if (query.talent_interests) {
    filters.talent_interests = String(query.talent_interests)
      .split(',')
      .map(Number)
      .filter(Boolean)
  }
}

// --- Filters Change Handler ---
const handleFiltersChange = (): void => {
  refresh() // Resets items & starts from page=1
  updateQueryParams()
}

// --- Lifecycle ---
onMounted(async () => {
  try {
    // 1) Fetch countries & categories
    await Promise.all([countryStore.fetchCountries(), fetchCategories()])

    // 2) Initialize from URL query
    initializeFromQuery()

    // 3) DO NOT call refresh() here again. The infinite scroll composable
    //    automatically calls loadMoreItems on mount => only one request.
    //    (This avoids the double-request.)
  } catch (err) {
    console.error('Error during initialization:', err)
  }
})

// --- Watch for Filter Changes ---
watch(
  () => [filters.country_id, filters.talent_interests],
  () => {
    handleFiltersChange()
  }
)
</script>

<style scoped>
.v-card {
  height: 100%;
}

.no-truncate :deep(.v-field__input) {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
}

.no-truncate :deep(.v-chip) {
  white-space: normal !important;
  height: auto !important;
  max-width: 100% !important;
}
</style>
