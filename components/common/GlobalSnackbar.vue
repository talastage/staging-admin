<!-- components/GlobalSnackMessage.vue -->
<template>
  <v-snackbar
    v-model="snack.show"
    :color="snack.color"
    :timeout="snack.timeout"
    location="bottom right"
    class="global-snack"
  >
    <div class="d-flex align-center">
      <!-- Icons based on color -->
      <v-icon
        v-if="snack.color !== 'black'"
        class="mr-2"
        size="20"
        :icon="getIcon"
      />

      <span class="text-body-1">{{ snack.message }}</span>
    </div>

    <template v-if="snack.closable" #actions>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        @click="snack.closeSnack"
      />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSnackMessageStore } from '~/stores/useSnackMessage'

const snack = useSnackMessageStore()

const getIcon = computed(() => {
  switch (snack.color) {
    case 'success':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    case 'warning':
      return 'mdi-alert'
    case 'info':
      return 'mdi-information'
    default:
      return ''
  }
})
</script>

<style lang="scss" scoped>
.global-snack {
  :deep(.v-snackbar__wrapper) {
    border-radius: 8px;
    min-width: 300px;
    padding: 12px 16px;

    .v-snackbar__content {
      gap: 12px;
      padding: 0;
    }

    .v-btn--icon {
      margin-inline-start: 8px;
      opacity: 0.8;

      &:hover {
        opacity: 1;
      }
    }

    // Color-specific styles
    &.v-snackbar--color-success {
      background-color: rgb(var(--v-theme-success));
    }

    &.v-snackbar--color-error {
      background-color: rgb(var(--v-theme-error));
    }

    &.v-snackbar--color-warning {
      background-color: rgb(var(--v-theme-warning));
    }

    &.v-snackbar--color-info {
      background-color: rgb(var(--v-theme-info));
    }

    &.v-snackbar--color-black {
      background-color: rgb(var(--v-theme-surface-variant));
    }
  }

  .v-icon {
    flex-shrink: 0;
  }

  .text-body-1 {
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25;
  }
}
</style>
