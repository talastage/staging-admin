<template>
  <div class="activate-page-wrapper">
    <v-container class="activate-container">
      <WalletActivatePage />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'
import { PAGE_WIDTHS } from '~/constants/layouts' // Assuming this path is correct

definePageMeta({
  layout: 'default',
  layoutOptions: {
    showDrawer: false,
    showCategories: false,
  },
  middleware: ['auth'],
  ssr: false,
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
    () => `Activate Wallet - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () => 'Activate your TalaStage wallet to start secure transactions.'
  ),
  keywords: computed(
    () =>
      `wallet, activate wallet, secure transactions, fund wallet, ${
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
      }/wallet/activate`
  ),
  canonical: computed(
    () =>
      `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/wallet/activate`
  ),
  openGraph: computed(() => ({
    title: `Activate Wallet - ${talastageApp.value?.name || 'TalaStage'}`,
    description: 'Activate your TalaStage wallet to start secure transactions.',
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/wallet/activate`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Activate Wallet - ${talastageApp.value?.name || 'TalaStage'}`,
    description: 'Activate your TalaStage wallet to start secure transactions.',
    image: talastageApp.value?.logo_url || '/default-social-image.png',
  })),
  link: computed(() => [
    { rel: 'icon', href: talastageApp.value?.favicon_url || '/favicon.ico' },
  ]),
})
</script>

<style scoped>
.activate-page-wrapper {
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  padding: 16px 0;
  display: flex;
  align-items: center;
}

.activate-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (max-width: 600px) {
  .activate-page-wrapper {
    padding: 8px 0;
    align-items: flex-start;
    padding-top: 20px;
  }
  
  .activate-container {
    padding: 0 8px;
  }
}
</style>
