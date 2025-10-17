<template>
  <WithdrawalRequestDetailPage />
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

// Simple string values for SEO, no computed properties
const getAppName = () => talastageApp.value?.name || 'TalaStage'
const getBaseUrl = () =>
  talastageApp.value?.canonical_url || 'https://talastage.com'
const getLogoUrl = () =>
  talastageApp.value?.logo_url || '/default-social-image.png'
const getFaviconUrl = () => talastageApp.value?.favicon_url || '/favicon.ico'

// Define SEO metadata using string template literals and plain values
useSeo({
  title: `Withdrawal Details - ${
    route.params.reference
  } - Wallet - ${getAppName()}`,
  description: `View the details of your withdrawal request with reference ID ${
    route.params.reference
  } from your wallet on ${getAppName()}. Check the status and information.`,
  keywords: `wallet, withdrawal details, withdrawal status, payout details, transaction details, ${
    route.params.reference
  }, ${getAppName()}`,
  image: getLogoUrl(),
  type: 'website',
  siteName: getAppName(),
  url: `${getBaseUrl()}/wallet/withdraw/withdrawal-${route.params.reference}`,
  canonical: `${getBaseUrl()}/wallet/withdraw/withdrawal-${
    route.params.reference
  }`,
  noIndex: true, // User-specific details, no need for indexing
  // Use plain objects with string values, no computed or nested computed refs
  openGraph: {
    title: `Withdrawal Details - ${
      route.params.reference
    } - Wallet - ${getAppName()}`,
    description: `View the details of your withdrawal request with reference ID ${
      route.params.reference
    } from your wallet on ${getAppName()}. Check the status and information.`,
    url: `${getBaseUrl()}/wallet/withdraw/withdrawal-${route.params.reference}`,
    image: getLogoUrl(),
    siteName: getAppName(),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Withdrawal Details - ${
      route.params.reference
    } - Wallet - ${getAppName()}`,
    description: `View the details of your withdrawal request with reference ID ${
      route.params.reference
    } from your wallet on ${getAppName()}. Check the status and information.`,
    image: getLogoUrl(),
  },
  link: [{ rel: 'icon', href: getFaviconUrl() }],
})
</script>

<style lang="scss" scoped>
/* Add any page-specific styles if necessary */
</style>
