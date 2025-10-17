<!-- RecommendedPremieringCategoryProjects.vue -->
<template>
  <div class="recommended-category-projects">
    <BaseHeader :title="title">
      <template #actionable>
        <ViewAllButton :route="`/${premieringCategorySlug}`" />
      </template>
    </BaseHeader>

    <ProjectGrid
      :projects="projects"
      :is-loading="loading"
      :current-page="1"
      :last-page="1"
      :skeleton-count="8"
      variant="grid"
    >
      <!-- Custom empty state -->
      <template #empty-state>
        <v-icon size="64" color="grey-lighten-1" class="mb-4">
          mdi-movie-open-off
        </v-icon>
        <p class="text-body-1">
          No recommended projects found in this category.
        </p>
      </template>
    </ProjectGrid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useNuxtApp } from '#app'
import type { Project } from '@/types/project'

const props = defineProps({
  premieringCategorySlug: String,
  title: String,
})

const projects = ref<Project[]>([])
const loading = ref(false)
const { $axios } = useNuxtApp()

const fetchProjects = async () => {
  try {
    loading.value = true
    const response = await $axios.get(
      `/guest/recommended/projects/${props.premieringCategorySlug}`
    )
    projects.value = response.data.projects
  } catch (err) {
    console.error('Error fetching projects:', err)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.premieringCategorySlug,
  (newSlug, oldSlug) => {
    if (newSlug !== oldSlug) {
      projects.value = []
      fetchProjects()
    }
  },
  { immediate: true }
)

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.recommended-category-projects {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}
</style>
