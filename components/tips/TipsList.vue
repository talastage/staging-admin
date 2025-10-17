<!-- components/tips/TipsList.vue -->
<template>
  <base-content title="Tips History">
    <template #action>
      <v-select
        :model-value="selectedFilter"
        @update:model-value="$emit('update:selectedFilter', $event)"
        :items="filters"
        item-title="text"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        class="filter-select"
      />
    </template>

    <template #content>
      <!-- Loading State (Initial) -->
      <v-sheet v-if="isLoading && !items.length" class="pa-6 text-center">
        <v-progress-circular indeterminate class="mb-4" />
        <div class="text-body-2 text-grey-darken-1">Loading tips...</div>
      </v-sheet>

      <!-- Tips List -->
      <v-list v-else-if="items.length">
        <tip-list-item
          v-for="tip in items"
          :key="tip.id"
          :tip="tip"
          :current-user-id="currentUserId"
        />

        <!-- Loading More State -->
        <v-list-item v-if="isLoading" class="pa-4">
          <v-list-item-title class="text-center">
            <v-progress-circular indeterminate />
          </v-list-item-title>
        </v-list-item>

        <!-- No More Items State -->
        <v-list-item v-else-if="!hasMore" class="pa-4">
          <v-list-item-title class="text-center text-grey">
            No more tips to load
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- Empty State (Only when not loading and no items) -->
      <v-sheet v-else class="pa-6 text-center">
        <v-icon
          icon="mdi-cash-multiple-off"
          size="64"
          color="grey-lighten-1"
          class="mb-4"
        />
        <div class="text-h6 text-grey">No Tips Found</div>
        <div class="text-body-2 text-grey-darken-1">
          There are no tips to display yet.
        </div>
      </v-sheet>
    </template>
  </base-content>
</template>

<script setup lang="ts">
import type { Tip } from '~/types/tips'

const props = defineProps<{
  items: Tip[]
  filters: { text: string; value: string }[]
  selectedFilter: string
  isLoading: boolean
  currentUserId: number
  hasMore: boolean
}>()

defineEmits<{
  'update:selectedFilter': [value: string]
}>()
</script>

<style scoped>
.filter-select {
  max-width: 150px;
}
</style>