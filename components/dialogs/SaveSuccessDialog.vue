<template>
  <v-dialog v-model="isVisible" max-width="300">
    <v-card>
      <v-card-title>Success</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-btn color="primary" text @click="closeDialog">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
  
<script setup>
import { ref, defineProps, defineEmits, defineExpose } from 'vue';

const props = defineProps({
  message: {
    type: String,
    default: 'Operation successful'
  }
});

const emit = defineEmits();

const isVisible = ref(false);

const closeDialog = () => {
  isVisible.value = false;
  emit('closed');
};

const showDialog = () => {
  isVisible.value = true;
};

// Use defineExpose to expose methods to the parent component
defineExpose({ showDialog });
</script>
  