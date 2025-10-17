<template>
  <div class="count-views d-flex align-center" :class="sizeClass">
    <v-icon :size="iconSize" class="mr-1">{{ icon }}</v-icon>
    <span class="view-count">{{ formattedCount }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormatting } from '@/composables/useFormatting'

const props = defineProps({
  count: {
    type: Number,
    required: true,
    default: 0
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['small', 'default', 'large'].includes(value)
  },
  icon: {
    type: String,
    default: 'mdi-eye'
  }
})

const { formatViewCount } = useFormatting()

const formattedCount = computed(() => formatViewCount(props.count))

const sizeClass = computed(() => {
  switch (props.size) {
    case 'small': return 'count-views--small'
    case 'large': return 'count-views--large'
    default: return ''
  }
})

const iconSize = computed(() => {
  switch (props.size) {
    case 'small': return 'x-small'
    case 'large': return 'medium'
    default: return 'small'
  }
})
</script>

<style scoped>
.count-views {
  display: inline-flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.6);
  transition: all 0.2s ease;
}

.count-views:hover {
  color: rgba(0, 0, 0, 0.8);
}

.count-views--small {
  font-size: 0.75rem;
}

.count-views--large {
  font-size: 1rem;
}

.view-count {
  font-weight: 500;
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .count-views--large {
    font-size: 0.875rem;
  }
}
</style>