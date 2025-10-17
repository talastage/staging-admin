<!-- components/CategoryChipGroup.vue -->
<template>
  <div :class="['d-flex', 'flex-wrap', justifyClass]">
    <CategoryChip
      v-for="category in categories"
      :key="category.id"
      :category="category"
      :color="color"
      :variant="variant"
      :size="size"
      :disabled="disabled"
      :closable="closable"
      :show-count="showCount"
      :custom-class="chipClass"
      @click="handleChipClick"
      @close="handleChipClose"
    >
      <template v-if="$slots.default" #default>
        <slot :category="category"></slot>
      </template>

      <template v-if="$slots.append" #append>
        <slot name="append" :category="category"></slot>
      </template>
    </CategoryChip>

    <slot name="after"></slot>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { TalentCategory } from '@/types/categories'

interface Props {
  categories: TalentCategory[]
  color?: string
  variant?: 'text' | 'outlined' | 'elevated' | 'flat' | 'tonal' | 'plain'
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  disabled?: boolean
  closable?: boolean
  showCount?: boolean
  chipClass?: string
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  variant: 'outlined',
  size: 'default',
  disabled: false,
  closable: false,
  showCount: false,
  chipClass: '',
  justify: 'center',
})

const emit = defineEmits<{
  (e: 'click', category: TalentCategory): void
  (e: 'close', category: TalentCategory): void
}>()

const justifyClass = computed(() => {
  return `justify-${props.justify}`
})

const handleChipClick = (category: TalentCategory) => {
  emit('click', category)
}

const handleChipClose = (category: TalentCategory) => {
  emit('close', category)
}
</script>
