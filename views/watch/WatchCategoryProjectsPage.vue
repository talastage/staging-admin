<template>
  <v-container>
    <!-- Loading State -->
    <template v-if="isLoading && !category">
      <ProjectCategorySkeleton />
    </template>

    <!-- Error State -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error" :text="error" class="mb-4"></v-alert>
      </v-col>
    </v-row>

    <!-- Content -->
    <template v-else-if="category">
      <!-- Category Header -->
      <PremieringCategoryHeader :category="category" />
      <!-- Project Grid -->
      <ProjectGrid
        :projects="items"
        :current-page="currentPage"
        :last-page="lastPage"
        :is-loading="isLoading"
        variant="grid"
      >
        <!-- Empty State Slot -->
        <template #empty-state>
          <v-card class="text-center pa-8">
            <v-icon
              size="64"
              color="grey-lighten-1"
              icon="mdi-movie-open-off"
              class="mb-4"
            ></v-icon>
            <h3 class="text-h5 mb-2">No Premieres Available</h3>
            <p class="text-body-1 text-medium-emphasis">
              There are currently no premieres in this category
            </p>
          </v-card>
        </template>
      </ProjectGrid>
    </template>
  </v-container>
</template>

<script setup>
defineProps({
  category: {
    type: Object,
    default: null,
  },
  items: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  lastPage: {
    type: Number,
    default: 1,
  },
})
</script>
