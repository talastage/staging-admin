<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <UserWatching v-if="user?.username" :username="user.username" />
        <div v-else-if="!isLoggedIn" class="text-center py-8">
          <v-alert type="warning" variant="tonal">
            Please log in to view your watched content.
          </v-alert>
        </div>
        <div v-else class="text-center py-8">
          <v-progress-circular indeterminate />
          <p class="mt-2">Loading...</p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { useAuthStore } from '@/stores/auth'
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
  middleware: ['auth', 'noindex'],
})

// Get authenticated user from auth store
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const isLoggedIn = computed(() => authStore.isLoggedIn)

// Fetch app data for dynamic headers and SEO
const appsStore = useAppsStore()
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})
const talastageApp = computed(() => appsStore.talastageApp)

// Set up headers and SEO
useSeo({
  title: computed(
    () => `My Watched Content - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      'Access the projects and videos you have unlocked or purchased to watch on TalaStage.'
  ),
  keywords: computed(
    () =>
      'watched projects, unlocked videos, purchased content, my content, TalaStage'
  ),
  image: computed(
    () => talastageApp.value?.logo_url || '/default-social-image.png'
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  url: computed(
    () =>
      `${talastageApp.value?.canonical_url || 'https://talastage.com'}/watched`
  ),
  canonical: computed(
    () =>
      `${talastageApp.value?.canonical_url || 'https://talastage.com'}/watched`
  ),
  noIndex: true, // User-specific content, no need for indexing
  openGraph: computed(() => ({
    title: `My Watched Content - ${talastageApp.value?.name || 'TalaStage'}`,
    description:
      'Access the projects and videos you have unlocked or purchased to watch on TalaStage.',
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/watched`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    type: 'website',
    siteName: talastageApp.value?.name || 'TalaStage',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `My Watched Content - ${talastageApp.value?.name || 'TalaStage'}`,
    description:
      'Access the projects and videos you have unlocked or purchased to watch on TalaStage.',
    image: talastageApp.value?.logo_url || '/default-social-image.png',
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
      }/watched`,
    },
  ]),
  meta: [{ name: 'robots', content: 'noindex, nofollow' }], // Prevent search engine indexing
})
</script>

<style scoped>
/* Add any page-specific styles if necessary */
</style>
