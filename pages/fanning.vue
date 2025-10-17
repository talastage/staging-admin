<template>
  <div>
    <UserFanning :username="username" />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { useAuthStore } from '@/stores/auth' // Import the auth store
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'

// Define the middleware for authentication
import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'default',
  middleware: ['auth', 'noindex'],
})

// Initialize the auth store
const authStore = useAuthStore()

// Computed property to get the current user's username
const username = computed(() => authStore.user?.value?.username || '')

// Fetch app data for dynamic headers and SEO
const appsStore = useAppsStore()
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})

// Access the app data
const talastageApp = computed(() => appsStore.talastageApp)

// Enhance page metadata using useSeo
useSeo({
  title: computed(() => `${talastageApp.value?.name || 'TalaStage'} - Fanning`),
  description: computed(
    () =>
      'Discover the talents and users you are fanning. Explore their content, show support, and grow your network on TalaStage.'
  ),
  keywords: computed(() => 'fanning, following, talent, support, community'),
  image: computed(
    () =>
      talastageApp.value?.thumbnail_url ||
      talastageApp.value?.logo_url ||
      'https://talastage.com/default-social-image.png'
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  url: computed(
    () =>
      `${talastageApp.value?.canonical_url || 'https://talastage.com'}/fanning`
  ),
  canonical: computed(
    () =>
      `${talastageApp.value?.canonical_url || 'https://talastage.com'}/fanning`
  ),
  openGraph: computed(() => ({
    title: `${talastageApp.value?.name || 'TalaStage'} - Fanning`,
    description:
      'Discover the talents and users you are fanning. Explore their content, show support, and grow your network on TalaStage.',
    image:
      talastageApp.value?.thumbnail_url ||
      talastageApp.value?.logo_url ||
      'https://talastage.com/default-social-image.png',
    type: 'website',
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/fanning`,
    siteName: talastageApp.value?.name || 'TalaStage',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `${talastageApp.value?.name || 'TalaStage'} - Fanning`,
    description:
      'Discover the talents and users you are fanning. Explore their content, show support, and grow your network on TalaStage.',
    image:
      talastageApp.value?.thumbnail_url ||
      talastageApp.value?.logo_url ||
      'https://talastage.com/default-social-image.png',
  })),
  link: computed(() => [
    {
      rel: 'icon',
      type: 'image/png',
      href: talastageApp.value?.favicon_url || '/favicon.png',
    },
    {
      rel: 'canonical',
      href: `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/fanning`,
    },
  ]),
})
</script>

<style lang="scss" scoped>
/* Add any page-specific styles if necessary */
</style>
