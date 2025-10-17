<template>
  <VDialog v-model="showDialog" persistent max-width="600px">
    <VCard>
      <VCardTitle class="text-h5">{{ title }}</VCardTitle>
      <VCardText>{{ message }}</VCardText>
      <VCardActions>
        <VSpacer></VSpacer>
        <VBtn color="blue darken-1" text @click="close">Close</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const showDialog = ref(false);
const title = ref("");
const message = ref("");

function showError(errorTitle, errorMessage) {
  title.value = errorTitle;
  message.value = errorMessage;
  showDialog.value = true;
}

function close() {
  showDialog.value = false;
}

// Expose the showError method so it can be called from the parent component
defineExpose({ showError });
</script>

<style scoped>
/* Add any styles for your ErrorDialog here */
</style>
