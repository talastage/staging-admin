<!-- pages/watch/[access_uuid]/index.vue -->
<template>
  <div class="watch-page-container">
    <div v-if="pending" class="loading-container">
      <p>Loading...</p>
    </div>
    <div v-else-if="!project" class="error-container">
      <p>Failed to load project data.</p>
    </div>
    <ClientOnly v-else>
      <WatchProjectPage
        :access-uuid="accessUuid"
        :project="project"
        :credits="credits || []"
        :recommended-projects="recommendedProjects || []"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
/**
 * Watch Video Page - Individual video viewing page
 */
import { useProjectSeo } from '~/composables/useProjectSeo';
import type { WatchProject } from '~/types/watch'

definePageMeta({
  layout: 'default',
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
})

const route = useRoute()
const { $api } = useNuxtApp()
const accessUuid = route.params.access_uuid as string

// Fetch project data with SSR support
const { data: project, pending, error } = await useAsyncData<WatchProject>(
  `watch-project-${accessUuid}`,
  () => $api.get(`/api/projects/${accessUuid}/watch`, {
    params: { timezone: 'UTC' }
  }).then(res => res.data),
  { server: true, lazy: false }
)

// Fetch credits
const { data: credits } = await useAsyncData(
  `watch-credits-${accessUuid}`,
  () => $api.get(`/guest/projects/${accessUuid}/credits`, {
    params: { limit: 10 }
  }).then(res => res.data?.flatMap((cat: any) => cat.credits) || []),
  { server: true, lazy: true }
)

// Fetch recommended projects
const { data: recommendedProjects } = await useAsyncData(
  'recommended-projects',
  () => $api.get('/api/recommended/projects', {
    params: { page: 1 }
  }).then(res => res.projects || []),
  { server: true, lazy: true }
)

// Set up SEO metadata using the composable
useProjectSeo(project, accessUuid)

</script>

<style scoped>
.watch-page-container {
  min-height: 100vh;
  width: 100%;
}

.loading-container,
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  font-size: 1.2rem;
}
</style>
