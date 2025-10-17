<template>
  <div>
    <TalentsPage />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'

const route = useRoute()
const appsStore = useAppsStore()

// Fetch app data for dynamic content
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})
const appName = computed(() => appsStore.talastageApp?.name || 'TalaStage')
const canonicalUrl = computed(
  () => appsStore.talastageApp?.canonical_url || 'https://talastage.com'
)
const logoUrl = computed(
  () => appsStore.talastageApp?.logo_url || '/default-social-image.png'
)

const pageTitle = computed(() => `Discover Talents - ${appName.value}`)
const pageDescription = computed(
  () =>
    `Explore a diverse range of talented individuals and connect with the best talent on ${appName.value}. Browse by category.`
)
const pageKeywords = computed(
  () =>
    `talents, categories, find talent, connect, artists, professionals, ${appName.value}`
)
const pageUrl = computed(() => `${canonicalUrl.value}/talents`)

useSeo({
  title: pageTitle,
  description: pageDescription,
  keywords: pageKeywords,
  image: logoUrl,
  type: 'website',
  siteName: appName,
  url: pageUrl,
  canonical: pageUrl,
  openGraph: computed(() => ({
    title: pageTitle.value,
    description: pageDescription.value,
    url: pageUrl.value,
    image: logoUrl.value,
    siteName: appName.value,
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: pageTitle.value,
    description: pageDescription.value,
    image: logoUrl.value,
  })),
})
</script>

<style scoped></style>
