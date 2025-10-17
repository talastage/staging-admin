<template>
  <v-autocomplete
    v-model="selectedCategory"
    :items="categories"
    item-title="name"
    item-value="id"
    label="Select Category"
    clearable
    :loading="isFetchingCategories"
    :disabled="isFetchingCategories || disabled"
    variant="outlined"
    hide-details="auto"
    density="comfortable"
    color="primary"
    class="mb-4"
    @update:model-value="handleCategoryChange"
    return-object
  >
    <template #prepend-inner>
      <v-icon>mdi-folder-outline</v-icon>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useTalentCategoryStore } from '@/stores/useTalentCategories'
import type { TalentCategory } from '@/types/categories'

const props = defineProps<{
  modelValue: TalentCategory | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TalentCategory | null]
}>()

const talentCategoryStore = useTalentCategoryStore()

const categories = computed(() => talentCategoryStore.categories)
const isFetchingCategories = computed(() => talentCategoryStore.isFetching)

// Use a direct object reference instead of ID
const selectedCategory = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})

// Handle category change
const handleCategoryChange = (category) => {
  emit('update:modelValue', category)
}

// Fetch categories on component mount if not already loaded
onMounted(async () => {
  if (talentCategoryStore.categories.length === 0) {
    await talentCategoryStore.fetchCategories()
  }
})
</script>
