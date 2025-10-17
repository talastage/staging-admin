<!-- components\base\BaseContent.vue -->
<template>
  <v-card elevation="10" class="mx-auto">
    <v-card-item class="py-4 px-6">
      <div
        class="d-flex flex-column flex-sm-row align-sm-center justify-space-between"
      >
        <div>
          <v-card-title class="text-h5 mb-1">{{ title }}</v-card-title>
          <v-card-subtitle v-if="subtitle" class="text-subtitle-1">{{
            subtitle
          }}</v-card-subtitle>
        </div>
        <div class="mt-2 mt-sm-0">
          <slot name="action"></slot>
        </div>
      </div>
    </v-card-item>
    <v-divider></v-divider>
    <v-card-text>
      <slot name="content" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps({
  title: String,
  subtitle: String,
})
</script>
