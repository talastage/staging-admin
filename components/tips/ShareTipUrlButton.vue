<template>
  <v-btn 
    :elevation="size === 'small' ? '2' : '10'" 
    color="primary" 
    @click="openShareDialog"
    :size="size"
    :variant="size === 'small' ? 'outlined' : 'elevated'"
  >
    <v-icon :left="size !== 'small'" :size="size === 'small' ? '16' : 'default'">mdi-share-variant</v-icon>
    <span v-if="size !== 'small'">Share Tip Link</span>
  </v-btn>

  <TipUrlShareDialog
    v-model="showDialog"
    :entity-type="entityType"
    :entity="entity"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  entityType: {
    type: String,
    required: true,
    validator: (value: string) => ["user", "project"].includes(value),
  },
  entity: {
    type: Object,
    required: true,
  },
  size: {
    type: String,
    default: 'default',
    validator: (value: string) => ['small', 'default'].includes(value)
  }
});

const showDialog = ref(false);

const openShareDialog = () => {
  showDialog.value = true;
};
</script>
