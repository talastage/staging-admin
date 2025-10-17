<template>
  <div class="description-display">
    <v-expand-transition>
      <div
        v-if="isExpanded"
        :class="[
          'description-content pa-4 rounded-xl',
          bgColorClass,
          borderClass
        ]"
      >
        <p :class="['mb-0', textClass]" v-if="!useHtml">{{ description }}</p>
        <div :class="textClass" v-else v-html="sanitizedHtml"></div>
      </div>
    </v-expand-transition>
    
    <v-btn
      v-if="toggleable"
      variant="text"
      size="small"
      :color="buttonColor"
      class="mt-2 px-0"
      @click="toggleDescription"
    >
      {{ isExpanded ? hideText : showText }}
      <v-icon
        :icon="isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        class="ml-1"
        size="small"
      />
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  description: {
    type: String,
    required: true
  },
  initiallyExpanded: {
    type: Boolean,
    default: false
  },
  toggleable: {
    type: Boolean,
    default: true
  },
  showText: {
    type: String,
    default: 'Show description'
  },
  hideText: {
    type: String,
    default: 'Hide description'
  },
  bgColor: {
    type: String,
    default: 'grey-lighten-4'
  },
  textClass: {
    type: String,
    default: 'text-body-1 text-medium-emphasis'
  },
  buttonColor: {
    type: String,
    default: 'primary'
  },
  withBorder: {
    type: Boolean,
    default: true
  },
  borderColor: {
    type: String,
    default: 'primary'
  },
  useHtml: {
    type: Boolean,
    default: false
  }
})

const isExpanded = ref(props.initiallyExpanded)

const toggleDescription = () => {
  isExpanded.value = !isExpanded.value
}

const bgColorClass = computed(() => `bg-${props.bgColor}`)
const borderClass = computed(() => props.withBorder ? `description-border-${props.borderColor}` : '')

// Basic HTML sanitization for when useHtml is true
const sanitizedHtml = computed(() => {
  if (!props.useHtml) return ''
  
  // This is a very basic sanitization - in production, use a proper sanitizer library
  return props.description
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/g, '')
})
</script>

<style scoped>
.description-display {
  width: 100%;
}

.description-content {
  transition: all 0.3s ease;
  line-height: 1.5;
}

.description-border-primary {
  border-left: 3px solid var(--v-theme-primary);
}

.description-border-secondary {
  border-left: 3px solid var(--v-theme-secondary);
}

.description-border-accent {
  border-left: 3px solid var(--v-theme-accent);
}

.description-border-error {
  border-left: 3px solid var(--v-theme-error);
}

.description-border-info {
  border-left: 3px solid var(--v-theme-info);
}

.description-border-success {
  border-left: 3px solid var(--v-theme-success);
}

.description-border-warning {
  border-left: 3px solid var(--v-theme-warning);
}
</style>