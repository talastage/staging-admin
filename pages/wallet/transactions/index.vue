<template>
  <div>
    <WalletTransactions
      :transaction-type="'all'"
      :limit="20"
      :show-view-all="false"
      :show-pagination="false"
      :enable-infinite-scroll="true"
    />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'

definePageMeta({
  middleware: ['auth', 'wallet-auth', 'noindex'],
})

// Fetch app data for dynamic headers
const appsStore = useAppsStore()
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})
const talastageApp = computed(() => appsStore.talastageApp)

// Set up headers and SEO
useSeo({
  title: computed(
    () => `Wallet Transactions - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      'View all your wallet transactions, including deposits, withdrawals, and payments.'
  ),
  keywords: computed(
    () =>
      `wallet, transactions, history, all transactions, deposits, withdrawals, payments, ${
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
      }/wallet-transactions`
  ),
  canonical: computed(
    () =>
      `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/wallet-transactions`
  ),
  noIndex: true, // User-specific transaction history, no need for indexing
  openGraph: computed(() => ({
    title: `Wallet Transactions - ${talastageApp.value?.name || 'TalaStage'}`,
    description:
      'View all your wallet transactions, including deposits, withdrawals, and payments.',
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/wallet-transactions`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    type: 'website',
    siteName: talastageApp.value?.name || 'TalaStage',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Wallet Transactions - ${talastageApp.value?.name || 'TalaStage'}`,
    description:
      'View all your wallet transactions, including deposits, withdrawals, and payments.',
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
      }/wallet-transactions`,
    },
  ]),
})
</script>

<style lang="scss" scoped>
/* Add any specific styles for the WalletTransactions page if necessary */
</style>
