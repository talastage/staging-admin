<template>
    <v-dialog v-model="localModelValue" :max-width="size">
      <v-card :class="{ rounded: rounded }">
        <v-card-title>
          <span>{{ title }}</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text>
          <slot></slot>
        </v-card-text>
        
        <v-card-actions v-if="actions && actions.length">
          <v-btn v-for="(action, index) in actions" :key="index" :color="action.color" @click="action.handler">
            {{ action.label }}
          </v-btn>
        </v-card-actions>
        
        <v-card-subtitle v-if="footer">
          <slot name="footer"></slot>
        </v-card-subtitle>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, defineProps, defineEmits, watch } from 'vue';
  
  const props = defineProps({
    title: { type: String, default: 'Dialog Title' },
    size: { type: String, default: '600px' },
    actions: { type: Array, default: () => [] },
    modelValue: { type: Boolean, default: false },
    rounded: { type: Boolean, default: false },
    footer: { type: Boolean, default: false }
  });
  
  const localModelValue = ref(props.modelValue);
  const emits = defineEmits(['update:modelValue']);
  
  watch(localModelValue, (newValue) => {
    emits('update:modelValue', newValue);
  });
  
  const close = () => {
    localModelValue.value = false;
  };
  </script>
  
  <style scoped>
  /* Add any additional styles specific to your custom dialog here */
  </style>
  