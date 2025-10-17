<template>
  <div>
    <UserOrdersPage />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'
import { computed, onMounted } from 'vue'
import { PAGE_WIDTHS } from '~/constants/layouts'

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
      ? `My Orders - ${talastageApp.value.name}`
      : 'My Orders - TalaStage'
  ),
  description: computed(
    () =>
      `View and manage your orders on ${
        talastageApp.value?.name || 'TalaStage'
      }. Track order status and get updates.`
  ),
  keywords: 'orders, my orders, track orders, order status, TalaStage',
  image: computed(
    () => talastageApp.value?.logo_url || '/default-social-image.png'
  ),
  url: computed(() => `${useRuntimeConfig().public.frontendUrl}/orders`),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  twitterUsername: '@talastage',
  structured: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: computed(() =>
      talastageApp.value?.name
        ? `My Orders - ${talastageApp.value.name}`
        : 'My Orders - TalaStage'
    ),
    description: computed(
      () =>
        `View and manage your orders on ${
          talastageApp.value?.name || 'TalaStage'
        }. Track order status and get updates.`
    ),
    url: computed(() => `${useRuntimeConfig().public.frontendUrl}/orders`),
    publisher: {
      '@type': 'Organization',
      name: computed(() => talastageApp.value?.name || 'TalaStage'),
      logo: {
        '@type': 'ImageObject',
        url: computed(
          () => talastageApp.value?.logo_url || '/default-social-image.png'
        ),
      },
    },
  },
})
</script>

<style lang="scss" scoped>
/* Add any page-specific styles if necessary */
</style>
