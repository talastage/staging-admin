<template>
  <WalletDepositPage />
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
    () => `Deposit Funds - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      `Securely deposit funds into your wallet on ${talastageApp.value?.name}. Choose your preferred payment method and add funds to your account.`
  ),
  keywords: computed(
    () =>
      `wallet, deposit, fund wallet, payment, secure payment, ${
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
      }/wallet/deposit`
  ),
  canonical: computed(
    () =>
      `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/wallet/deposit`
  ),
  openGraph: computed(() => ({
    title: `Deposit Funds - ${talastageApp.value?.name || 'TalaStage'}`,
    description: `Securely deposit funds into your wallet on ${talastageApp.value?.name}. Choose your preferred payment method and add funds to your account.`,
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/wallet/deposit`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Deposit Funds - ${talastageApp.value?.name || 'TalaStage'}`,
    description: `Securely deposit funds into your wallet on ${talastageApp.value?.name}. Choose your preferred payment method and add funds to your account.`,
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
