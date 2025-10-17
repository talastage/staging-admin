<template>
  <v-card
    elevation="2"
    :class="[
      {
        'border-primary': modelValue?.id === talent.id,
        'talent-card': !isSelected,
        'selected-talent-card': isSelected,
      },
      `talent-card--${size}`,
    ]"
    @click="toggleSelect"
  >
    <div class="d-flex align-center pa-2">
      <!-- <div
        class="square-image-container mr-3"
        :class="`square-image-container--${size}`"
      >
        <v-img
          :src="talent.avatar_url || '/default-avatar.png'"
          :alt="talent.name"
          cover
          class="rounded-lg"
        />
      </div> -->
      <v-card-text :class="['pa-2 flex-grow-1', `talent-card-text--${size}`]">
        <div :class="[isSelected ? 'font-weight-medium' : '', textClass]">
          {{ talent.name }}
        </div>
      </v-card-text>
      <v-btn
        v-if="isSelected"
        :icon="closeIcon"
        color="error"
        variant="text"
        :size="buttonSize"
        @click.stop="toggleSelect"
      ></v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Talent {
  id: number
  name: string
  avatar_url?: string
}

type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const props = withDefaults(
  defineProps<{
    talent: Talent
    modelValue: Talent | null
    isSelected?: boolean
    size?: CardSize
  }>(),
  {
    size: 'md',
    isSelected: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: Talent | null): void
}>()

const isSelected = computed(
  () => props.isSelected || props.modelValue?.id === props.talent.id
)

const toggleSelect = () => {
  emit('update:modelValue', isSelected.value ? null : props.talent)
}

// Size-based computed properties
const imageSizes = {
  xs: 40,
  sm: 50,
  md: 60,
  lg: 80,
  xl: 100,
}

const textClass = computed(() => {
  const sizes = {
    xs: 'text-caption',
    sm: 'text-body-2',
    md: 'text-subtitle-2',
    lg: 'text-subtitle-1',
    xl: 'text-h6',
  }
  return sizes[props.size]
})

const buttonSize = computed(() => {
  const sizes = {
    xs: 'x-small',
    sm: 'small',
    md: 'default',
    lg: 'large',
    xl: 'x-large',
  }
  return sizes[props.size]
})

const closeIcon = computed(() =>
  props.size === 'xs' || props.size === 'sm' ? 'mdi-close-small' : 'mdi-close'
)
</script>

<style lang="scss" scoped>
.talent-card {
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  // Size variants
  &--xs {
    max-height: 50px;
    .v-card-text {
      padding: 4px !important;
    }
  }

  &--sm {
    max-height: 60px;
    .v-card-text {
      padding: 6px !important;
    }
  }

  &--md {
    max-height: 70px;
    .v-card-text {
      padding: 8px !important;
    }
  }

  &--lg {
    max-height: 90px;
    .v-card-text {
      padding: 12px !important;
    }
  }

  &--xl {
    max-height: 110px;
    .v-card-text {
      padding: 16px !important;
    }
  }
}

.border-primary {
  border: 2px solid rgb(var(--v-theme-primary));
}

.square-image-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  flex-shrink: 0;

  .v-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  // Size variants
  &--xs {
    width: 40px;
    height: 40px;
  }

  &--sm {
    width: 50px;
    height: 50px;
  }

  &--md {
    width: 60px;
    height: 60px;
  }

  &--lg {
    width: 80px;
    height: 80px;
  }

  &--xl {
    width: 100px;
    height: 100px;
  }
}

// Responsive adjustments
@media (max-width: 600px) {
  .talent-card {
    &--lg,
    &--xl {
      max-height: 80px;
    }

    .square-image-container {
      &--lg,
      &--xl {
        width: 60px;
        height: 60px;
      }
    }
  }
}

// Dark mode adjustments
:deep(.v-theme--dark) {
  .talent-card {
    background-color: rgba(255, 255, 255, 0.05);

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

// Hover and active states
.talent-card {
  &:active {
    transform: translateX(2px);
  }

  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }
}

// Animation
.selected-talent-card {
  animation: selectPulse 0.3s ease-out;
}

@keyframes selectPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
</style>
