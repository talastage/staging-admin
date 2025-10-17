<template>
  <Suspense>
    <template #default>
      <KeepAlive :max="10">
        <component
          :is="currentTabComponent"
          :username="username"
          :key="`${username}-${currentTab}`"
        />
      </KeepAlive>
    </template>
    <template #fallback>
      <div class="pa-4 d-flex flex-column align-center">
        <div class="loading-spinner"></div>
        <div class="mt-2">Loading...</div>
      </div>
    </template>
  </Suspense>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, h } from 'vue'
import { useRoute } from 'vue-router'
import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'page-profile-layout',
  keepalive: {
    max: 10,
    include: ['PageAbout', 'PageInvestments'],
  },
  middleware: ['auth'],
})

const route = useRoute()

// Use the username param as before
const username = computed(() => route.params.username)

// Set the default tab to 'about'
const currentTab = computed(() => route.params.tab || 'about')

// Simple loading component using only HTML elements
const LoadingComponent = () => h('div', { class: 'pa-4 d-flex flex-column align-center' }, [
  h('div', { class: 'loading-spinner' }),
  h('div', { class: 'mt-2' }, 'Loading...')
])

// Define only the tabs we want to support:
//  - about (new default)
//  - investments
const componentMap = {
  about: defineAsyncComponent({
    loader: () => import('@/components/page/profile/PageAbout.vue'),
    loadingComponent: LoadingComponent,
    errorComponent: () => h('div', 'Error loading component'),
    delay: 200,
    timeout: 10000,
  }),
  investments: defineAsyncComponent({
    loader: () => import('@/components/page/profile/PageInvestments.vue'),
    loadingComponent: LoadingComponent,
    errorComponent: () => h('div', 'Error loading component'),
    delay: 200,
    timeout: 10000,
  }),
}

// Use the selected component based on the current tab (defaulting to 'about')
const currentTabComponent = computed(() => {
  return componentMap[currentTab.value] || componentMap.about
})
</script>

<style scoped>
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #1867C0;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>