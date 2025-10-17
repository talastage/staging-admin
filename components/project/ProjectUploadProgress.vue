<template>
    <v-progress-linear indeterminate color="primary"></v-progress-linear>
  </template>
  
  <script setup lang="ts">
  const props = defineProps({
    progress: Number,
  });
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  