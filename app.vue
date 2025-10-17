<template>
  <div>
    <!-- Loading Indicator - Shows during page navigation -->
    <NuxtLoadingIndicator />
    
    <!-- Loading Screen - CLIENT ONLY (doesn't block SSR) -->
    <ClientOnly>
      <AppLoadingScreen v-if="isLoading" />
    </ClientOnly>
    
    <!-- Main App - Always rendered for SSR -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
/**
 * Root App Component
 * 
 * Features:
 * - Loading screen only on client (doesn't block SSR)
 * - Pages fully render during SSR for SEO
 * - Minimal SEO configuration - only titleTemplate
 * 
 * SEO Strategy (Best Practice for Nuxt 3 SSR):
 * - App.vue: Only titleTemplate (this file)
 * - nuxt.config.ts: Only essential global meta tags (charset, viewport, favicon)
 * - Pages: Define ALL SEO meta tags directly using useHead() for full control
 * - NO composables to avoid conflicts and ensure SSR reliability
 * 
 * CRITICAL: Loading screen wrapped in ClientOnly to NOT block SSR
 */

import { ref, onMounted } from 'vue'

// Loading state - only for client-side
const isLoading = ref(true)

// Hide loading screen after app is ready (CLIENT ONLY)
onMounted(() => {
  // Give the app a moment to initialize and render
  setTimeout(() => {
    isLoading.value = false
  }, 800) // Adjust timing as needed
})

// SEO Configuration - ONLY titleTemplate
// Pages define their own complete SEO meta tags
useHead({
  titleTemplate: (pageTitle) => {
    // If no page title or same as site name, return site name only
    if (!pageTitle || pageTitle === 'TalaStage') {
      return 'TalaStage'
    }
    // Otherwise append site name to page title
    return `${pageTitle} | TalaStage`
  },
})
</script>

<style>
/* Prevent layout shift during loading */
body {
  margin: 0;
  padding: 0;
  background-color: rgb(243, 244, 247);
}
</style>
