<template>
  <v-btn class="bg-lightsecondary primary" flat @click="openModal">{{ buttonText }}</v-btn>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  buttonText: {
    type: String,
    default: 'Save',
  },
});

const emit = defineEmits();

const openModal = () => {
  emit('open-modal', props.item);
};
</script>
