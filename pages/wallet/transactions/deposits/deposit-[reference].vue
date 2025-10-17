<template>
  <WalletDepositDetailPage />
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

// Get the app data and reference
const talastageApp = computed(() => appsStore.talastageApp)
const reference = computed(() => route.params.reference as string)

// Define SEO metadata dynamically
useSeo({
  title: computed(() => {
    const appName = talastageApp.value?.name || 'TalaStage'
    return `Deposit Status - ${reference.value} - ${appName}`
  }),
  description: computed(() => {
    const appName = talastageApp.value?.name || 'TalaStage'
    return `Track the status of your deposit with reference ID ${reference.value} on ${appName}. Get updates on your transaction.`
  }),
  keywords: computed(
    () =>
      `deposit status, transaction status, wallet, payment tracking, ${
        reference.value
      }, ${talastageApp.value?.name || 'TalaStage'}`
  ),
  image: computed(
    () => talastageApp.value?.logo_url || '/default-social-image.png'
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  url: computed(() => {
    const baseUrl = talastageApp.value?.canonical_url || 'https://talastage.com'
    return `${baseUrl}/wallet/deposit/${reference.value}`
  }),
  canonical: computed(() => {
    const baseUrl = talastageApp.value?.canonical_url || 'https://talastage.com'
    return `${baseUrl}/wallet/deposit/${reference.value}`
  }),
  openGraph: computed(() => ({
    title: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return `Deposit Status - ${reference.value} - ${appName}`
    }).value,
    description: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return `Track the status of your deposit with reference ID ${reference.value} on ${appName}. Get updates on your transaction.`
    }).value,
    url: computed(() => {
      const baseUrl =
        talastageApp.value?.canonical_url || 'https://talastage.com'
      return `${baseUrl}/wallet/deposit/${reference.value}`
    }).value,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return `Deposit Status - ${reference.value} - ${appName}`
    }).value,
    description: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return `Track the status of your deposit with reference ID ${reference.value} on ${appName}. Get updates on your transaction.`
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
