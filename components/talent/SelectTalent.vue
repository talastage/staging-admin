<!-- components\talent\SelectTalent.vue -->

<template>
  <v-autocomplete
    v-model="selectedTalent"
    :items="talents"
    item-title="name"
    item-value="id"
    label="Sub Category"
    clearable
    :loading="isFetchingTalents"
    :disabled="!category || isFetchingTalents || disabled"
    variant="outlined"
    hide-details="auto"
    density="comfortable"
    color="primary"
    @update:model-value="handleTalentChange"
    return-object
  >
    <template #prepend-inner>
      <v-icon>mdi-star-outline</v-icon>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useTalentCategoryStore } from '@/stores/useTalentCategories'
import type { Talent, TalentCategory } from '@/types/categories'

const props = defineProps<{
  modelValue: Talent | null
  category: TalentCategory | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Talent | null]
}>()

const talentCategoryStore = useTalentCategoryStore()

const talents = computed(() => talentCategoryStore.talents)
const isFetchingTalents = computed(() => talentCategoryStore.isFetchingTalents)

// Use a direct object reference instead of ID
const selectedTalent = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})

// Handle talent change
const handleTalentChange = (talent) => {
  emit('update:modelValue', talent)
}

// Watch for category changes
watch(
  () => props.category,
  async (newCategory) => {
    emit('update:modelValue', null)

    if (newCategory?.slug) {
      // Force reset talents for the category
      await talentCategoryStore.fetchCategoryTalents(newCategory.slug)
    } else {
      talentCategoryStore.resetTalents()
    }
  },
  { immediate: true }
)
</script>
