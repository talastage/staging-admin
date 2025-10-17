<template>
  <v-dialog
    v-model="internalDialog"
    :max-width="maxWidth"
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card class="confirm-dialog-card">
      <!-- Close button positioned absolutely -->
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        class="close-button"
        @click="closeDialog"
      />

      <v-card-text class="dialog-content text-center pa-6">
        <!-- Icon with animated background -->
        <div class="icon-wrapper mb-4">
          <v-icon
            :icon="icon"
            size="32"
            :color="iconColor"
            class="icon-animate"
          />
        </div>

        <!-- Title with modern typography -->
        <h3 class="text-h5 font-weight-medium mb-3">
          {{ title }}
        </h3>

        <!-- Message or custom content -->
        <slot>
          <p class="text-body-1 text-medium-emphasis">
            {{ message }}
          </p>
        </slot>

        <!-- Action button with modern design -->
        <v-btn
          :color="confirmColor"
          @click="confirmDialog"
          :loading="loading"
          block
          height="44"
          class="confirm-btn mt-6"
          :ripple="false"
          elevation="0"
        >
          <span class="text-button">{{ confirmText }}</span>
          <v-icon right class="ml-2">mdi-arrow-right</v-icon>
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Confirm Action' },
  message: {
    type: String,
    default: 'Are you sure you want to perform this action?',
  },
  icon: { type: String, default: 'mdi-alert-circle-outline' },
  iconColor: { type: String, default: 'primary' },
  confirmText: { type: String, default: 'Confirm' },
  confirmColor: { type: String, default: 'primary' },
  modelValue: Boolean,
  maxWidth: { type: String, default: '400px' }, // Increased width for better spacing
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const internalDialog = ref(props.modelValue)
const loading = ref(false)

watch(
  () => props.modelValue,
  (newVal) => {
    internalDialog.value = newVal
  }
)

watch(internalDialog, (newVal) => {
  emit('update:modelValue', newVal)
})

const closeDialog = () => {
  internalDialog.value = false
}

const confirmDialog = async () => {
  loading.value = true
  try {
    await emit('confirm')
  } finally {
    loading.value = false
    internalDialog.value = false
  }
}
</script>

<style scoped>
.confirm-dialog-card {
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.dialog-content {
  position: relative;
  z-index: 1;
}

.close-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.close-button:hover {
  opacity: 1;
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--v-theme-primary) 0%,
    rgba(var(--v-theme-primary), 0.2) 100%
  );
  position: relative;
  overflow: hidden;
}

.icon-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.2) 0%,
    transparent 70%
  );
  animation: pulse 2s infinite;
}

.icon-animate {
  position: relative;
  z-index: 1;
  animation: bounce 1s infinite;
}

.confirm-btn {
  border-radius: 12px;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
  transition: transform 0.2s ease;
}

.confirm-btn:hover {
  transform: translateY(-2px);
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

/* Add transition for dialog */
:deep(.dialog-bottom-transition-enter-active),
:deep(.dialog-bottom-transition-leave-active) {
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

:deep(.dialog-bottom-transition-enter-from),
:deep(.dialog-bottom-transition-leave-to) {
  transform: translateY(20px);
  opacity: 0;
}
</style>
