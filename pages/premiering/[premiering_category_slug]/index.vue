<template>
  <PremieringCategoryPage />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'
import { PAGE_WIDTHS } from '~/constants/layouts'
import { useApi } from '~/composables/useApi'

// Define page metadata
definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM, // Adjust as needed for upload forms
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'default', // Or a specific layout for authenticated users if applicable
  middleware: ['auth'], // Assuming only authenticated users can access this page
})

// Access the route and apps store
const route = useRoute()
const appsStore = useAppsStore()

// State for the current premiering category
const premieringCategorySlug = computed(
  () => route.params.premiering_category_slug as string
)
const premieringCategoryData = ref<{
  name?: string
  seo_description?: string
  meta_keywords?: string
} | null>(null)

// Fetch app data on mount
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
  await fetchPremieringCategoryData()
})

// Fetch premiering category specific data (assuming an API endpoint exists)
const fetchPremieringCategoryData = async () => {
  if (premieringCategorySlug.value) {
    const { get } = useApi()
    try {
      const response = await get(
        `/api/premiering/categories/${premieringCategorySlug.value}`
      )
      premieringCategoryData.value = response.data
    } catch (error) {
      console.error('Error fetching premiering category data:', error)
      premieringCategoryData.value = {
        name: capitalize(premieringCategorySlug.value.replace(/-/g, ' ')),
        seo_description: null,
        meta_keywords: null,
      }
    }
  } else {
    premieringCategoryData.value = null
  }
}

// Computed properties for SEO
const appName = computed(() => appsStore.talastageApp?.name || 'TalaStage')
const pageTitle = computed(() =>
  premieringCategoryData.value?.name
    ? `Premiere ${premieringCategoryData.value.name} Project - ${appName.value}`
    : `Premiere Project - ${appName.value}`
)
const pageDescription = computed(() =>
  premieringCategoryData.value?.seo_description
    ? `Upload and premiere your ${premieringCategoryData.value.seo_description} projects on ${appName.value}.`
    : `Upload and premiere your projects in the ${
        premieringCategorySlug.value?.replace(/-/g, ' ') || 'various'
      } category on TalaStage.`
)
const pageKeywords = computed(() => {
  const defaultKeywords = 'upload, premiere, project, TalaStage'
  const categoryKeywords = premieringCategoryData.value?.meta_keywords
  const slugKeywords = premieringCategorySlug.value?.replace(/-/g, ', ')
  return [slugKeywords, categoryKeywords, defaultKeywords]
    .filter(Boolean)
    .join(', ')
})
const pageUrl = computed(
  () =>
    `${useRuntimeConfig().public.frontendUrl}/premiering/${
      premieringCategorySlug.value
    }`
)
const pageImage = computed(
  () =>
    appsStore.talastageApp?.thumbnail_url ||
    appsStore.talastageApp?.logo_url ||
    'https://talastage.com/default-upload-category.png'
)

// SEO using the useSeo composable
useSeo({
  title: pageTitle,
  description: pageDescription,
  keywords: pageKeywords,
  image: pageImage,
  type: 'website',
  siteName: appName,
  url: pageUrl,
  noIndex: true, // Generally want to avoid indexing specific upload forms
  structured: computed(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle.value,
    description: pageDescription.value,
    url: pageUrl.value,
    publisher: {
      '@type': 'Organization',
      name: appName.value,
      logo: {
        '@type': 'ImageObject',
        url:
          appsStore.talastageApp?.logo_url ||
          'https://talastage.com/default-thumbnail.png',
      },
    },
  })),
})

// Helper function to capitalize the first letter of each word
function capitalize(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<style lang="scss" scoped>
/* Add custom styling for the Premiering by Category page if needed */
</style>
