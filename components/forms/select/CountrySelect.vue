<template>
  <v-autocomplete
    :model-value="modelValue"
    @update:model-value="updateValue"
    :items="countries"
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
  />
</template>

<script setup lang="ts">
interface Country {
  id: number
  name: string
  flag: string
  phone_code: string
  default?: boolean
}

// Props with defaults
const props = defineProps({
  modelValue: {
    type: Number,
    default: null,
  },
  countries: {
    type: Array as () => Country[],
    required: true,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: 'Country',
  },
  placeholder: {
    type: String,
    default: 'Select country',
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
    default: 'mdi-map-marker',
  },
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Handle v-model updates with proper two-way binding
const updateValue = (value: number | null) => {
  emit('update:modelValue', value)
}
</script>
