<template>
  <PremieringPage />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'
import { PAGE_WIDTHS } from '~/constants/layouts'

// Define page metadata
definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM, // Adjust as needed for upload forms
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true, // Set this to true to have the drawer minimized on page load
  },
  layout: 'default', // Or a specific layout for authenticated users if applicable
  middleware: ['auth'], // Assuming only authenticated users can access this page
})

// Access the apps store
const appsStore = useAppsStore()

// Get the app details
const talastageApp = computed(() => appsStore.talastageApp)

// Computed properties for SEO (defined within the script scope for structured data access)
const appName = computed(() => talastageApp.value?.name || 'TalaStage')
const pageTitle = computed(() =>
  talastageApp.value?.name
    ? `Premiere Your Project - ${talastageApp.value.name}`
    : 'Premiere Your Project - TalaStage'
)
const pageDescription = computed(() =>
  talastageApp.value?.seo_description
    ? `Upload and premiere your music, movies, and other projects on ${talastageApp.value.seo_description}.`
    : `Upload and premiere your creative projects on TalaStage and share them with the world.`
)
const pageUrl = computed(
  () => `${useRuntimeConfig().public.frontendUrl}/premiering`
)

// Create a function to generate structured data to avoid circular references
const createStructuredData = () => {
  return {
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
  }
}

// SEO using the useSeo composable
useSeo({
  title: pageTitle,
  description: pageDescription,
  // Keywords are less critical for functional pages, but can include relevant terms
  keywords: computed(
    () =>
      `upload, premiere, project, music, movie, video, share, ${
        talastageApp.value?.meta_keywords ||
        'entertainment, creative, TalaStage'
      }`
  ),
  // Use a generic image or the app logo
  image: computed(
    () =>
      talastageApp.value?.thumbnail_url ||
      talastageApp.value?.logo_url ||
      'https://talastage.com/default-upload-page.png'
  ),
  // This page is a tool, so 'website' or null might be appropriate
  type: 'website',
  siteName: appName,
  // The URL will be the current page URL
  url: pageUrl,
  // Consider noIndex to prevent indexing of user-specific upload pages
  noIndex: true,
  // Use structuredDataFactory instead of structured
  structuredDataFactory: createStructuredData,
})
</script>

<style lang="scss" scoped>
/* Add custom styling for the Premiering page if needed */
</style>
