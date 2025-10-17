<template>
  <div>
    <TalentCollectionDetailPage />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'
import { useRoute } from 'vue-router'

definePageMeta({
  middleware: ['auth', 'noindex'],
})

// Initialize the app store
const appsStore = useAppsStore()
const route = useRoute()

// Fetch the app data on mount
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})

// Get the app data
const talastageApp = computed(() => appsStore.talastageApp)
const collectionUuid = computed(() => route.params.uuid as string)

// Define SEO metadata dynamically using app data and route params
useSeo({
  title: computed(() => {
    const appName = talastageApp.value?.name || 'TalaStage'
    return collectionUuid.value
      ? `Collection Details - ${collectionUuid.value} - ${appName}`
      : `Talent Collection Details - ${appName}`
  }),
  description: computed(() => {
    const appName = talastageApp.value?.name || 'TalaStage'
    return collectionUuid.value
      ? `View the detailed information for talent collection ${collectionUuid.value} on ${appName}.`
      : `View the detailed information for a talent collection on ${appName}.`
  }),
  keywords: computed(
    () =>
      `talent collection, details, organize talents, view collection, ${
        talastageApp.value?.name || 'TalaStage'
      }`
  ),
  image: computed(
    () =>
      talastageApp.value?.logo_url || 'https://talastage.com/social-card.png'
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  url: computed(() =>
    talastageApp.value?.canonical_url && collectionUuid.value
      ? `${talastageApp.value.canonical_url}/talents/collections/${collectionUuid.value}`
      : talastageApp.value?.canonical_url
      ? `${talastageApp.value.canonical_url}/talents/collections`
      : 'https://talastage.com/talents/collections'
  ),
  noIndex: true, // User-specific page, no need for indexing
  canonical: computed(() =>
    talastageApp.value?.canonical_url && collectionUuid.value
      ? `${talastageApp.value.canonical_url}/talents/collections/${collectionUuid.value}`
      : talastageApp.value?.canonical_url
      ? `${talastageApp.value.canonical_url}/talents/collections`
      : 'https://talastage.com/talents/collections'
  ),
  openGraph: computed(() => ({
    title: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return collectionUuid.value
        ? `Collection Details - ${collectionUuid.value} - ${appName}`
        : `Talent Collection Details - ${appName}`
    }).value,
    description: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return collectionUuid.value
        ? `View the detailed information for talent collection ${collectionUuid.value} on ${appName}.`
        : `View the detailed information for a talent collection on ${appName}.`
    }).value,
    url: computed(() =>
      talastageApp.value?.canonical_url && collectionUuid.value
        ? `${talastageApp.value.canonical_url}/talents/collections/${collectionUuid.value}`
        : talastageApp.value?.canonical_url
        ? `${talastageApp.value.canonical_url}/talents/collections`
        : 'https://talastage.com/talents/collections'
    ).value,
    image:
      talastageApp.value?.logo_url || 'https://talastage.com/social-card.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return collectionUuid.value
        ? `Collection Details - ${collectionUuid.value} - ${appName}`
        : `Talent Collection Details - ${appName}`
    }).value,
    description: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      return collectionUuid.value
        ? `View the detailed information for talent collection ${collectionUuid.value} on ${appName}.`
        : `View the detailed information for a talent collection on ${appName}.`
    }).value,
    image:
      talastageApp.value?.logo_url || 'https://talastage.com/social-card.png',
  })),
  link: computed(() => [
    { rel: 'icon', href: talastageApp.value?.favicon_url || '/favicon.ico' },
  ]),
})
</script>

<style lang="scss" scoped></style>
