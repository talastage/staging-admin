<template>
  <v-container class="policy-detail-page">
    <PolicyDetailPage />
  </v-container>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { PAGE_WIDTHS } from '~/constants/layouts'
import { min } from 'lodash'

// Get the policy slug from the route
const route = useRoute()
const policySlug = route.params.policySlug

// Define page metadata
definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM,
  layoutOptions: { showCategories: true, showDrawer: true, miniDrawer: true },
  layout: 'default',
  middleware: ['noindex'], // Prevent search engines from indexing this page
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
      ? `${policySlug.replace(/-/g, ' ').toUpperCase()} Policy - ${
          talastageApp.value.name
        }`
      : `${policySlug.replace(/-/g, ' ').toUpperCase()} Policy - TalaStage`
  ),
  description: computed(
    () =>
      `Read the ${policySlug.replace(/-/g, ' ').toUpperCase()} policy of ${
        talastageApp.value?.name || 'TalaStage'
      }. Understand our guidelines and terms.`
  ),
  keywords: computed(() =>
    [
      `${policySlug} policy`,
      'terms',
      'guidelines',
      'TalaStage',
      talastageApp.value?.name || 'TalaStage',
    ].join(', ')
  ),
  image: computed(
    () => talastageApp.value?.logo_url || '/default-policy-image.png'
  ),
  url: computed(
    () => `${useRuntimeConfig().public.frontendUrl}/policies/${policySlug}`
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  twitterUsername: '@talastage',
  structured: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: computed(() =>
      talastageApp.value?.name
        ? `${policySlug.replace(/-/g, ' ').toUpperCase()} Policy - ${
            talastageApp.value.name
          }`
        : `${policySlug.replace(/-/g, ' ').toUpperCase()} Policy - TalaStage`
    ),
    description: computed(
      () =>
        `Read the ${policySlug.replace(/-/g, ' ').toUpperCase()} policy of ${
          talastageApp.value?.name || 'TalaStage'
        }. Understand our guidelines and terms.`
    ),
    url: computed(
      () => `${useRuntimeConfig().public.frontendUrl}/policies/${policySlug}`
    ),
    publisher: {
      '@type': 'Organization',
      name: computed(() => talastageApp.value?.name || 'TalaStage'),
      logo: {
        '@type': 'ImageObject',
        url: computed(
          () => talastageApp.value?.logo_url || '/default-policy-image.png'
        ),
      },
    },
  },
})
</script>

<style scoped>
.policy-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
