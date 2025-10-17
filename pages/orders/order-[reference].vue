<template>
  <v-container class="order-detail-page">
    <OrderDetailPage />
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
  contentWidth: PAGE_WIDTHS.MEDIUM,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'default',
})
// Fetch app data on mount
const appsStore = useAppsStore()
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})

// Access the TalaStage app data
const talastageApp = computed(() => appsStore.talastageApp)

// Use the useSeo composable to handle SEO
useSeo({
  title: computed(() =>
    talastageApp.value?.name
      ? `Order Detail - ${talastageApp.value.name}`
      : 'Order Detail - TalaStage'
  ),
  description: computed(
    () =>
      `View the details of your order with reference ${reference} on ${
        talastageApp.value?.name || 'TalaStage'
      }. Track order status and get updates.`
  ),
  keywords: 'order, detail, track, status, TalaStage',
  image: computed(
    () => talastageApp.value?.logo_url || '/default-order-image.png'
  ),
  url: computed(
    () => `${useRuntimeConfig().public.frontendUrl}/orders/order-${reference}`
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  twitterUsername: '@talastage',
  structured: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: computed(() =>
      talastageApp.value?.name
        ? `Order Detail - ${talastageApp.value.name}`
        : 'Order Detail - TalaStage'
    ),
    description: computed(
      () =>
        `View the details of your order with reference ${reference} on ${
          talastageApp.value?.name || 'TalaStage'
        }. Track order status and get updates.`
    ),
    url: computed(
      () => `${useRuntimeConfig().public.frontendUrl}/orders/order-${reference}`
    ),
    publisher: {
      '@type': 'Organization',
      name: computed(() => talastageApp.value?.name || 'TalaStage'),
      logo: {
        '@type': 'ImageObject',
        url: computed(
          () => talastageApp.value?.logo_url || '/default-order-image.png'
        ),
      },
    },
  },
})
</script>

<style scoped>
.order-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
