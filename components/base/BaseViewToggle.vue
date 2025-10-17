<!-- components/base/BaseViewToggle.vue -->
<template>
  <div class="d-flex align-center">
    <v-spacer />
    <v-btn-toggle
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      mandatory
      density="comfortable"
      color="primary"
      rounded="lg"
    >
      <v-btn value="grid">
        <template #prepend>
          <v-icon icon="mdi-view-grid-outline" size="20" />
        </template>
        <v-tooltip activator="parent" location="top">Grid View</v-tooltip>
      </v-btn>
      <v-btn value="list">
        <template #prepend>
          <v-icon icon="mdi-view-list-outline" size="20" />
        </template>
        <v-tooltip activator="parent" location="top">List View</v-tooltip>
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script setup lang="ts">
type ViewType = 'grid' | 'list'

interface Props {
  modelValue: ViewType
}

defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: ViewType]
}>()
</script>
