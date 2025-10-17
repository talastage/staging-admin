<template>
  <WithdrawalRequestPage />
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'

definePageMeta({
  middleware: ['auth', 'noindex'],
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
    () =>
      `Withdrawal Requests - Wallet - ${
        talastageApp.value?.name || 'TalaStage'
      }`
  ),
  description: computed(
    () =>
      `Request a withdrawal of funds from your wallet to the admin on ${talastageApp.value?.name}. Submit your withdrawal request here.`
  ),
  keywords: computed(
    () =>
      `wallet, withdrawal request, withdraw funds, send withdrawal, admin, funds, ${
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
      }/wallet/transactions/withdrawal-requests`
  ),
  canonical: computed(
    () =>
      `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/wallet/transactions/withdrawal-requests`
  ),
  noIndex: true, // User-specific action, no need for indexing
  openGraph: computed(() => ({
    title: `Withdrawal Requests - Wallet - ${
      talastageApp.value?.name || 'TalaStage'
    }`,
    description: `Request a withdrawal of funds from your wallet to the admin on ${talastageApp.value?.name}. Submit your withdrawal request here.`,
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/wallet/transactions/withdrawal-requests`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Withdrawal Requests - Wallet - ${
      talastageApp.value?.name || 'TalaStage'
    }`,
    description: `Request a withdrawal of funds from your wallet to the admin on ${talastageApp.value?.name}. Submit your withdrawal request here.`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
  })),
  link: computed(() => [
    { rel: 'icon', href: talastageApp.value?.favicon_url || '/favicon.ico' },
  ]),
})
</script>

<style scoped>
/* Add any specific styles for the WalletWithdrawalRequestPage if necessary */
</style>
