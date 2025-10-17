<!-- ProgressPercentageDisplay.vue -->
<template>
  <div class="progress-percentage">
    <div class="progress-bar-wrapper">
      <v-progress-linear
        :model-value="clampedValue"
        :color="color"
        :height="height"
        rounded
        :buffer-value="100"
      />
      <span
        class="percentage-text"
        :style="percentageStyle"
        :class="textColorClass"
      >
        {{ formattedValue }}%
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  color?: string
  height?: number
  showPercentage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  height: 8,
  showPercentage: true,
})

// Ensure value is between 0 and 100
const clampedValue = computed(() => Math.min(Math.max(props.value, 0), 100))

// Format value to 2 decimal places
const formattedValue = computed(() => clampedValue.value.toFixed(2))

// Calculate percentage text position
const percentageStyle = computed(() => {
  const position = clampedValue.value
  const leftPos = Math.min(Math.max(position, 20), 80) // Keep text within visible bounds

  return {
    left: `${leftPos}%`,
    transform: `translateX(-50%) translateY(-50%)`,
  }
})

// Determine text color based on position
const textColorClass = computed(() => {
  return {
    'text--dark': true,
    'text--light': false, // Add logic for dark/light text based on background if needed
  }
})
</script>

<style scoped>
.progress-percentage {
  width: 100%;
  margin: 8px 0;
}

.progress-bar-wrapper {
  position: relative;
  height: v-bind(height + 'px');
  margin: 12px 0;
}

.percentage-text {
  position: absolute;
  top: 50%;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 4px;
  border-radius: 4px;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.text--dark {
  color: rgba(0, 0, 0, 0.87);
  background-color: rgba(255, 255, 255, 0.9);
}

.text--light {
  color: rgba(255, 255, 255, 0.87);
  background-color: rgba(0, 0, 0, 0.7);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .text--dark {
    color: rgba(255, 255, 255, 0.87);
    background-color: rgba(0, 0, 0, 0.7);
  }
}
</style>
