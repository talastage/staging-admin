<template>
  <div>
    <ManageProjectsPage />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'
import { PAGE_WIDTHS } from '~/constants/layouts'

// Define page meta with auth middleware and noindex
definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true, // Set this to true to have the drawer minimized on page load
  },
  layout: 'default',
  middleware: ['auth', 'noindex'],
})

// Fetch app data for headers and SEO
const appsStore = useAppsStore()
await appsStore.fetchTalaStageApp()
const talastageApp = computed(() => appsStore.talastageApp)

// SEO and Dynamic Headers Setup using useSeo composable
useSeo({
  title: `Manage Projects - ${talastageApp.value?.name || 'TalaStage'}`,
  description:
    talastageApp.value?.seo_description ||
    `Manage all your projects effectively on ${
      talastageApp.value?.name || 'TalaStage'
    }.`,
  keywords: `manage projects, project dashboard, project settings, ${
    talastageApp.value?.name || 'TalaStage'
  }`,
  image: talastageApp.value?.logo_url || '/default-social-image.png',
  type: 'website',
  siteName: talastageApp.value?.name || 'TalaStage',
  url: `${
    talastageApp.value?.canonical_url || 'https://talastage.com'
  }/studio/projects/manage-projects`,
  noIndex: true, // Explicitly set noIndex as this is a user dashboard
  robots: 'noindex, nofollow', // Explicitly set robots meta tag
  canonical: `${
    talastageApp.value?.canonical_url || 'https://talastage.com'
  }/studio/projects/manage-projects`,
  openGraph: {
    title: `Manage Projects - ${talastageApp.value?.name || 'TalaStage'}`,
    description:
      talastageApp.value?.seo_description ||
      `Manage all your projects effectively on ${
        talastageApp.value?.name || 'TalaStage'
      }.`,
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/studio/projects/manage-projects`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Manage Projects - ${talastageApp.value?.name || 'TalaStage'}`,
    description:
      talastageApp.value?.seo_description ||
      `Manage all your projects effectively on ${
        talastageApp.value?.name || 'TalaStage'
      }.`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
  },
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: talastageApp.value?.favicon_url || '/favicon.png',
    },
  ],
})
</script>

<style lang="scss" scoped>
/* Add any necessary page-specific styles here */
</style>
