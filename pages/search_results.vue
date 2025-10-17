<template>
  <div>
    <SearchResultsPage />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { useSearchApp } from '~/stores/useSearchApp'
import { computed, onMounted } from 'vue'
import { PAGE_WIDTHS } from '~/constants/layouts'
import { useSeo } from '@/composables/seo/useSeo'
import { useRoute } from '#app'

definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
})

const route = useRoute()
const query = computed(() => (route.query.search_query as string) || '')

// Fetch app and search data on mount
const appsStore = useAppsStore()
const searchStore = useSearchApp()
onMounted(async () => {
  await Promise.all([appsStore.fetchTalaStageApp()])
})
const talastageApp = computed(() => appsStore.talastageApp)

// Computed values for SEO
const pageTitle = computed(() =>
  query.value
    ? `Search Results for '${query.value}' - ${
        talastageApp.value?.name || 'TalaStage'
      }`
    : `Search - ${talastageApp.value?.name || 'TalaStage'}`
)

const pageDescription = computed(() => {
  if (!query.value)
    return `Search for talents and projects on ${
      talastageApp.value?.name || 'TalaStage'
    }`

  const totalResults =
    (searchStore.searchResults?.projects?.total || 0) +
    (searchStore.searchResults?.users?.total || 0)
  return `Found ${totalResults} results for '${query.value}' - ${
    searchStore.searchResults?.users?.total || 0
  } talents and ${
    searchStore.searchResults?.projects?.total || 0
  } projects on ${talastageApp.value?.name || 'TalaStage'}`
})

// SEO Configuration using our composable
useSeo({
  title: pageTitle,
  description: pageDescription,
  keywords: computed(
    () => `search, results, talents, projects, opportunities, ${query.value}`
  ),
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogImage: computed(
    () => talastageApp.value?.logo_url || '/default-social-image.png'
  ),
  ogUrl: computed(
    () =>
      `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/search-results${
        query.value ? `?search_query=${encodeURIComponent(query.value)}` : ''
      }`
  ),
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: computed(
    () => talastageApp.value?.logo_url || '/default-social-image.png'
  ),
  noIndex: true, // Don't index search results pages
  link: computed(() => [
    {
      rel: 'canonical',
      href: computed(
        () =>
          `${
            talastageApp.value?.canonical_url || 'https://talastage.com'
          }/search-results${
            query.value
              ? `?search_query=${encodeURIComponent(query.value)}`
              : ''
          }`
      ).value,
    },
  ]),
})
</script>
