<template>
    <div>
      <v-row v-if="isLoading" justify="center" class="my-8">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-row>
      <v-row v-else-if="error">
        <v-col>
          <v-alert type="error" class="ma-6">
            {{ error }}
          </v-alert>
        </v-col>
      </v-row>
      <v-row v-else>
        <slot></slot>
      </v-row>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps } from "vue";
  
  const props = defineProps({
    isLoading: Boolean,
    error: String,
  });
  </script>
  