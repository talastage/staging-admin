<template>
  <div>
    <WalletPage />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, watch } from 'vue'

definePageMeta({
  middleware: ['auth', 'wallet-auth'],
})

const walletAuthStore = useWalletAuthStore()
const router = useRouter()

const logout = async () => {
  await walletAuthStore.logout()
  router.push('/wallet/verify-pin')
}

// Fetch app data for headers
const appsStore = useAppsStore()
await appsStore.fetchTalaStageApp()
const talastageApp = computed(() => appsStore.talastageApp)

// Setup headers
watch(
  () => talastageApp.value,
  (appData) => {
    if (appData) {
      const title = `My Wallet - ${appData.name || 'TalaStage'}`
      const description =
        'Manage your wallet, check balances, and track transactions securely.'

      useHead({
        title,
        meta: [
          { name: 'description', content: description },
          { property: 'og:title', content: title },
          { property: 'og:description', content: description },
          {
            property: 'og:image',
            content: appData.logo_url || '/default-social-image.png',
          },
          { property: 'og:type', content: 'website' },
          {
            property: 'og:url',
            content: `${
              appData.canonical_url || 'https://talastage.com'
            }/wallet`,
          },
          { name: 'twitter:title', content: title },
          { name: 'twitter:description', content: description },
          {
            name: 'twitter:image',
            content: appData.logo_url || '/default-social-image.png',
          },
          { name: 'twitter:card', content: 'summary_large_image' },
        ],
        link: [
          {
            rel: 'icon',
            type: 'image/png',
            href: appData.favicon_url || '/favicon.png',
          },
          {
            rel: 'canonical',
            href: `${appData.canonical_url || 'https://talastage.com'}/wallet`,
          },
        ],
      })
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
/* Add any page-specific styles if necessary */
</style>
