<!-- components\base\BaseTitle.vue-->

<template>
  <component
    :is="tag"
    :class="[titleSizeClass, 'font-weight-bold text-center', marginClass]"
  >
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  marginBottom: {
    type: Number,
    default: 6,
  },
  size: {
    type: String,
    default: 'h3',
    validator: (value: string) =>
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(value),
  },
  tag: {
    type: String,
    default: 'h1',
    validator: (value: string) =>
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span'].includes(value),
  },
})

const marginClass = computed(() => `mb-${props.marginBottom}`)

const titleSizeClass = computed(() => {
  const sizeMap = {
    h1: 'text-h1',
    h2: 'text-h2',
    h3: 'text-h3',
    h4: 'text-h4',
    h5: 'text-h5',
    h6: 'text-h6',
  }
  return sizeMap[props.size] || 'text-h3'
})

const tag = computed(() => props.tag)
</script>
