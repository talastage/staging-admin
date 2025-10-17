<template>
    <div>
      <p>Type: {{ type }}</p>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  
  const props = defineProps({
    type: String
  });
  </script>
  
  <style scoped>
  /* Add any specific styles for CartItemType here */
  </style>
  