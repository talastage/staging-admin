<template>
  <div>
    <WalletSettings />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'
import { PAGE_WIDTHS } from '~/constants/layouts' // Assuming this path is correct

definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM, // Or any other appropriate width
  layoutOptions: { showCategories: false, showDrawer: true }, // Adjust layout options as needed
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
    () => `Wallet Settings - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      'Configure your wallet preferences, manage settings, and secure your transactions.'
  ),
  keywords: computed(
    () =>
      `wallet, settings, preferences, manage wallet, secure transactions, ${
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
      }/wallet-settings`
  ),
  canonical: computed(
    () =>
      `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/wallet-settings`
  ),
  noIndex: true, // User-specific settings, no need for indexing
  openGraph: computed(() => ({
    title: `Wallet Settings - ${talastageApp.value?.name || 'TalaStage'}`,
    description:
      'Configure your wallet preferences, manage settings, and secure your transactions.',
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/wallet-settings`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Wallet Settings - ${talastageApp.value?.name || 'TalaStage'}`,
    description:
      'Configure your wallet preferences, manage settings, and secure your transactions.',
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
      }/wallet-settings`,
    },
  ]),
})
</script>

<style lang="scss" scoped>
/* Add any specific styles for the WalletSettings page if necessary */
</style>
