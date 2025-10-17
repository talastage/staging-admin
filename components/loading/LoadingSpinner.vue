<template>
  <div class="loading-spinner-container">
    <v-progress-circular
      :size="size"
      :width="width"
      :color="color"
      indeterminate
    ></v-progress-circular>
  </div>
</template>

<script setup lang="ts">
defineProps({
  size: {
    type: Number,
    default: 50,
  },
  width: {
    type: Number,
    default: 4,
  },
  color: {
    type: String,
    default: "primary",
  },
});
</script>

<style scoped>
.loading-spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}
</style>
