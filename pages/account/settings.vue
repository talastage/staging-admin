<template>
  <div>
    <AccountSettingsPage />
  </div>
</template>

<script setup>
import AccountSettingsPage from '@/views/AccountSettingsPage.vue'
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'
import { PAGE_WIDTHS } from '~/constants/layouts'

// Define middleware for authentication and noindex, and set content width to full
definePageMeta({
  middleware: ['auth', 'noindex'],
  contentWidth: PAGE_WIDTHS.FULL,
})

// Fetch app data for SEO and header meta
const appsStore = useAppsStore()
await appsStore.fetchTalaStageApp()

// Access the app data
const talastageApp = computed(() => appsStore.talastageApp)

// Use the useSeo composable to set SEO metadata
useSeo({
  title: `Account Settings - ${
    talastageApp.value?.seo_title || talastageApp.value?.name
  }`,
  description:
    talastageApp.value?.seo_description ||
    'Manage your account settings, update your preferences, and configure your account on TalaStage.',
  keywords:
    talastageApp.value?.meta_keywords || 'account, settings, user preferences',
  image: talastageApp.value?.logo_url || '/default-social-image.png',
  url: talastageApp.value?.canonical_url || 'https://talastage.com',
  type: 'website',
  siteName: talastageApp.value?.name || 'TalaStage',
  twitterUsername: '@talastage',
})
</script>

<style scoped>
/* Add your styles here */
</style>
