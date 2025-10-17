<template>
  <v-card class="ma-2" max-width="400" elevation="10">
    <v-card-text class="pa-4">
      <div class="d-flex align-center">
        <!-- Avatar skeleton -->
        <v-skeleton-loader
          type="avatar"
          width="50"
          height="50"
          class="me-4"
        ></v-skeleton-loader>

        <div class="flex-grow-1">
          <!-- Name and details skeletons -->
          <v-skeleton-loader type="text" class="mb-2"></v-skeleton-loader>
          <v-skeleton-loader type="text" width="70%"></v-skeleton-loader>
        </div>
      </div>

      <!-- Additional info skeletons -->
      <v-skeleton-loader
        type="text"
        class="mt-4"
        width="90%"
      ></v-skeleton-loader>
      <v-skeleton-loader
        type="text"
        class="mt-2"
        width="80%"
      ></v-skeleton-loader>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
// No additional logic needed
</script>

<style scoped>
.v-skeleton-loader {
  --skeleton-background-color: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
}

/* Optional: Add subtle animation */
:deep(.v-skeleton-loader__bone) {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
