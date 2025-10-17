<template>
  <div>
    <NotificationPage />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'
import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true, // Set this to true to have the drawer minimized on page load
  },
  layout: 'default',
  middleware: ['auth'],
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
    () => `Notifications - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      `View your latest notifications on ${talastageApp.value?.name}. Stay updated on your activities and interactions.`
  ),
  keywords: computed(
    () =>
      `notifications, alerts, updates, activity, interactions, ${
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
      `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/notifications`
  ),
  canonical: computed(
    () =>
      `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/notifications`
  ),
  noIndex: true, // User-specific content, no need for indexing
  openGraph: computed(() => ({
    title: `Notifications - ${talastageApp.value?.name || 'TalaStage'}`,
    description: `View your latest notifications on ${talastageApp.value?.name}. Stay updated on your activities and interactions.`,
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/notifications`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Notifications - ${talastageApp.value?.name || 'TalaStage'}`,
    description: `View your latest notifications on ${talastageApp.value?.name}. Stay updated on your activities and interactions.`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
  })),
  link: computed(() => [
    { rel: 'icon', href: talastageApp.value?.favicon_url || '/favicon.ico' },
  ]),
})
</script>

<style lang="scss" scoped>
.v-app-bar {
  border-bottom: 1px solid rgb(var(--v-border-color) var(--v-border-opacity));
}
</style>
