<template>
  <div class="checkout-page-wrapper">
    <v-container class="checkout-container">
      <CheckOutPage />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'
import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM, // Adjust as needed for upload forms
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true, // Set this to true to have the drawer minimized on page load
  },
  layout: 'default', // Or a specific layout for authenticated users if applicable
  middleware: ['auth', 'noindex'], // Assuming only authenticated users can access this page
})

// Fetch app data for dynamic headers and SEO
const appsStore = useAppsStore()
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})
const talastageApp = computed(() => appsStore.talastageApp)

// Set up headers and SEO
useSeo({
  title: computed(
    () => `Checkout - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      'Complete your transaction securely and conveniently with our checkout system.'
  ),
  keywords: computed(
    () =>
      `checkout, transaction, payment, secure payment, complete order, ${
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
      `${talastageApp.value?.canonical_url || 'https://talastage.com'}/checkout`
  ),
  canonical: computed(
    () =>
      `${talastageApp.value?.canonical_url || 'https://talastage.com'}/checkout`
  ),
  noIndex: true, // User-specific checkout process, no need for indexing
  openGraph: computed(() => ({
    title: `Checkout - ${talastageApp.value?.name || 'TalaStage'}`,
    description:
      'Complete your transaction securely and conveniently with our checkout system.',
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/checkout`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    type: 'website',
    siteName: talastageApp.value?.name || 'TalaStage',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Checkout - ${talastageApp.value?.name || 'TalaStage'}`,
    description:
      'Complete your transaction securely and conveniently with our checkout system.',
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
      }/checkout`,
    },
  ]),
})
</script>

<style scoped>
.checkout-page-wrapper {
  min-height: calc(100vh - 70px);
  padding: 16px 0;
}

.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (max-width: 600px) {
  .checkout-page-wrapper {
    padding: 8px 0;
  }

  .checkout-container {
    padding: 0 8px;
  }
}
</style>
