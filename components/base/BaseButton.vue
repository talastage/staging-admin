<!-- components\base\BaseButton.vue -->
<template>
  <v-btn
    v-if="to"
    :to="to"
    :color="color"
    :variant="variant"
    :disabled="disabled"
    :loading="loading"
    :class="['base-button', customClass, { 'full-width': fullWidth }]"
    :elevation="elevation"
    :height="height"
  >
    <v-icon v-if="prependIcon" start>{{ prependIcon }}</v-icon>
    {{ title }}
    <v-icon v-if="appendIcon" end>{{ appendIcon }}</v-icon>
  </v-btn>

  <v-btn
    v-else
    :color="color"
    :variant="variant"
    :disabled="disabled"
    :loading="loading"
    :class="['base-button', customClass, { 'full-width': fullWidth }]"
    @click="handleClick"
    :elevation="elevation"
    :height="height"
  >
    <v-icon v-if="prependIcon" start>{{ prependIcon }}</v-icon>
    {{ title }}
    <v-icon v-if="appendIcon" end>{{ appendIcon }}</v-icon>
  </v-btn>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  action: {
    type: [Function, String],
    default: null,
  },
  to: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'primary',
  },
  variant: {
    type: String,
    default: 'elevated',
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  prependIcon: {
    type: String,
    default: '',
  },
  appendIcon: {
    type: String,
    default: '',
  },
  customClass: {
    type: String,
    default: '',
  },
  elevation: {
    type: [Number, String],
    default: 0,
  },
  height: {
    type: [Number, String],
    default: 40,
  },
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')

  if (props.action) {
    if (typeof props.action === 'function') {
      props.action()
    } else if (typeof props.action === 'string') {
      // Handle string actions
      switch (props.action) {
        case 'navigate':
          if (props.to) {
            router.push(props.to)
          }
          break
        default:
          console.warn(`Unknown action: ${props.action}`)
      }
    }
  }
}
</script>

<style scoped>
.base-button {
  text-transform: none !important;
  font-weight: 400 !important;
  letter-spacing: normal !important;
  border-radius: 8px !important;
  font-size: 14px !important;
}
.full-width {
  width: 100%;
}
</style>
