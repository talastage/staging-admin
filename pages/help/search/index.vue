<template>
  <v-container class="help-search-results-page">
    <HelpSearchResultsPage />
  </v-container>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'
import { computed, onMounted } from 'vue'
import { PAGE_WIDTHS } from '~/constants/layouts'

const appsStore = useAppsStore()

// Define page metadata
definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'help-layout',
})

// Fetch app data on mount
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})

// Access the TalaStage app data
const talastageApp = computed(() => appsStore.talastageApp)

// Use the useSeo composable to handle SEO
useSeo({
  title: computed(() =>
    talastageApp.value?.name
      ? `Help Search Results - ${talastageApp.value.name}`
      : 'Help Search Results - TalaStage'
  ),
  description:
    'Browse search results for help articles to find answers to your questions and get the support you need on TalaStage.',
  keywords:
    'help, support, articles, FAQ, knowledge base, TalaStage, search results',
  image: computed(
    () => talastageApp.value?.logo_url || '/default-support-image.png'
  ),
  url: computed(() => `${useRuntimeConfig().public.frontendUrl}/help/search`),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  twitterUsername: '@talastage',
})
</script>

<style scoped>
.help-search-results-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
