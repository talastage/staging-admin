<template>
  <v-card class="pa-4" outlined @click="selectMethod">
    <v-card-title>
      <v-avatar left>
        <v-icon>mdi-credit-card"></v-icon>
      </v-avatar>
      <span>{{ method.payment_method.name }}</span>
    </v-card-title>
  </v-card>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  method: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["method-selected"]);

const selectMethod = () => {
  emit("method-selected", props.method);
};
</script>

<style scoped>
/* Add any specific styles for your component here */
</style>
