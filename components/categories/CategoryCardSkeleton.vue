<template>
  <div
    class="base-skeleton-loader"
    :class="[
      `base-skeleton-loader--${props.variant}`,
      `base-skeleton-loader--${props.size}`,
    ]"
    :style="customStyles"
  >
    <div
      v-if="variant === 'card' || variant === 'image-card'"
      class="skeleton-image"
    ></div>

    <div
      class="skeleton-content"
      :class="{
        'skeleton-content--no-image':
          variant !== 'card' && variant !== 'image-card',
      }"
    >
      <div
        v-if="variant !== 'avatar'"
        class="skeleton-title"
        :style="{ width: `${titleWidthPercent}%` }"
      ></div>

      <div
        v-if="showSubtitle"
        class="skeleton-subtitle"
        :style="{ width: `${subtitleWidthPercent}%` }"
      ></div>

      <div v-if="variant === 'text-block'" class="skeleton-lines">
        <div
          v-for="i in linesCount"
          :key="i"
          class="skeleton-line"
          :style="{ width: getLineWidth(i) }"
        ></div>
      </div>

      <div
        v-if="variant === 'card' || variant === 'image-card'"
        class="skeleton-chip"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'card' | 'image-card' | 'text-block' | 'avatar' | 'chip'
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  width?: string | number
  height?: string | number
  aspectRatio?: number
  linesCount?: number
  showSubtitle?: boolean
  titleWidthPercent?: number
  subtitleWidthPercent?: number
  borderRadius?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'card',
  size: 'medium',
  aspectRatio: 1.5,
  linesCount: 3,
  showSubtitle: false,
  titleWidthPercent: 70,
  subtitleWidthPercent: 50,
  borderRadius: '16px',
})

// Size configurations based on variant and size
const sizeConfig = computed(() => {
  const configs = {
    card: {
      small: { width: 160, height: 200 },
      medium: { width: 220, height: 260 },
      large: { width: 280, height: 320 },
      xlarge: { width: 340, height: 380 },
    },
    'image-card': {
      small: { width: 160, height: 200 },
      medium: { width: 220, height: 260 },
      large: { width: 280, height: 320 },
      xlarge: { width: 340, height: 380 },
    },
    'text-block': {
      small: { width: '100%', height: 80 },
      medium: { width: '100%', height: 120 },
      large: { width: '100%', height: 160 },
      xlarge: { width: '100%', height: 200 },
    },
    avatar: {
      small: { width: 32, height: 32 },
      medium: { width: 48, height: 48 },
      large: { width: 64, height: 64 },
      xlarge: { width: 96, height: 96 },
    },
    chip: {
      small: { width: 60, height: 24 },
      medium: { width: 80, height: 32 },
      large: { width: 100, height: 40 },
      xlarge: { width: 120, height: 48 },
    },
  }
  return configs[props.variant]?.[props.size] || { width: 220, height: 260 } // Default to medium card
})

// Compute custom styles based on props
const customStyles = computed(() => {
  const baseStyles = {
    width: props.width
      ? typeof props.width === 'number'
        ? `${props.width}px`
        : props.width
      : `${sizeConfig.value.width}px`,
    height: props.height
      ? typeof props.height === 'number'
        ? `${props.height}px`
        : props.height
      : `${sizeConfig.value.height}px`,
    borderRadius:
      typeof props.borderRadius === 'number'
        ? `${props.borderRadius}px`
        : props.borderRadius,
  }

  // For variants that use aspect ratio
  if (props.variant === 'card' || props.variant === 'image-card') {
    if (props.aspectRatio && !props.height) {
      const width =
        typeof props.width === 'number'
          ? props.width
          : parseFloat(baseStyles.width)
      baseStyles.height = `${width / props.aspectRatio}px`
    }
  }

  // For circular avatars
  if (props.variant === 'avatar') {
    baseStyles.borderRadius = '50%'
  }

  return baseStyles
})

// Generate random line widths for text blocks
const getLineWidth = (index: number) => {
  if (index === 1) return '85%'
  if (index === props.linesCount) return '60%'
  return `${75 + Math.floor(Math.random() * 20)}%`
}
</script>

<style scoped>
.base-skeleton-loader {
  background: #f0f0f0;
  position: relative;
  overflow: hidden;
}

.base-skeleton-loader::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.5),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

.skeleton-image {
  width: 100%;
  height: 70%;
  background: #e0e0e0;
}

.skeleton-content {
  padding: 1rem;
}

.skeleton-content--no-image {
  padding: 0;
}

.skeleton-title {
  height: 16px;
  background: #e0e0e0;
  margin-bottom: 8px;
}

.skeleton-subtitle {
  height: 12px;
  background: #e0e0e0;
  margin-bottom: 8px;
}

.skeleton-lines .skeleton-line {
  height: 12px;
  background: #e0e0e0;
  margin-bottom: 8px;
}

.skeleton-chip {
  width: 60px;
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.base-skeleton-loader--small .skeleton-title {
  height: 12px;
}
.base-skeleton-loader--small .skeleton-subtitle {
  height: 10px;
}
.base-skeleton-loader--large .skeleton-title {
  height: 20px;
}
.base-skeleton-loader--large .skeleton-subtitle {
  height: 14px;
}
.base-skeleton-loader--xlarge .skeleton-title {
  height: 24px;
}
.base-skeleton-loader--xlarge .skeleton-subtitle {
  height: 16px;
}
</style>
