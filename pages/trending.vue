<template>
  <div>
    <TrendingProjectsPage />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'
import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
  },
  layout: 'default',
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
    () => `Trending Projects - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      `Discover the most popular and trending projects on ${talastageApp.value?.name}. See what's hot right now!`
  ),
  keywords: computed(
    () =>
      `trending projects, popular projects, hot projects, discover projects, ${
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
      `${talastageApp.value?.canonical_url || 'https://talastage.com'}/trending`
  ),
  canonical: computed(
    () =>
      `${talastageApp.value?.canonical_url || 'https://talastage.com'}/trending`
  ),
  openGraph: computed(() => ({
    title: `Trending Projects - ${talastageApp.value?.name || 'TalaStage'}`,
    description: `Discover the most popular and trending projects on ${talastageApp.value?.name}. See what's hot right now!`,
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/trending`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Trending Projects - ${talastageApp.value?.name || 'TalaStage'}`,
    description: `Discover the most popular and trending projects on ${talastageApp.value?.name}. See what's hot right now!`,
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
