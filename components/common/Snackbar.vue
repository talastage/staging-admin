<template>
  <div
    v-if="isVisible"
    class="snackbar-container"
    :class="{ 'with-action': !!actionText }"
  >
    <div class="snackbar-content">
      <span>{{ message }}</span>
      <v-btn
        v-if="actionText"
        variant="text"
        color="white"
        class="ml-4"
        @click="handleAction"
      >
        {{ actionText }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps<{
  message: string;
  duration?: number;
  actionText?: string;
}>();

const emit = defineEmits<{
  (e: "action"): void;
  (e: "close"): void;
}>();

const isVisible = ref(false);
let timeout: NodeJS.Timeout;

const show = () => {
  isVisible.value = true;
  if (props.duration !== 0) {
    timeout = setTimeout(() => {
      hide();
    }, props.duration || 3000);
  }
};

const hide = () => {
  isVisible.value = false;
  emit("close");
};

const handleAction = () => {
  emit("action");
  hide();
};

onMounted(() => {
  show();
});

onBeforeUnmount(() => {
  if (timeout) clearTimeout(timeout);
});
</script>

<style scoped>
.snackbar-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  z-index: 9999;
  display: flex;
  align-items: center;
  min-width: 200px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.2s ease-out;
}

.snackbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.with-action {
  padding-right: 12px;
}

@keyframes slideUp {
  from {
    transform: translate(-50%, 100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}
</style>
