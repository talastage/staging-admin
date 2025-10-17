<template>
  <TransitionGroup name="toast" tag="div" class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="[`toast--${toast.type}`]"
    >
      <span class="toast__message">{{ toast.message }}</span>
      <v-btn
        v-if="toast.action"
        variant="text"
        size="small"
        class="toast__action"
        @click="toast.action.callback"
      >
        {{ toast.action.label }}
      </v-btn>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useNotifications } from "@/composables/useNotifications";

const { toasts } = useNotifications();
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast {
  background: #333;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
}

.toast--success {
  background: #4caf50;
}

.toast--error {
  background: #f44336;
}

.toast__message {
  font-size: 0.875rem;
}

.toast__action {
  color: white !important;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  font-weight: 500;
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
