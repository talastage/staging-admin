<template>
  <v-container fluid>
    <UserFans :username="username" />
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'
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

// Initialize the apps store and fetch app data
const appsStore = useAppsStore()
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})

// Access the app data
const talastageApp = computed(() => appsStore.talastageApp)

// Set up SEO metadata using useSeo
useSeo({
  title: computed(() => `${talastageApp.value?.name || 'TalaStage'} - Fans`),
  description: computed(
    () =>
      'Discover the fans supporting you. Explore their profiles, show your appreciation, and grow your community on TalaStage.'
  ),
  keywords: computed(() => 'fans, followers, support, community, TalaStage'),
  image: computed(
    () =>
      talastageApp.value?.thumbnail_url ||
      talastageApp.value?.logo_url ||
      'https://talastage.com/default-social-image.png'
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  url: computed(
    () => `${talastageApp.value?.canonical_url || 'https://talastage.com'}/fans`
  ),
  canonical: computed(
    () => `${talastageApp.value?.canonical_url || 'https://talastage.com'}/fans`
  ),
  openGraph: computed(() => ({
    title: `${talastageApp.value?.name || 'TalaStage'} - Fans`,
    description:
      'Discover the fans supporting you. Explore their profiles, show your appreciation, and grow your community on TalaStage.',
    image:
      talastageApp.value?.thumbnail_url ||
      talastageApp.value?.logo_url ||
      'https://talastage.com/default-social-image.png',
    type: 'website',
    url: `${talastageApp.value?.canonical_url || 'https://talastage.com'}/fans`,
    siteName: talastageApp.value?.name || 'TalaStage',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `${talastageApp.value?.name || 'TalaStage'} - Fans`,
    description:
      'Discover the fans supporting you. Explore their profiles, show your appreciation, and grow your community on TalaStage.',
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
      }/fans`,
    },
  ]),
})
</script>

<style scoped>
/* Add any page-specific styles if necessary */
</style>
