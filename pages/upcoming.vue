<template>
  <div>
    <UpcomingPremieresPage />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'
import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL, // Or any other appropriate width
  layoutOptions: { showCategories: false, showDrawer: true }, // Adjust layout options as needed
})

// Initialize the app store
const appsStore = useAppsStore()

// Fetch app data on mount
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})

// Get the app data
const talastageApp = computed(() => appsStore.talastageApp)

// Define SEO metadata dynamically
useSeo({
  title: computed(
    () => `Upcoming Premieres - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      `Discover upcoming premieres and scheduled video releases on ${talastageApp.value?.name}. Don't miss the latest content!`
  ),
  keywords: computed(
    () =>
      `upcoming premieres, scheduled videos, new releases, coming soon, ${
        talastageApp.value?.name || 'TalaStage'
      }`
  ),
  image: computed(
    () => talastageApp.value?.logo_url || '/default-social-image.png'
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  url: computed(
    () =>
      `${talastageApp.value?.canonical_url || 'https://talastage.com'}/upcoming`
  ),
  canonical: computed(
    () =>
      `${talastageApp.value?.canonical_url || 'https://talastage.com'}/upcoming`
  ),
  openGraph: computed(() => ({
    title: `Upcoming Premieres - ${talastageApp.value?.name || 'TalaStage'}`,
    description: `Discover upcoming premieres and scheduled video releases on ${talastageApp.value?.name}. Don't miss the latest content!`,
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/upcoming`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Upcoming Premieres - ${talastageApp.value?.name || 'TalaStage'}`,
    description: `Discover upcoming premieres and scheduled video releases on ${talastageApp.value?.name}. Don't miss the latest content!`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
  })),
  link: computed(() => [
    { rel: 'icon', href: talastageApp.value?.favicon_url || '/favicon.ico' },
  ]),
})
</script>

<style scoped>
/* Add any page-specific styles if necessary */
</style>
