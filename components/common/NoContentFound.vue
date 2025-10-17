<template>
  <div class="no-content-found">
    <v-icon size="64" color="grey lighten-1">mdi-alert-circle-outline</v-icon>
    <p class="text-body-1 text-center mt-4">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    default: "No content found",
  },
});
</script>

<style scoped>
.no-content-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #f0f2f5;
  border-radius: 8px;
}
</style>
