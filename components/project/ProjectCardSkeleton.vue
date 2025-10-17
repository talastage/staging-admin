<template>
  <v-card class="project-card-skeleton" flat>
    <v-skeleton-loader type="card" :loading="true" class="mx-auto">
      <v-card-text>
        <v-skeleton-loader
          type="image"
          height="200"
          class="mb-2"
        ></v-skeleton-loader>
        <v-skeleton-loader type="text" class="mt-2"></v-skeleton-loader>
        <v-skeleton-loader
          type="text"
          width="60%"
          class="mt-2"
        ></v-skeleton-loader>
      </v-card-text>
    </v-skeleton-loader>
  </v-card>
</template>

<script setup lang="ts">
// No props or logic needed for this component
</script>

<style scoped>
.project-card-skeleton {
  height: 100%;
}
</style>
