<template>
  <v-card
    :class="cardClasses"
    @click="handleCardClick"
    :elevation="hovering ? 4 : 2"
    :ripple="clickable && hasValidSlug"
    rounded="lg"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :aria-disabled="!hasValidSlug"
    tabindex="0"
    @keydown.enter.space.prevent="handleCardClick"
  >
    <div :class="['category-content', `category-content--${mode}`]">
      <!-- Image Section -->
      <v-img
        :src="imageUrl"
        :alt="imageAlt"
        :lazy-src="DEFAULT_IMAGE"
        cover
        :aspect-ratio="aspectRatio"
        class="category-image"
        :class="[{ 'list-image': mode === 'list' }, `category-image--${size}`]"
        @error="handleImageError"
      >
        <!-- Loading Placeholder -->
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular
              indeterminate
              color="primary"
              :size="loaderSize"
              :width="2"
            />
          </v-row>
        </template>

        <!-- Overlay with Category Name -->
        <div
          v-if="mode === 'grid'"
          class="category-overlay"
          :class="{ 'category-overlay--hover': hovering }"
        >
          <div class="category-overlay__content">
            <h3 :class="titleClasses">{{ category.name }}</h3>
          </div>
        </div>
      </v-img>

      <!-- List Mode Content -->
      <div v-if="mode === 'list'" class="list-content">
        <div class="list-text">
          <h3 :class="titleClasses">{{ category.name }}</h3>
        </div>
      </div>

      <!-- Action Slot -->
      <div
        class="category-actions"
        :class="{ 'category-actions--visible': hovering }"
      >
        <slot
          name="action"
          :category="category"
          :selected="selected"
          :loading="loading"
        />
      </div>

      <!-- Loading Overlay -->
      <v-overlay
        v-if="loading"
        :model-value="true"
        contained
        class="loading-overlay"
        scrim="rgba(255, 255, 255, 0.9)"
      >
        <v-progress-circular indeterminate color="primary" :size="loaderSize" />
      </v-overlay>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Types
interface TalentCategory {
  id: number
  name: string
  slug: string
  avatar_url?: string
  cover_url?: string
  status?: 'active' | 'inactive' | 'archived'
}

// Constants
const DEFAULT_IMAGE = '/images/profile/default.jpg'

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

// Props
const props = withDefaults(
  defineProps<{
    category: TalentCategory
    size?: keyof typeof SIZE_CLASSES
    mode?: 'list' | 'grid'
    selected?: boolean
    clickable?: boolean
    loading?: boolean
  }>(),
  {
    size: 'medium',
    mode: 'grid',
    selected: false,
    clickable: true,
    loading: false,
  }
)

// Emits
const emit = defineEmits<{
  (e: 'click', category: TalentCategory): void
  (e: 'error', error: Error): void
}>()

// State
const hovering = ref(false)
const imageLoadError = ref(false)

// Computed Properties
const cardClasses = computed(() => [
  'category-card',
  SIZE_CLASSES[props.size],
  `category-card--${props.mode}`,
  {
    'category-card--selected': props.selected,
    'category-card--hovering': hovering.value,
    'category-card--loading': props.loading,
    'category-card--clickable': props.clickable && hasValidSlug.value,
  },
])

const titleClasses = computed(() => [
  props.mode === 'grid' ? 'text-white' : 'text-primary',
  TITLE_SIZES[props.size],
  'category-title',
])

const imageUrl = computed(() => {
  if (imageLoadError.value) return DEFAULT_IMAGE
  return props.category.avatar_url || DEFAULT_IMAGE
})

const imageAlt = computed(() => `${props.category.name} category image`)

const aspectRatio = computed(() => {
  switch (props.size) {
    case 'small':
      return props.mode === 'list' ? 1 : 16 / 9
    case 'large':
      return props.mode === 'list' ? 1 : 4 / 3
    default:
      return props.mode === 'list' ? 1 : 16 / 9
  }
})

const loaderSize = computed(() => {
  switch (props.size) {
    case 'small':
      return 20
    case 'large':
      return 32
    default:
      return 24
  }
})

const hasValidSlug = computed(() => !!props.category.slug)

// Methods
const handleCardClick = (event: MouseEvent) => {
  // Prevent click if interacting with action slots
  if ((event.target as HTMLElement).closest('.category-actions')) return
  if (props.clickable && hasValidSlug.value && !props.loading) {
    emit('click', props.category)
  }
}

const handleImageError = (error: Event) => {
  imageLoadError.value = true
  emit(
    'error',
    new Error(
      `Failed to load image for category ${props.category.name}: ${error}`
    )
  )
}

const handleMouseEnter = () => {
  if (!props.loading) {
    hovering.value = true
  }
}

const handleMouseLeave = () => {
  hovering.value = false
}
</script>

<style lang="scss" scoped>
.category-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--v-border-color), 0.12);

  &--small {
    --card-height: 200px;
    max-width: 240px;
  }

  &--medium {
    --card-height: 280px;
    max-width: 320px;
  }

  &--large {
    --card-height: 360px;
    max-width: 400px;
  }

  &--list {
    --card-height: 72px;
    max-width: 100%;

    .category-content {
      display: flex;
      align-items: center;
      height: var(--card-height);
    }

    .category-image {
      width: 56px;
      height: 56px;
      min-width: 56px;
      border-radius: 8px;
      margin: 8px;
    }
  }

  &--selected {
    border: 2px solid rgb(var(--v-theme-primary));
  }

  &--hovering {
    transform: translateY(-2px);
  }

  &--loading {
    pointer-events: none;
    opacity: 0.7;
  }

  &--clickable {
    cursor: pointer;
  }

  /* Visual indicator for non-clickable cards */
  &:not(&--clickable) {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.category-content {
  height: var(--card-height);
  position: relative;
}

.category-image {
  transition: transform 0.3s ease;

  &--small {
    height: 200px;
  }

  &--medium {
    height: 280px;
  }

  &--large {
    height: 360px;
  }
}

.category-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0) 100%
  );
  transition: all 0.3s ease;

  &--hover {
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(0, 0, 0, 0.6) 70%,
      rgba(0, 0, 0, 0.3) 100%
    );
  }

  &__content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    z-index: 1;
  }
}

.category-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.4;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.list-content {
  flex: 1;
  padding: 0 16px;
  min-width: 0;
}

.list-text {
  .category-title {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.category-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1;

  &--visible {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-overlay {
  backdrop-filter: blur(4px);
}

// Responsive Design
@media (max-width: 600px) {
  .category-card {
    &--small,
    &--medium,
    &--large {
      max-width: 100%;
      --card-height: 200px;
    }

    &--list {
      --card-height: 72px;

      .category-content {
        padding: 8px;
      }

      .list-content {
        padding: 0 8px;
      }
    }
  }

  .category-overlay__content {
    padding: 12px;
  }

  .category-title {
    font-size: 1.125rem;
  }
}

@media (min-width: 601px) and (max-width: 960px) {
  .category-card {
    &--large {
      max-width: 360px;
      --card-height: 320px;
    }
  }
}
</style>
