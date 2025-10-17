<!-- components/WatchNowButton.vue -->
<template>
  <v-btn
    :color="color"
    :variant="variant"
    :size="computedSize"
    :density="density"
    :disabled="disabled"
    :prepend-icon="prependIcon || defaultIcon"
    :to="to"
    @click="handleClick"
  >
    <slot>{{ text }}</slot>
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Props interface for the WatchNowButton component
 */
interface Props {
  /**
   * Button color (uses Vuetify color system)
   * @default 'primary'
   */
  color?: string

  /**
   * Button variant (tonal, text, outlined, etc.)
   * @default 'tonal'
   */
  variant?: string

  /**
   * Button size (xs, sm, md, lg, xl)
   * @default 'small'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string

  /**
   * Button density
   * @default undefined
   */
  density?: 'default' | 'comfortable' | 'compact' | null

  /**
   * Button disabled state
   * @default false
   */
  disabled?: boolean

  /**
   * Icon to prepend to button text
   * @default undefined (will use default play icon)
   */
  prependIcon?: string

  /**
   * Button text
   * @default 'Watch Now'
   */
  text?: string

  /**
   * Access UUID for the video/project
   * If provided, clicking the button will navigate to the watch page
   */
  accessUuid?: string

  /**
   * Vue Router 'to' prop value (alternative to using accessUuid)
   * Takes precedence over accessUuid
   */
  to?: string | Record<string, any>
}

// Props definition with defaults
const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  variant: 'tonal',
  size: 'small',
  density: undefined,
  disabled: false,
  prependIcon: undefined,
  text: 'Watch Now',
  accessUuid: undefined,
  to: undefined,
})

// Default icon
const defaultIcon = 'mdi-play-circle-outline'

// Emit events
const emit = defineEmits<{
  (e: 'click', accessUuid?: string): void
}>()

// Size mapping for easier usage
const computedSize = computed(() => {
  const sizeMap: Record<string, string> = {
    xs: 'x-small',
    sm: 'small',
    md: 'default',
    lg: 'large',
    xl: 'x-large',
  }

  return sizeMap[props.size] || props.size
})

// Click handler
const handleClick = () => {
  emit('click', props.accessUuid)

  // If no router-link behavior is set and we have an accessUuid, handle navigation programmatically
  if (!props.to && props.accessUuid) {
    navigateToWatch(props.accessUuid)
  }
}

// Navigation function
const navigateToWatch = (accessUuid: string) => {
  // Get router instance
  const router = useRouter()

  // Navigate to watch page with the access UUID
  router.push(`/watch/${accessUuid}`)
}
</script>
