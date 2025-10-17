<template>
  <div>
    <LoginPage />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { PAGE_WIDTHS } from '@/constants/layouts'
import { useSeo } from '@/composables/seo/useSeo'
import { useRoute } from '#app'
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

// Fetch app data for dynamic headers and SEO
const appsStore = useAppsStore()
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})
const talastageApp = computed(() => appsStore.talastageApp)

// SEO and Dynamic Headers Setup
useSeo({
  title: computed(() => `Login - ${talastageApp.value?.name || 'TalaStage'}`),
  description: computed(
    () =>
      `Access your ${
        talastageApp.value?.name || 'TalaStage'
      } account securely. Log in to manage your profile, projects, and more.`
  ),
  keywords: computed(
    () =>
      `login, sign in, access account, ${
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
      `${talastageApp.value?.canonical_url || 'https://talastage.com'}/login`
  ),
  canonical: computed(
    () =>
      `${talastageApp.value?.canonical_url || 'https://talastage.com'}/login`
  ),
  noIndex: true, // Login page should not be indexed
  openGraph: computed(() => ({
    title: `Login - ${talastageApp.value?.name || 'TalaStage'}`,
    description: `Access your ${
      talastageApp.value?.name || 'TalaStage'
    } account securely. Log in to manage your profile, projects, and more.`,
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/login`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    type: 'website',
    siteName: talastageApp.value?.name || 'TalaStage',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Login - ${talastageApp.value?.name || 'TalaStage'}`,
    description: `Access your ${
      talastageApp.value?.name || 'TalaStage'
    } account securely. Log in to manage your profile, projects, and more.`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
  })),
  link: computed(() => [
    {
      rel: 'icon',
      type: 'image/png',
      href: talastageApp.value?.favicon_url || '/favicon.png',
    },
    {
      rel: 'canonical',
      href: `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/login`,
    },
  ]),
})
</script>
