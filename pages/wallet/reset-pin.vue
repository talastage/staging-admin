<template>
  <WalletResetPinPage />
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'
import { PAGE_WIDTHS } from '~/constants/layouts' // Assuming this path is correct

definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM, // Or any other appropriate width
  layoutOptions: { showCategories: false, showDrawer: false },
  middleware: ['auth', 'wallet-auth', 'noindex'], // Assuming it requires auth and shouldn't be indexed
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
    () => `Reset Wallet PIN - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      `Reset your TalaStage wallet PIN securely. Follow the steps to create a new PIN for your wallet.`
  ),
  keywords: computed(
    () =>
      `wallet, reset pin, new pin, security, change pin, ${
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
      }/wallet/reset-pin`
  ),
  canonical: computed(
    () =>
      `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/wallet/reset-pin`
  ),
  noIndex: true, // User-specific action, no need for indexing
  openGraph: computed(() => ({
    title: `Reset Wallet PIN - ${talastageApp.value?.name || 'TalaStage'}`,
    description: `Reset your TalaStage wallet PIN securely. Follow the steps to create a new PIN for your wallet.`,
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/wallet/reset-pin`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Reset Wallet PIN - ${talastageApp.value?.name || 'TalaStage'}`,
    description: `Reset your TalaStage wallet PIN securely. Follow the steps to create a new PIN for your wallet.`,
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
