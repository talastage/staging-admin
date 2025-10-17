<template>
  <WalletTransferDetailPage />
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'
import { useRoute } from 'vue-router'

definePageMeta({
  middleware: ['auth', 'wallet-auth', 'noindex'],
})

// Initialize the app store and route
const appsStore = useAppsStore()
const route = useRoute()

// Fetch app data on mount
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})

// Get the app data
const talastageApp = computed(() => appsStore.talastageApp)
const transferId = computed(() => route.query.transferId as string) // Assuming transferId is passed as a query parameter

// Define SEO metadata dynamically
useSeo({
  title: computed(() => {
    const appName = talastageApp.value?.name || 'TalaStage'
    return transferId.value
      ? `Transfer Status - ${transferId.value} - Wallet - ${appName}`
      : `Transfer Status - Wallet - ${appName}`
  }),
  description: computed(() => {
    const appName = talastageApp.value?.name || 'TalaStage'
    return transferId.value
      ? `Check the status of your transfer with ID ${transferId.value} on ${appName}. Get real-time updates.`
      : `Check the status of your transfer on ${appName}. Get real-time updates.`
  }),
  keywords: computed(
    () =>
      `wallet, transfer status, check transfer, transaction status, transfer ID, ${
        talastageApp.value?.name || 'TalaStage'
      }`
  ),
  image: computed(
    () => talastageApp.value?.logo_url || '/default-social-image.png'
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  url: computed(() => {
    const baseUrl = talastageApp.value?.canonical_url || 'https://talastage.com'
    return transferId.value
      ? `${baseUrl}/wallet/transfer/status?transferId=${transferId.value}`
      : `${baseUrl}/wallet/transfer/status`
  }),
  canonical: computed(() => {
    const baseUrl = talastageApp.value?.canonical_url || 'https://talastage.com'
    return transferId.value
      ? `${baseUrl}/wallet/transfer/status?transferId=${transferId.value}`
      : `${baseUrl}/wallet/transfer/status`
  }),
  noIndex: true, // User-specific status, no need for indexing
  openGraph: computed(() => ({
    title: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return transferId.value
        ? `Transfer Status - ${transferId.value} - Wallet - ${appName}`
        : `Transfer Status - Wallet - ${appName}`
    }).value,
    description: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return transferId.value
        ? `Check the status of your transfer with ID ${transferId.value} on ${appName}. Get real-time updates.`
        : `Check the status of your transfer on ${appName}. Get real-time updates.`
    }).value,
    url: computed(() => {
      const baseUrl =
        talastageApp.value?.canonical_url || 'https://talastage.com'
      return transferId.value
        ? `${baseUrl}/wallet/transfer/status?transferId=${transferId.value}`
        : `${baseUrl}/wallet/transfer/status`
    }).value,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return transferId.value
        ? `Transfer Status - ${transferId.value} - Wallet - ${appName}`
        : `Transfer Status - Wallet - ${appName}`
    }).value,
    description: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return transferId.value
        ? `Check the status of your transfer with ID ${transferId.value} on ${appName}. Get real-time updates.`
        : `Check the status of your transfer on ${appName}. Get real-time updates.`
    }).value,
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
