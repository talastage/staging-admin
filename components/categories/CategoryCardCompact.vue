<template>
  <v-card
    :class="['category-card-compact d-flex align-center', sizeClass]"
    elevation="10"
    @click="handleCardClick"
    :ripple="clickable && !loading"
  >
    <!-- Image Container -->
    <div class="category-card-compact__image-container">
      <v-img
        :src="imageUrl"
        :alt="category.name"
        :width="imageSize"
        :height="imageSize"
        class="category-card-compact__image"
        cover
        @error="handleImageError"
        :eager="true"
      >
        <template v-if="imageLoading" #placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular
              indeterminate
              color="grey-lighten-3"
              size="20"
            />
          </v-row>
        </template>
        <template v-else-if="imageLoadError" #error>
          <v-img
            :src="defaultAvatarUrl"
            :width="imageSize"
            :height="imageSize"
            cover
          />
        </template>
      </v-img>
    </div>

    <!-- Content Container -->
    <div class="category-card-compact__content flex-grow-1">
      <div
        :class="['font-weight-medium text-truncate', nameClass]"
        v-text="category.name"
      />
      <div
        v-if="category.description && showDescription"
        :class="['text-truncate text-medium-emphasis', descriptionClass]"
        v-text="category.description"
      />
    </div>

    <!-- Action Container -->
    <div class="category-card-compact__action px-3">
      <slot
        name="action"
        :category="category"
        :selected="selected"
        :loading="loading"
      >
        <v-btn
          :color="selected ? 'success' : 'primary'"
          :variant="selected ? 'tonal' : 'flat'"
          :loading="loading"
          :disabled="loading"
          :prepend-icon="selected ? 'mdi-check' : 'mdi-plus'"
          @click.stop="handleCardClick"
        >
          {{ selected ? 'Selected' : 'Register' }}
        </v-btn>
      </slot>
    </div>

    <!-- Loading Overlay -->
    <v-overlay
      v-if="loading"
      :model-value="loading"
      class="align-center justify-center"
      contained
      scrim="#fff"
      persistent
    >
      <v-progress-circular indeterminate color="primary" size="24" />
    </v-overlay>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface TalentCategory {
  id: number
  name: string
  slug: string
  description?: string
  avatar_url?: string
  cover_url?: string
  order?: number
  status?: 'active' | 'inactive' | 'archived'
  created_at?: string
  updated_at?: string
}

// Use the exact path you provided
const defaultAvatarUrl = '/images/profile/default.png'

const props = withDefaults(
  defineProps<{
    category: TalentCategory
    size?: 'small' | 'medium' | 'large'
    selected?: boolean
    clickable?: boolean
    loading?: boolean
    showDescription?: boolean
  }>(),
  {
    size: 'medium',
    selected: false,
    clickable: true,
    loading: false,
    showDescription: true,
  }
)

const emit = defineEmits<{
  (e: 'click', category: TalentCategory): void
  (e: 'error', error: Error): void
}>()

const imageLoadError = ref(false)
const imageLoading = ref(true)

const sizeClass = computed(() => `category-card-compact--${props.size}`)

const imageSize = computed(() => {
  switch (props.size) {
    case 'small':
      return 56
    case 'large':
      return 84
    default:
      return 64
  }
})

const nameClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'text-subtitle-2'
    case 'large':
      return 'text-h5'
    default:
      return 'text-h6'
  }
})

const descriptionClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'text-caption'
    case 'large':
      return 'text-subtitle-1'
    default:
      return 'text-body-2'
  }
})

const imageUrl = computed(() => {
  return props.category.avatar_url || defaultAvatarUrl
})

function handleImageError() {
  imageLoadError.value = true
  imageLoading.value = false
  emit(
    'error',
    new Error(`Failed to load image for category ${props.category.name}`)
  )
}

function handleCardClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('.category-card-compact__action'))
    return
  if (props.clickable && !props.loading) {
    emit('click', props.category)
  }
}

// Check if the image is valid by preloading it
onMounted(() => {
  const img = new Image()
  img.onload = () => {
    imageLoading.value = false
  }
  img.onerror = () => {
    handleImageError()
  }
  img.src = imageUrl.value
})
</script>

<style scoped>
.category-card-compact {
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.category-card-compact:hover {
  transform: translateY(-2px);
}

.category-card-compact__image-container {
  flex-shrink: 0;
  position: relative;
}

.category-card-compact__image {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  object-fit: cover;
}

.category-card-compact__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.category-card-compact__action {
  flex-shrink: 0;
}

/* Size variants with adjusted heights and paddings */
.category-card-compact--small {
  height: 56px;
}

.category-card-compact--small .category-card-compact__content {
  padding: 0 10px;
}

.category-card-compact--small :deep(.v-btn) {
  height: 28px !important;
  font-size: 0.8125rem;
  padding: 0 12px;
}

.category-card-compact--medium {
  height: 64px;
}

.category-card-compact--medium .category-card-compact__content {
  padding: 0 14px;
}

.category-card-compact--medium :deep(.v-btn) {
  height: 32px !important;
  font-size: 0.875rem;
  padding: 0 14px;
}

.category-card-compact--large {
  height: 84px;
}

.category-card-compact--large .category-card-compact__content {
  padding: 0 18px;
}

.category-card-compact--large :deep(.v-btn) {
  height: 36px !important;
  font-size: 0.9375rem;
  padding: 0 16px;
}

/* Button style overrides */
:deep(.v-btn) {
  min-width: 85px;
  letter-spacing: 0.25px;
  text-transform: none;
  font-weight: 500;
}

:deep(.v-btn .v-icon) {
  font-size: 18px;
  margin-right: 4px;
}

/* Hover effect for the entire card */
.category-card-compact:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Optional: Add a subtle transition for the image */
.category-card-compact__image {
  transition: opacity 0.2s ease;
}

/* Optional: Add a subtle overlay on hover */
.category-card-compact:hover .category-card-compact__image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.02);
}
</style>
