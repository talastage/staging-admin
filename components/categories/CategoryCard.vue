<template>
  <v-card
    :class="cardClasses"
    @click="handleClick"
    :elevation="hovering ? 4 : 2"
    :ripple="{ class: 'primary--text' }"
    rounded="lg"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <v-img
      :src="imageUrl"
      :alt="imageAlt"
      :lazy-src="DEFAULT_IMAGE"
      cover
      :aspect-ratio="16 / 9"
      class="category-image"
      rounded="lg"
      @error="handleImageError"
    >
      <!-- Loading Placeholder -->
      <template v-slot:placeholder>
        <v-row class="fill-height ma-0" align="center" justify="center">
          <v-progress-circular
            indeterminate
            color="primary"
            :size="24"
            :width="2"
          />
        </v-row>
      </template>

      <!-- Category Overlay -->
      <v-overlay
        :model-value="true"
        contained
        class="align-end category-overlay"
        scrim="gradient"
      >
        <v-card-title :class="titleClasses">
          {{ category.name }}
          <span v-if="showCount" class="count-badge">
            {{ formattedCount }}
          </span>
        </v-card-title>
        <v-card-subtitle
          v-if="category.description"
          class="text-white text-truncate"
        >
          {{ category.description }}
        </v-card-subtitle>
      </v-overlay>
    </v-img>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TalentCategory } from '@/types/categories'

// Constants - Define at the top level
const DEFAULT_IMAGE = '/images/category/placeholder-file.png'

const SIZE_CLASSES = {
  small: 'category-card--small',
  medium: 'category-card--medium',
  large: 'category-card--large',
} as const

const TITLE_SIZES = {
  small: 'text-subtitle-2',
  medium: 'text-subtitle-1',
  large: 'text-h6',
} as const

interface Props {
  category: TalentCategory
  size?: 'small' | 'medium' | 'large'
  showCount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showCount: false,
})

const emit = defineEmits<{
  (e: 'click', category: TalentCategory): void
  (e: 'error', error: Error): void
}>()

// State
const hovering = ref(false)
const imageLoadError = ref(false)

// Computed
const cardClasses = computed(() => [
  'category-card',
  SIZE_CLASSES[props.size],
  { 'category-card--hovering': hovering.value },
])

const titleClasses = computed(() => [
  'text-white',
  TITLE_SIZES[props.size],
  'category-title',
])

const imageUrl = computed(() => {
  if (imageLoadError.value) return DEFAULT_IMAGE
  return props.category.avatar_url || DEFAULT_IMAGE
})

const imageAlt = computed(() => `${props.category.name} category image`)

const formattedCount = computed(() => {
  const count = props.category.count || 0
  if (count > 999) return `${(count / 1000).toFixed(1)}k`
  return count.toString()
})

// Methods
const handleClick = () => {
  emit('click', props.category)
}

const handleImageError = (error: Error) => {
  imageLoadError.value = true
  emit('error', error)
}
</script>

<style lang="scss" scoped>
.category-card {
  --card-transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --hover-transform: translateY(-4px);
  --hover-shadow: 0 6px 30px -10px rgba(0, 0, 0, 0.3);

  position: relative;
  transition: var(--card-transition);
  overflow: hidden;
  cursor: pointer;
  width: 100%;

  &:hover {
    transform: var(--hover-transform);
    box-shadow: var(--hover-shadow);
  }

  // Size variants
  &--small {
    max-width: 200px;

    @media (max-width: 600px) {
      max-width: 160px;
    }
  }

  &--medium {
    max-width: 300px;

    @media (max-width: 600px) {
      max-width: 240px;
    }
  }

  &--large {
    max-width: 400px;

    @media (max-width: 600px) {
      max-width: 320px;
    }
  }

  @media (max-width: 480px) {
    &--small,
    &--medium,
    &--large {
      max-width: 100%;
    }
  }
}

.category-overlay {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0) 100%
  );

  .category-title {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
    padding: 16px;
    line-height: 1.2;
    font-weight: 500;
  }
}

.count-badge {
  font-size: 0.85em;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
  vertical-align: middle;
}

// Improve image loading
.v-img {
  &::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.05);
  }
}

// Accessibility
@media (prefers-reduced-motion: reduce) {
  .category-card {
    --card-transition: none;
    --hover-transform: none;
  }
}

// High contrast mode
@media (forced-colors: active) {
  .category-card {
    border: 1px solid CanvasText;
  }

  .category-title {
    background: Canvas;
    color: CanvasText;
  }
}
</style>
