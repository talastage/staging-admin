<template>
  <v-autocomplete
    :model-value="modelValue"
    @update:model-value="updateValue"
    :items="categories"
    item-title="name"
    item-value="id"
    :label="label"
    :placeholder="placeholder"
    :clearable="clearable"
    :hide-details="hideDetails"
    :loading="loading"
    :disabled="disabled"
    :variant="variant"
    :density="density"
    :prepend-inner-icon="prependInnerIcon"
    return-object
  />
</template>

<script setup lang="ts">
interface Category {
  id: number
  name: string
  slug: string
  avatar_url: string
}

// Props with defaults
const props = defineProps({
  modelValue: {
    type: [Number, Object],
    default: null,
  },
  categories: {
    type: Array as () => Category[],
    required: true,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: 'Category',
  },
  placeholder: {
    type: String,
    default: 'Select category',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  hideDetails: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'outlined',
  },
  density: {
    type: String,
    default: 'comfortable',
  },
  prependInnerIcon: {
    type: String,
    default: 'mdi-tag-multiple',
  },
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Handle v-model updates with proper two-way binding
const updateValue = (value: number | object | null) => {
  emit('update:modelValue', value)
}
</script>