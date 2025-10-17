<template>
  <v-alert type="error" v-if="error">
    <p v-if="errorType === 'network'">Network error. Please try again later.</p>
    <p v-else>{{ error }}</p>
  </v-alert>
</template>

<script setup>
const props = defineProps({
  error: String,
  errorType: {
    type: String,
    default: "",
  },
});
</script>

<style scoped></style>
