<!-- pages/[username]/[tab].vue -->
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
import {
  ref,
  computed,
  onMounted,
  watch,
  defineAsyncComponent,
  nextTick,
} from 'vue'
import { useRoute } from 'vue-router'
import { PAGE_WIDTHS } from '~/constants/layouts'
import { h } from 'vue'

// Page meta
definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'user-profile-layout',
  middleware: ['auth'],
  keepalive: {
    max: 10,
    include: [
      'UserProjects',
      'UserCredits',
      'UserInvestments',
      'UserWatching',
      'UserFans',
      'UserFanning',
    ],
  },
})

// Setup
const route = useRoute()

// Computed
const username = computed(() => route.params.username)
const currentTab = computed(() => route.params.tab || 'projects')

// Simple loading component using only HTML elements
const LoadingComponent = () => h('div', { class: 'pa-4 d-flex flex-column align-center' }, [
  h('div', { class: 'loading-spinner' }),
  h('div', { class: 'mt-2' }, 'Loading...')
])

// Dynamic component loading with better error handling
const currentTabComponent = computed(() => {
  const componentMap = {
    projects: defineAsyncComponent({
      loader: () => import('@/components/profile/UserProjects.vue'),
      loadingComponent: LoadingComponent,
      errorComponent: () => h('div', 'Error loading component'),
      delay: 200,
      timeout: 10000,
    }),
    investments: defineAsyncComponent({
      loader: () => import('@/components/profile/UserInvestments.vue'),
      loadingComponent: LoadingComponent,
      errorComponent: () => h('div', 'Error loading component'),
      delay: 200,
      timeout: 10000,
    }),
    castings: defineAsyncComponent({
      loader: () => import('@/components/profile/UserCredits.vue'),
      loadingComponent: LoadingComponent,
      errorComponent: () => h('div', 'Error loading component'),
      delay: 200,
      timeout: 10000,
    }),
    credits: defineAsyncComponent({
      loader: () => import('@/components/profile/UserCredits.vue'),
      loadingComponent: LoadingComponent,
      errorComponent: () => h('div', 'Error loading component'),
      delay: 200,
      timeout: 10000,
    }),
    watching: defineAsyncComponent({
      loader: () => import('@/components/profile/UserWatching.vue'),
      loadingComponent: LoadingComponent,
      errorComponent: () => h('div', 'Error loading component'),
      delay: 200,
      timeout: 10000,
    }),
    fans: defineAsyncComponent({
      loader: () => import('@/components/profile/UserFans.vue'),
      loadingComponent: LoadingComponent,
      errorComponent: () => h('div', 'Error loading component'),
      delay: 200,
      timeout: 10000,
    }),
    fanning: defineAsyncComponent({
      loader: () => import('@/components/profile/UserFanning.vue'),
      loadingComponent: LoadingComponent,
      errorComponent: () => h('div', 'Error loading component'),
      delay: 200,
      timeout: 10000,
    }),
    followers: defineAsyncComponent({
      loader: () => import('@/components/profile/UserFans.vue'),
      loadingComponent: LoadingComponent,
      errorComponent: () => h('div', 'Error loading component'),
      delay: 200,
      timeout: 10000,
    }),
    following: defineAsyncComponent({
      loader: () => import('@/components/profile/UserFanning.vue'),
      loadingComponent: LoadingComponent,
      errorComponent: () => h('div', 'Error loading component'),
      delay: 200,
      timeout: 10000,
    }),
  }

  return componentMap[currentTab.value] || componentMap.projects
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