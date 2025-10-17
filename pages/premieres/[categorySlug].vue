<template>
  <PremieresByCategoryPage />
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
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
  },
  layout: 'default',
})

// Access the route and apps store
const route = useRoute()
const appsStore = useAppsStore()

// State for the current category
const categorySlug = computed(() => route.params.categorySlug as string)
const categoryData = ref<{
  name?: string
  seo_description?: string
  meta_keywords?: string
} | null>(null)

// Fetch app data on mount
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
  await fetchCategoryData()
})

// Fetch category specific data (assuming an API endpoint exists)
const fetchCategoryData = async () => {
  if (categorySlug.value) {
    const { get } = useApi()
    try {
      const response = await get(
        `/api/premieres/categories/${categorySlug.value}`
      )
      categoryData.value = response.data
    } catch (error) {
      console.error('Error fetching category data:', error)
      categoryData.value = {
        name: capitalize(categorySlug.value.replace(/-/g, ' ')),
        seo_description: null,
        meta_keywords: null,
      }
    }
  } else {
    categoryData.value = null
  }
}

// Computed properties for SEO
const appName = computed(() => appsStore.talastageApp?.name || 'TalaStage')
const pageTitle = computed(() =>
  categoryData.value?.name
    ? `Premieres in ${categoryData.value.name} - ${appName.value}`
    : `Premieres - ${appName.value}`
)
const pageDescription = computed(() =>
  categoryData.value?.seo_description
    ? categoryData.value.seo_description
    : `Explore the latest premiered ${
        categorySlug.value?.replace(/-/g, ' ') || 'projects'
      } in the entertainment industry on ${appName.value}.`
)
const pageKeywords = computed(() => {
  const defaultKeywords = 'premieres, entertainment, new releases, TalaStage'
  return categoryData.value?.meta_keywords
    ? `${categoryData.value.meta_keywords}, ${defaultKeywords}`
    : `${categorySlug.value?.replace(/-/g, ', ') || ''}, ${defaultKeywords}`
})
const pageUrl = computed(
  () =>
    `${useRuntimeConfig().public.frontendUrl}/premieres/${categorySlug.value}`
)
const pageImage = computed(
  () =>
    appsStore.talastageApp?.thumbnail_url ||
    appsStore.talastageApp?.logo_url ||
    'https://talastage.com/default-thumbnail.png'
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
  // Structured data for the category page
  structured: computed(() => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage', // Or a more specific type if applicable
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
/* Add custom styling for Premieres by Category page if needed */
</style>
