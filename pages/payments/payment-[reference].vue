<template>
  <v-container class="payment-detail-page">
    <UserPaymentDetailPage />
  </v-container>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { PAGE_WIDTHS } from '~/constants/layouts'

// Get the reference from the route
const route = useRoute()
const reference = route.params.reference

// Define page metadata
definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: true,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'default',
  middleware: ['noindex'],
})

// Fetch app data on mount
const appsStore = useAppsStore()
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})

// Access the TalaStage app data
const talastageApp = computed(() => appsStore.talastageApp)

// Define computed values upfront to avoid circular references
const titleValue = computed(() =>
  talastageApp.value?.name
    ? `Payment Detail - ${talastageApp.value.name}`
    : 'Payment Detail - TalaStage'
)

const descriptionValue = computed(
  () =>
    `View the details of your payment with reference ${reference} on ${
      talastageApp.value?.name || 'TalaStage'
    }. Track payment status and get updates.`
)

const imageValue = computed(
  () => talastageApp.value?.logo_url || '/default-payment-image.png'
)

const urlValue = computed(
  () => `${useRuntimeConfig().public.frontendUrl}/payments/payment-${reference}`
)

const siteNameValue = computed(() => talastageApp.value?.name || 'TalaStage')

// Use the useSeo composable with a structuredDataFactory to avoid circular refs
useSeo({
  title: titleValue,
  description: descriptionValue,
  keywords: 'payment, detail, track, status, TalaStage',
  image: imageValue,
  url: urlValue,
  type: 'website',
  siteName: siteNameValue,
  twitterUsername: '@talastage',
  // Use structuredDataFactory instead of directly passing the structured object
  structuredDataFactory: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: titleValue.value,
    description: descriptionValue.value,
    url: urlValue.value,
    publisher: {
      '@type': 'Organization',
      name: siteNameValue.value,
      logo: {
        '@type': 'ImageObject',
        url: imageValue.value,
      },
    },
  }),
})
</script>

<style scoped>
.payment-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
