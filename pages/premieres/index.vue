<template>
  <div>
    <PremieresPage />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useAppsStore } from '@/stores/useApps'
import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: false, // Set this to true to have the drawer minimized on page load
  },
  layout: 'default',
})

// Access the apps store
const appsStore = useAppsStore()

// Fetch the app data
await appsStore.fetchTalaStageApp()

// Get the app details
const talastageApp = computed(() => appsStore.talastageApp)

// SEO for Explore Premieres Page
watch(
  () => talastageApp.value,
  (appData) => {
    if (appData) {
      const title = `Explore Premieres - ${appData.name}`
      const description =
        'Discover the latest premiered projects and videos from top entertainment talents. Connect, enjoy, and share exclusive content.'
      const image =
        appData.thumbnail_url ||
        appData.logo_url ||
        'https://talastage.com/default-thumbnail.png'

      useHead({
        htmlAttrs: {
          lang: 'en',
        },
        title,
        meta: [
          { charset: 'utf-8' },
          { name: 'description', content: description },
          {
            name: 'keywords',
            content: 'premieres, videos, entertainment, exclusive content',
          },
          { property: 'og:title', content: title },
          { property: 'og:description', content: description },
          { property: 'og:image', content: image },
          {
            property: 'og:url',
            content: `${
              appData.canonical_url || 'https://talastage.com'
            }/explore-premieres`,
          },
          { property: 'og:type', content: 'website' },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:site', content: '@talastage' },
          { name: 'twitter:title', content: title },
          { name: 'twitter:description', content: description },
          { name: 'twitter:image', content: image },
        ],
        link: [
          {
            rel: 'icon',
            type: 'image/png',
            href: appData.favicon_url || '/talastage-icon.png',
          },
          {
            rel: 'canonical',
            href: `${
              appData.canonical_url || 'https://talastage.com'
            }/explore-premieres`,
          },
        ],
        script: [
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: 'Explore Premieres',
              description,
              url: `${
                appData.canonical_url || 'https://talastage.com'
              }/explore-premieres`,
              image,
            }),
          },
        ],
        __dangerouslyDisableSanitizers: ['script'],
      })
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
/* Add custom styling for Explore Premieres page if needed */
</style>
