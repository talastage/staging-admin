<!-- components/support/SelectCategory.vue -->
<template>
  <v-select
    v-model="selectedValue"
    :items="props.categories"
    item-title="name"
    item-value="id"
    :label="props.label"
    :loading="props.isLoading"
    :error-messages="props.errorMessages"
    :placeholder="props.placeholder"
    variant="outlined"
    clearable
    :required="props.required"
    class="category-select"
    @update:model-value="handleChange"
  >
    <!-- Custom Item Template for Avatar Support -->
    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps">
        <template #prepend>
          <v-avatar v-if="item?.raw?.avatar_url" size="24" class="mr-2">
            <v-img :src="item.raw.avatar_url" :alt="`${item.raw.name} icon`" />
          </v-avatar>
        </template>
      </v-list-item>
    </template>

    <!-- No Data Template -->
    <template #no-data>
      <v-list-item>
        <v-list-item-title class="text-medium-emphasis">
          {{ noDataText }}
        </v-list-item-title>
      </v-list-item>
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Category {
  id: number
  name: string
  avatar_url?: string | null
  slug?: string
}

interface Props {
  modelValue: number | null
  categories: Category[]
  label?: string
  placeholder?: string
  isLoading?: boolean
  errorMessages?: string[]
  required?: boolean
  noDataText?: string
}

interface Emits {
  (e: 'update:modelValue', value: number | null): void
  (e: 'change', value: number | null): void
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Choose a category',
  placeholder: 'Select a category...',
  isLoading: false,
  errorMessages: () => [],
  required: false,
  noDataText: 'No categories available',
})

const emit = defineEmits<Emits>()

// Computed property for v-model binding
const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Handle change event
const handleChange = (value: number | null) => {
  emit('change', value)
}
</script>

<style scoped lang="scss">
.category-select {
  :deep(.v-field__input) {
    padding-top: 6px;
    padding-bottom: 6px;
  }

  :deep(.v-avatar) {
    background-color: rgb(var(--v-theme-surface-variant));
  }

  :deep(.v-list-item) {
    min-height: 40px;
    padding: 8px 16px;
  }

  :deep(.v-list-item--active) {
    background-color: rgb(var(--v-theme-surface-variant));
  }
}
</style>
