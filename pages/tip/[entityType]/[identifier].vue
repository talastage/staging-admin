<template>
  <TipUserPage />
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'
import { useRoute } from 'vue-router'
import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'default',
})

// Initialize the app store and route
const appsStore = useAppsStore()
const route = useRoute()

// Fetch app data on mount
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})

// Get the app data and route parameters
const talastageApp = computed(() => appsStore.talastageApp)
const entityType = computed(() => route.params.entityType as string)
const identifier = computed(() => route.params.identifier as string)

// Derive a more user-friendly entity name for SEO
const entityDisplayName = computed(() => {
  if (entityType.value === 'user') {
    return 'User'
  } else if (entityType.value === 'talent') {
    return 'Talent'
  }
  return 'Entity'
})

// Define SEO metadata dynamically
useSeo({
  title: computed(() => {
    const appName = talastageApp.value?.name || 'TalaStage'
    return `Give Tip to ${entityDisplayName.value} - ${identifier.value} - ${appName}`
  }),
  description: computed(() => {
    const appName = talastageApp.value?.name || 'TalaStage'
    return `Support your favorite ${entityDisplayName.value} (${identifier.value}) by sending them a tip on ${appName}. Show your appreciation!`
  }),
  keywords: computed(() => {
    return `tip, support, fan, appreciate, ${entityType.value}, ${
      identifier.value
    }, ${talastageApp.value?.name || 'TalaStage'}`
  }),
  image: computed(
    () => talastageApp.value?.logo_url || '/default-social-image.png'
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  url: computed(() => {
    const baseUrl = talastageApp.value?.canonical_url || 'https://talastage.com'
    return `${baseUrl}/tip/${entityType.value}/${identifier.value}`
  }),
  canonical: computed(() => {
    const baseUrl = talastageApp.value?.canonical_url || 'https://talastage.com'
    return `${baseUrl}/tip/${entityType.value}/${identifier.value}`
  }),
  openGraph: computed(() => ({
    title: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return `Give Tip to ${entityDisplayName.value} - ${identifier.value} - ${appName}`
    }).value,
    description: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return `Support your favorite ${entityDisplayName.value} (${identifier.value}) by sending them a tip on ${appName}. Show your appreciation!`
    }).value,
    url: computed(() => {
      const baseUrl =
        talastageApp.value?.canonical_url || 'https://talastage.com'
      return `${baseUrl}/tip/${entityType.value}/${identifier.value}`
    }).value,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return `Give Tip to ${entityDisplayName.value} - ${identifier.value} - ${appName}`
    }).value,
    description: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return `Support your favorite ${entityDisplayName.value} (${identifier.value}) by sending them a tip on ${appName}. Show your appreciation!`
    }).value,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
  })),
  link: computed(() => [
    { rel: 'icon', href: talastageApp.value?.favicon_url || '/favicon.ico' },
  ]),
})
</script>

<style lang="scss" scoped>
/* Add any page-specific styles if necessary */
</style>
