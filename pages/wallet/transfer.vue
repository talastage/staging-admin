<template>
  <WalletTransferPage />
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
    () => `Transfer Funds - Wallet - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      `Transfer funds from your wallet to other users on ${talastageApp.value?.name}. Send money securely.`
  ),
  keywords: computed(
    () =>
      `wallet, transfer funds, send money, user transfer, secure transfer, ${
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
      }/wallet/transfer`
  ),
  canonical: computed(
    () =>
      `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/wallet/transfer`
  ),
  noIndex: true, // User-specific action, no need for indexing
  openGraph: computed(() => ({
    title: `Transfer Funds - Wallet - ${
      talastageApp.value?.name || 'TalaStage'
    }`,
    description: `Transfer funds from your wallet to other users on ${talastageApp.value?.name}. Send money securely.`,
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/wallet/transfer`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Transfer Funds - Wallet - ${
      talastageApp.value?.name || 'TalaStage'
    }`,
    description: `Transfer funds from your wallet to other users on ${talastageApp.value?.name}. Send money securely.`,
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
