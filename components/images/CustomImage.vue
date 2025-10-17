<template>
  <v-img
    :src="props.src"
    :width="computedSize"
    :height="computedHeight"
    :class="[
      'custom-image',
      {
        'rounded-circle': props.shape === 'circle',
        'rounded-0': props.shape === 'square',
        'rounded-lg': props.shape === 'rounded',
      },
    ]"
    :cover="props.cover"
    :gradient="props.gradient"
    :aspect-ratio="props.shape === 'horizontal' ? '16/9' : '1'"
    :alt="props.alt"
    :lazy-src="props.lazySrc"
    :loading="props.loading"
    @error="emit('error', $event)"
    @load="emit('load', $event)"
  >
    <slot></slot>
    <template v-if="props.loading" v-slot:placeholder>
      <div class="d-flex align-center justify-center fill-height">
        <v-progress-circular indeterminate color="grey-lighten-2" />
      </div>
    </template>
  </v-img>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

// Define types
type ImageShape = 'circle' | 'square' | 'rounded' | 'horizontal'
type ImageSize = 'small' | 'medium' | 'large' | number

// Interface for props
interface Props {
  src: string
  shape?: ImageShape
  size?: ImageSize
  cover?: boolean
  gradient?: string
  alt?: string
  lazySrc?: string
  loading?: boolean
}

// Define props with types
const props = withDefaults(defineProps<Props>(), {
  shape: 'square',
  size: 'medium',
  cover: true,
  gradient: '',
  alt: '',
  lazySrc: '',
  loading: false,
})

// Define emits
const emit = defineEmits<{
  (e: 'error', event: Event): void
  (e: 'load', event: Event): void
}>()

// Size mapping
const sizeMap: Record<string, number> = {
  small: 40,
  medium: 96,
  large: 156,
}

// Computed properties
const computedSize = computed(() => {
  if (typeof props.size === 'number') {
    return props.size
  }
  return sizeMap[props.size] || sizeMap.medium
})

const computedHeight = computed(() => {
  if (props.shape === 'horizontal') {
    return computedSize.value * (9 / 16) // 16:9 aspect ratio
  }
  return computedSize.value
})
</script>

<style scoped>
.custom-image {
  object-fit: cover;
  transition: all 0.3s ease-in-out;
}
</style>
