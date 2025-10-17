<!-- components/common/LoadError.vue -->
<template>
  <v-card class="load-error pa-4" flat>
    <div class="d-flex flex-column align-center">
      <v-icon
        icon="mdi-alert-circle"
        color="error"
        size="48"
        class="mb-4"
      ></v-icon>

      <h3 class="text-h6 mb-2">Failed to Load Content</h3>
      <p class="text-body-1 text-grey-darken-1 text-center mb-4">
        {{ message || "Something went wrong while loading this content." }}
      </p>

      <v-btn color="primary" @click="handleRetry" :loading="retrying">
        Try Again
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  message?: string;
  onRetry?: () => Promise<void>;
}>();

const retrying = ref(false);

const handleRetry = async () => {
  if (!props.onRetry) return;

  retrying.value = true;
  try {
    await props.onRetry();
  } finally {
    retrying.value = false;
  }
};
</script>

<style lang="scss" scoped>
.load-error {
  background-color: rgb(var(--v-theme-background));
  border: 1px solid rgb(var(--v-theme-error), 0.12);
  border-radius: 8px;
}
</style>
