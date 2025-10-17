<!-- components/premieres/CategorySkeleton.vue -->
<template>
  <div class="category-skeleton mb-12">
    <!-- Category Header Skeleton -->
    <div class="d-flex align-center mb-6">
      <v-skeleton-loader
        type="avatar"
        size="40"
        class="mr-3"
      ></v-skeleton-loader>
      <v-skeleton-loader type="text" width="200"></v-skeleton-loader>
    </div>

    <!-- Projects Grid Skeleton -->
    <v-row>
      <v-col v-for="n in 4" :key="n" cols="12" sm="6" md="4" lg="3">
        <ProjectCardSkeleton />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
defineProps({
  projectCount: {
    type: Number,
    default: 4,
  },
})
</script>
