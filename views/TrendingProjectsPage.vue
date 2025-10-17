<!-- trending.vue -->
<template>
  <div class="trending-projects">
    <ProjectGrid
      :projects="trendingProjects"
      :total-projects="totalProjects"
      :current-page="currentPage"
      :last-page="lastPage"
      :is-loading="loading"
      :skeleton-count="12"
      variant="grid"
      @load-more="fetchTrendingProjects"
    >
      <template #header>
        <BaseHeader title="All Trending Projects">
          <template #subtitle v-if="totalProjects">
            <p class="text-subtitle-1">{{ totalProjects }} projects</p>
          </template>
        </BaseHeader>
      </template>

      <template #empty-state>
        <div class="d-flex flex-column align-center justify-center py-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">
            mdi-trending-up
          </v-icon>
          <p class="text-body-1 text-grey-darken-1">
            No trending projects found.
          </p>
        </div>
      </template>
    </ProjectGrid>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'

const api = useApi()
const trendingProjects = ref([])
const loading = ref(false)
const currentPage = ref(1)
const lastPage = ref(1)
const totalProjects = ref(0)

const fetchTrendingProjects = async () => {
  // Don't fetch if we're loading or past the last page
  if (loading.value || currentPage.value > lastPage.value) return

  loading.value = true
  const { $axios } = useNuxtApp()

  try {
    const { data: response } = await $axios.get('/api/trending', {
      params: {
        page: currentPage.value,
        per_page: 12,
        days: 30,
      },
    })

    // For first page, replace projects. For subsequent pages, append
    if (currentPage.value === 1) {
      trendingProjects.value = response.data
    } else {
      trendingProjects.value = [...trendingProjects.value, ...response.data]
    }

    // Update pagination data
    if (response.meta) {
      currentPage.value = response.meta.current_page + 1
      lastPage.value = response.meta.last_page
      totalProjects.value = response.meta.total
    }
  } catch (error) {
    console.error('Error fetching trending projects:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTrendingProjects()
})
</script>

<style lang="scss" scoped>
.trending-projects {
  width: 100%;
  padding: 2rem 0;
}
</style>
