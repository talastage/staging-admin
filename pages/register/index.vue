<template>
  <div>
    <RegisterPage />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, watch } from 'vue'
import { useRoute } from '#app'
import { useSeo } from '@/composables/seo/useSeo'
import { PAGE_WIDTHS } from '~/constants/layouts'

const route = useRoute()

definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
    showHeader: true,
  },
  layout: 'auth-layout',
})
// Fetch app data for dynamic SEO
const appsStore = useAppsStore()
await appsStore.fetchTalaStageApp()
const talastageApp = computed(() => appsStore.talastageApp)

// SEO and Dynamic Headers Setup using useSeo composable
useSeo({
  title: computed(
    () => `Register - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      `Register on ${
        talastageApp.value?.name || 'TalaStage'
      } to join our community, create projects, invest, and more.`
  ),
  keywords: computed(
    () =>
      `register, sign up, account, join, ${
        talastageApp.value?.name || 'TalaStage'
      }`
  ),
  image: computed(
    () => talastageApp.value?.logo_url || '/default-social-image.png'
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  url: computed(
    () =>
      `${talastageApp.value?.canonical_url || 'https://talastage.com'}/register`
  ),
  noIndex: true, // Explicitly set noIndex
  canonical: computed(
    () =>
      `${talastageApp.value?.canonical_url || 'https://talastage.com'}/register`
  ),
  openGraph: computed(() => ({
    title: `Register - ${talastageApp.value?.name || 'TalaStage'}`,
    description: `Register on ${
      talastageApp.value?.name || 'TalaStage'
    } to join our community, create projects, invest, and more.`,
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/register`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Register - ${talastageApp.value?.name || 'TalaStage'}`,
    description: `Register on ${
      talastageApp.value?.name || 'TalaStage'
    } to join our community, create projects, invest, and more.`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
  })),
  link: computed(() => [
    {
      rel: 'icon',
      type: 'image/png',
      href: talastageApp.value?.favicon_url || '/favicon.png',
    },
  ]),
})
</script>
