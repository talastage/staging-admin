<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="460"
    transition="dialog-bottom-transition"
    :scrim="loading ? 'dark' : undefined"
  >
    <v-card class="confirm-delete-dialog" rounded="lg">
      <!-- Header -->
      <v-card-item class="pb-2">
        <template v-slot:prepend>
          <v-avatar color="error" variant="tonal" size="42" class="mr-4">
            <v-icon icon="mdi-alert-circle-outline" size="24" color="error" />
          </v-avatar>
        </template>
        <v-card-title class="text-h5 font-weight-bold">
          {{ title }}
        </v-card-title>
      </v-card-item>

      <!-- Content -->
      <v-card-text class="pt-4 pb-4 text-body-1">
        {{ message }}
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-4 pt-2">
        <v-spacer />
        <v-btn
          variant="text"
          color="medium-emphasis"
          class="text-capitalize"
          :disabled="loading"
          @click="onCancel"
          min-width="100"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          class="text-capitalize"
          :loading="loading"
          :disabled="loading"
          @click="onConfirm"
          min-width="100"
        >
          <v-icon start icon="mdi-delete-outline" />
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  title: string
  message: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const dialog = ref(props.modelValue)

// Sync with v-model
watch(
  () => props.modelValue,
  (newVal) => {
    dialog.value = newVal
  }
)

watch(dialog, (newVal) => {
  emit('update:modelValue', newVal)
})

// Add this watch in ConfirmDeleteDialog.vue
watch(
  () => props.loading,
  (newVal, oldVal) => {
    // If loading changes from true to false, it means the operation completed
    if (oldVal === true && newVal === false) {
      dialog.value = false
    }
  }
)

// Handle escape key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && dialog.value && !props.loading) {
    onCancel()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Methods
const onConfirm = () => {
  if (props.loading) return
  emit('confirm')
}

const onCancel = () => {
  if (props.loading) return
  emit('cancel')
}
</script>

<style scoped lang="scss">
.confirm-delete-dialog {
  overflow: hidden;

  :deep(.v-card-item) {
    padding: 24px 24px 0;
  }

  :deep(.v-card-text) {
    opacity: 0.85;
    padding-left: 90px; // Align with title considering the avatar
  }

  // Hover effects for buttons
  :deep(.v-btn) {
    transition: transform 0.2s ease;

    &:not(:disabled):hover {
      transform: translateY(-1px);
    }

    &:not(:disabled):active {
      transform: translateY(0);
    }
  }
}

// Optional: Add dark mode specific styles
:deep(.v-theme--dark) {
  .confirm-delete-dialog {
    .v-card-text {
      opacity: 0.75;
    }
  }
}
</style>
