<!-- components/CategoryChip.vue -->
<template>
  <v-chip
    :class="['category-chip', customClass]"
    :color="color"
    :variant="variant"
    :size="size"
    :disabled="disabled"
    :closable="closable"
    :prepend-icon="prependIcon"
    :append-icon="appendIcon"
    @click="handleClick"
    @close="handleClose"
  >
    <slot :category="category">{{ category.name }}</slot>
  </v-chip>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { TalentCategory } from '@/types/categories'

interface Props {
  category: TalentCategory
  color?: string
  variant?: 'text' | 'outlined' | 'elevated' | 'flat' | 'tonal' | 'plain'
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  disabled?: boolean
  closable?: boolean
  showCount?: boolean
  customClass?: string
  prependIcon?: string
  appendIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  variant: 'outlined',
  size: 'default',
  disabled: false,
  closable: false,
  showCount: false,
  customClass: '',
  prependIcon: undefined,
  appendIcon: undefined,
})

const emit = defineEmits<{
  (e: 'click', category: TalentCategory): void
  (e: 'close', category: TalentCategory): void
}>()

const handleClick = () => {
  if (!props.disabled) {
    emit('click', props.category)
  }
}

const handleClose = () => {
  emit('close', props.category)
}
</script>

<style scoped>
.category-chip {
  transition: all 0.2s ease;
}

.category-chip:hover:not(.v-chip--disabled) {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>
