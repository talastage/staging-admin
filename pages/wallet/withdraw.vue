<template>
  <WithdrawPage />
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'

definePageMeta({
  middleware: ['auth', 'wallet-auth', 'noindex'],
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
    () => `Withdraw Funds - Wallet - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      `Withdraw funds from your wallet on ${talastageApp.value?.name}. Choose your withdrawal method and request a payout.`
  ),
  keywords: computed(
    () =>
      `wallet, withdraw funds, payout, withdrawal method, request withdrawal, funds, ${
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
      }/wallet/withdraw`
  ),
  canonical: computed(
    () =>
      `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/wallet/withdraw`
  ),
  noIndex: true, // User-specific action, no need for indexing
  openGraph: computed(() => ({
    title: `Withdraw Funds - Wallet - ${
      talastageApp.value?.name || 'TalaStage'
    }`,
    description: `Withdraw funds from your wallet on ${talastageApp.value?.name}. Choose your withdrawal method and request a payout.`,
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/wallet/withdraw`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Withdraw Funds - Wallet - ${
      talastageApp.value?.name || 'TalaStage'
    }`,
    description: `Withdraw funds from your wallet on ${talastageApp.value?.name}. Choose your withdrawal method and request a payout.`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
  })),
  link: computed(() => [
    { rel: 'icon', href: talastageApp.value?.favicon_url || '/favicon.ico' },
  ]),
})
</script>

<style lang="scss" scoped>
/* Add any page-specific styles if necessary */
</style>
