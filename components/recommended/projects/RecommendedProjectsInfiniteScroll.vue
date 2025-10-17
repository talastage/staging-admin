<!-- components/recommended/projects/RecommendedProjectsInfiniteScroll.vue -->
<template>
  <div class="recommended-projects">
    <!-- Loading State -->
    <template v-if="isLoading && displayedProjects.length === 0">
      <ProjectGrid
        :projects="[]"
        :is-loading="true"
        :skeleton-count="6"
        variant="grid"
      />
    </template>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      :text="error"
      class="mb-4"
      closable
    />

    <!-- Content -->
    <template v-else>
      <ProjectGrid
        :projects="displayedProjects"
        :is-loading="isLoading"
        variant="grid"
        :skeleton-count="6"
        :current-page="currentPage"
        :last-page="lastPage"
        @load-more="handleLoadMore"
      >
        <!-- Empty State Slot -->
        <template #empty-state>
          <v-card class="text-center pa-8" elevation="10">
            <v-icon
              size="64"
              color="grey-lighten-1"
              icon="mdi-movie-open-off"
              class="mb-4"
            />
            <h3 class="text-h5 mb-2">No Recommended Projects</h3>
            <p class="text-body-1 text-medium-emphasis">
              We don't have any recommended projects for you at the moment.
            </p>
          </v-card>
        </template>
      </ProjectGrid>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProjectGrid from '@/components/project/ProjectGrid.vue';
import { useRecommendedProjects } from '@/composables/useRecommendedProjects';
import type { Project } from '@/types/project';

// Props
const props = defineProps({
  projects: {
    type: Array as () => Project[],
    required: false,
    default: () => [],
  },
});

// Initialize the composable with the server-fetched projects
const { 
  displayedProjects, 
  isLoading, 
  error, 
  pagination, 
  loadMoreProjects,
  recommendedProjects
} = useRecommendedProjects(props.projects);

// Watch for prop changes and update the composable state
watch(() => props.projects, (newProjects) => {
  if (newProjects && newProjects.length > 0) {
    recommendedProjects.value = [...newProjects];
  }
}, { immediate: true, deep: true });

// Map pagination values for ProjectGrid
const currentPage = computed(() => pagination.value.currentPage);
const lastPage = computed(() => pagination.value.lastPage);

// Called by ProjectGrid's @load-more event
function handleLoadMore() {
  if (!isLoading.value && currentPage.value < lastPage.value) {
    loadMoreProjects();
  }
}
</script>

<style scoped>
.recommended-projects {
  position: relative;
  min-height: 200px;
}
</style>