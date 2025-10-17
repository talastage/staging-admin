<template>
  <v-container>
    <WalletTransactions
      transaction-type="withdrawal"
      :show-view-all="false"
      :limit="20"
    />
  </v-container>
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
    () =>
      `Withdrawal Transactions - Wallet - ${
        talastageApp.value?.name || 'TalaStage'
      }`
  ),
  description: computed(
    () =>
      `View your withdrawal transaction history from your wallet on ${talastageApp.value?.name}. Track your processed withdrawals.`
  ),
  keywords: computed(
    () =>
      `wallet, transactions, withdrawal history, funds, processed withdrawals, ${
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
      }/wallet/transactions/withdrawals`
  ),
  canonical: computed(
    () =>
      `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/wallet/transactions/withdrawals`
  ),
  noIndex: true, // User-specific transaction history, no need for indexing
  openGraph: computed(() => ({
    title: `Withdrawal Transactions - Wallet - ${
      talastageApp.value?.name || 'TalaStage'
    }`,
    description: `View your withdrawal transaction history from your wallet on ${talastageApp.value?.name}. Track your processed withdrawals.`,
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/wallet/transactions/withdrawals`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Withdrawal Transactions - Wallet - ${
      talastageApp.value?.name || 'TalaStage'
    }`,
    description: `View your withdrawal transaction history from your wallet on ${talastageApp.value?.name}. Track your processed withdrawals.`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
  })),
  link: computed(() => [
    { rel: 'icon', href: talastageApp.value?.favicon_url || '/favicon.ico' },
  ]),
})
</script>

<style scoped>
.v-container {
  height: calc(100vh - 64px); /* Adjust based on your header height */
  overflow-y: auto;
}
</style>
