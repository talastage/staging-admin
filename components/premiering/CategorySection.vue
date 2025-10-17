<template>
  <div class="category-section">
    <!-- Category Header using BaseHeader -->
    <BaseHeader :title="category.name">
      <template #actionable>
        <ViewAllButton
          :route="`/watch/${category.slug}`"
          prependIcon="mdi-chevron-right"
          :title="`View All ${category.name}`"
        />
      </template>
    </BaseHeader>

    <!-- Projects Grid -->
    <ProjectGrid
      :projects="category.projects"
      :is-loading="false"
      :skeleton-count="8"
    >
      <!-- Empty State -->
      <template #empty-state>
        <v-card class="text-center pa-6">
          <v-icon
            size="64"
            color="grey-lighten-1"
            icon="mdi-movie-open-off"
            class="mb-4"
          />
          <h3 class="text-h6 mb-2">No Premieres Available</h3>
          <p class="text-body-1 text-medium-emphasis">
            There are currently no premieres in {{ category.name }}
          </p>
        </v-card>
      </template>
    </ProjectGrid>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Project {
  id: number
  access_uuid: string
  name: string
  description: string
  thumbnail_url?: string
  project_url?: string
  // Add other project properties as needed
}

interface Category {
  id?: number
  name: string
  slug: string
  avatar_url?: string
  projects: Project[]
  projects_count: number
}

interface Props {
  category: Category
}

// Props definition with type checking
const props = withDefaults(defineProps<Props>(), {
  category: () => ({
    name: '',
    slug: '',
    projects: [],
    projects_count: 0,
  }),
})

// Snackbar state
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
})

// Optional: Computed property for empty state message
const emptyStateMessage = computed(
  () => `There are currently no premieres in ${props.category.name}`
)
</script>

<style scoped>
.category-section {
  position: relative;
  margin-bottom: 24px;
}

.category-section::after {
  content: '';
  position: absolute;
  bottom: -24px;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(var(--v-border-color), var(--v-border-opacity));
}

.category-section:last-child::after {
  display: none;
}
</style>
