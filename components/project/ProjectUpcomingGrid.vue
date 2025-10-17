<template>
  <div class="project-upcoming-grid">
    <v-container fluid class="pa-0">
      <!-- Grid Layout -->
      <v-row>
        <v-col
          v-for="premiere in premieres"
          :key="premiere.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          class="pa-2"
        >
          <upcoming-premiere-card :premiere="premiere" />
        </v-col>

        <!-- Skeleton Loaders -->
        <template v-if="isLoading">
          <v-col
            v-for="n in skeletonCount"
            :key="`skeleton-${n}`"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            class="pa-2"
          >
            <project-card-skeleton />
          </v-col>
        </template>

        <!-- Empty State: when no premieres are loaded -->
        <v-col v-if="!isLoading && premieres.length === 0" cols="12">
          <slot name="empty-state">
            <v-alert type="info" variant="tonal" class="text-center">
              No upcoming premieres found
            </v-alert>
          </slot>
        </v-col>
      </v-row>

      <!-- End of Content Message: when items exist but no more pages -->
      <div
        v-if="!isLoading && premieres.length > 0 && currentPage > lastPage"
        class="mt-4 mb-6"
      >
        <v-alert type="info" variant="tonal" class="text-center">
          No more upcoming premieres
        </v-alert>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UpcomingPremiere } from '@/types/premiere'

interface Props {
  premieres: UpcomingPremiere[]
  currentPage: number
  lastPage: number
  isLoading: boolean
  title?: string
  skeletonCount?: number
}

const props = defineProps<Props>()

// Set default skeleton count if not provided
const skeletonCount = computed(() => props.skeletonCount ?? 8)
</script>

<style scoped>
.project-upcoming-grid {
  width: 100%;
  max-width: 100%;
}
</style>
