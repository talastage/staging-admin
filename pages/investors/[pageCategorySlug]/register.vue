<template>
  <v-container class="investor-register-page">
    <InvestorRegisterPage />
  </v-container>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { PAGE_WIDTHS } from '~/constants/layouts'

// Get the category slug from the route
const route = useRoute()
const pageCategorySlug = route.params.pageCategorySlug

// Define page metadata
definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM,
  layoutOptions: {
    //  useAuthCard: true,
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
      ? `Investor Registration - ${talastageApp.value.name}`
      : 'Investor Registration - TalaStage'
  ),
  description: computed(
    () =>
      `Register as an investor on TalaStage and start exploring investment opportunities in the ${pageCategorySlug} category.`
  ),
  keywords: 'investor, registration, invest, opportunities, TalaStage',
  image: computed(
    () => talastageApp.value?.logo_url || '/default-investor-image.png'
  ),
  url: computed(
    () =>
      `${
        useRuntimeConfig().public.frontendUrl
      }/investors/${pageCategorySlug}/register`
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  twitterUsername: '@talastage',
  structured: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: computed(() =>
      talastageApp.value?.name
        ? `Investor Registration - ${talastageApp.value.name}`
        : 'Investor Registration - TalaStage'
    ),
    description: computed(
      () =>
        `Register as an investor on TalaStage and start exploring investment opportunities in the ${pageCategorySlug} category.`
    ),
    url: computed(
      () =>
        `${
          useRuntimeConfig().public.frontendUrl
        }/investors/${pageCategorySlug}/register`
    ),
    publisher: {
      '@type': 'Organization',
      name: computed(() => talastageApp.value?.name || 'TalaStage'),
      logo: {
        '@type': 'ImageObject',
        url: computed(
          () => talastageApp.value?.logo_url || '/default-investor-image.png'
        ),
      },
    },
  },
})
</script>

<style scoped>
.investor-register-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
