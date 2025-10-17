<!-- components/PageLoadingOverlay.vue -->
<script setup lang="ts">
const loading = inject('globalLoading', ref(false))
</script>

<template>
  <v-overlay v-model="loading" class="align-center justify-center">
    <v-progress-circular size="64" color="primary" indeterminate />
  </v-overlay>
</template>
