<template>
  <div>
    <HelpCenterPage />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'
import { computed, onMounted } from 'vue'
const appsStore = useAppsStore()
import { PAGE_WIDTHS } from '@/constants/layouts'

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
      ? `Help Center - ${talastageApp.value.name}`
      : 'Help Center - TalaStage'
  ),
  description:
    'Browse our help articles to find answers to your questions and get the support you need on TalaStage.',
  keywords: 'help, support, articles, FAQ, knowledge base, TalaStage',
  image: computed(
    () => talastageApp.value?.logo_url || '/default-support-image.png'
  ),
  type: 'website',
  siteName: computed(() =>
    talastageApp.value?.name
      ? `${talastageApp.value.name} Help Center`
      : 'TalaStage Help Center'
  ),
})
</script>

<style scoped>
/* Add any page-specific styles if necessary */
</style>
