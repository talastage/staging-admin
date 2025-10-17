<template>
  <v-snackbar v-model="show" :timeout="timeout" bottom>
    <template v-if="messageType === 'success'">
      <v-icon left>mdi-check-circle</v-icon>
      {{ message }}
    </template>
    <template v-else-if="messageType === 'error'">
      <v-icon left>mdi-alert-circle</v-icon>
      {{ message }}
    </template>
    <template v-else>
      {{ message }}
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, watch, defineProps } from "vue";

const props = defineProps({
  message: String,
  timeout: {
    type: Number,
    default: 3000,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  messageType: {
    type: String,
    default: "info",
    validator: (value) => ["success", "error", "info"].includes(value),
  },
});

const show = ref(props.visible);

watch(
  () => props.visible,
  (newVal) => {
    show.value = newVal;
  }
);

watch(show, (newVal) => {
  if (!newVal) {
    // Reset message when snackbar hides
    setTimeout(() => {
      show.value = false;
    }, props.timeout);
  }
});
</script>

<style scoped>
.v-icon {
  margin-right: 8px;
}
</style>
