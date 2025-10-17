<template>
  <v-container>
    <!-- Header -->
    <BaseHeader title="Media Details" />

    <!-- Loading State -->
    <v-skeleton-loader v-if="loading" type="article" />

    <!-- Error State -->
    <v-alert v-else-if="error" type="error">
      {{ error }}
    </v-alert>

    <!-- Project Detail -->
    <div v-else>
      <PremieringProjectDetail :project="mediaUploadStore.project" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#app'
import { usePremieringMediaUpload } from '@/stores/premiering/usePremieringMediaUpload'
import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: false, // Set this to true to have the drawer minimized on page load
  },
  layout: 'studio-project-layout',
  middleware: ['auth', 'noindex'],
})

const route = useRoute()
const { $axios } = useNuxtApp()
const mediaUploadStore = usePremieringMediaUpload()

const loading = ref(false)
const error = ref('')

onMounted(async () => {
  const accessUuid = route.params.access_uuid as string
  try {
    loading.value = true
    const { data } = await $axios.get(`/api/studio/projects/${accessUuid}`)
    mediaUploadStore.updateProject(data)
  } catch (err) {
    console.error('Error fetching project:', err)
    error.value = 'Error fetching project'
  } finally {
    loading.value = false
  }
})
</script>
