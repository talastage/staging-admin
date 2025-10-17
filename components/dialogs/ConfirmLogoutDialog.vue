<template>
  <v-dialog
    v-model="dialogModel"
    :width="400"
    transition="dialog-bottom-transition"
    persistent
  >
    <v-card class="logout-dialog" elevation="8">
      <v-card-item class="text-center pb-0">
        <v-icon
          icon="mdi-logout-variant"
          size="x-large"
          color="primary"
          class="mb-4"
        />
        <v-card-title class="text-h5 font-weight-medium text-center d-block">
          Confirm Logout
        </v-card-title>
        <v-card-text class="text-body-1 text-medium-emphasis mt-4">
          Are you sure you want to log out?
        </v-card-text>
      </v-card-item>

      <v-card-actions class="pa-6">
        <v-row justify="space-between">
          <v-col cols="6" class="pa-2">
            <v-btn
              block
              variant="tonal"
              @click="dialogModel = false"
              :disabled="loading"
              class="text-none"
            >
              Cancel
            </v-btn>
          </v-col>
          <v-col cols="6" class="pa-2">
            <v-btn
              block
              color="primary"
              variant="elevated"
              @click="confirmLogout"
              :loading="loading"
              class="text-none"
            >
              <v-icon icon="mdi-logout" class="mr-1" />
              Logout
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";

interface Props {
  modelValue: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
}>();

// Using computed property for v-model instead of watchers
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const confirmLogout = () => {
  emit("confirm");
};
</script>

<style lang="scss" scoped>
.logout-dialog {
  border-radius: 16px;
  overflow: hidden;

  :deep(.v-card-item) {
    padding-top: 32px;
  }

  :deep(.v-card-title) {
    font-size: 1.5rem;
    line-height: 1.3;
  }

  :deep(.v-card-text) {
    opacity: 0.85;
  }
}

// Animation classes
:deep(.dialog-bottom-transition-enter-active),
:deep(.dialog-bottom-transition-leave-active) {
  transition: transform 0.3s ease-in-out;
}

:deep(.dialog-bottom-transition-enter-from),
:deep(.dialog-bottom-transition-leave-to) {
  transform: translateY(100%);
}
</style>
