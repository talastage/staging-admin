<template>
  <v-list-item
    :class="{ 'py-1': $vuetify.display.smAndDown }"
    class="contact-item position-relative"
    :ripple="false"
  >
    <template v-slot:prepend>
      <v-avatar
        :color="iconColor"
        :size="$vuetify.display.smAndDown ? 32 : 40"
        variant="tonal"
        class="mr-3"
      >
        <v-icon
          :color="iconColor"
          :size="$vuetify.display.smAndDown ? 'small' : 'default'"
        >
          {{ icon }}
        </v-icon>
      </v-avatar>
    </template>

    <!-- Contact info area -->
    <div class="contact-content flex-grow-1" @click="navigateToContact">
      <v-list-item-title
        :class="{ 'text-body-2': $vuetify.display.smAndDown }"
        class="font-weight-medium"
      >
        {{ displayValue }}
      </v-list-item-title>
      <v-list-item-subtitle class="text-caption text-medium-emphasis mt-1">
        {{ subtitle }}
      </v-list-item-subtitle>
    </div>

    <!-- Action button -->
    <template v-slot:append>
      <div class="d-flex align-center gap-2">
        <!-- Copy button (only for email and phone) -->
        <v-tooltip
          v-if="type !== 'whatsapp'"
          location="top"
          text="Copy to clipboard"
        >
          <template v-slot:activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon="mdi-content-copy"
              variant="text"
              :density="$vuetify.display.smAndDown ? 'compact' : 'comfortable'"
              :size="$vuetify.display.smAndDown ? 'small' : 'default'"
              @click.stop="$emit('copy', value)"
              class="copy-btn"
              color="grey-darken-1"
            />
          </template>
        </v-tooltip>

        <!-- Contact action button -->
        <v-tooltip location="top" :text="actionTooltip">
          <template v-slot:activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              :icon="actionIcon"
              variant="tonal"
              :color="iconColor"
              :density="$vuetify.display.smAndDown ? 'compact' : 'comfortable'"
              :size="$vuetify.display.smAndDown ? 'small' : 'default'"
              @click.stop="navigateToContact"
              class="action-btn"
              elevation="0"
            />
          </template>
        </v-tooltip>
      </div>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type: 'whatsapp' | 'email' | 'phone'
  value: string
  formatters?: any
  external?: boolean
  showSubtitle?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['copy'])

const iconMap = {
  whatsapp: 'mdi-whatsapp',
  email: 'mdi-email-outline',
  phone: 'mdi-phone-outline',
}

const actionIconMap = {
  whatsapp: 'mdi-send',
  email: 'mdi-email-send-outline',
  phone: 'mdi-phone',
}

const colorMap = {
  whatsapp: 'success',
  email: 'primary',
  phone: 'info',
}

const icon = computed(() => iconMap[props.type])
const actionIcon = computed(() => actionIconMap[props.type])
const iconColor = computed(() => colorMap[props.type])

const displayValue = computed(() => {
  if (props.type === 'whatsapp') {
    // Hide the actual WhatsApp number and show a generic message
    return 'WhatsApp Support'
  }

  if (props.type === 'phone') {
    return props.formatters?.phone(props.value) || props.value
  }

  return props.value
})

const subtitle = computed(() => {
  switch (props.type) {
    case 'whatsapp':
      return 'Click to start a chat with our support team'
    case 'email':
      return `Send us an email`
    case 'phone':
      return `Call us directly`
    default:
      return ''
  }
})

const actionTooltip = computed(() => {
  switch (props.type) {
    case 'whatsapp':
      return 'Start WhatsApp chat'
    case 'email':
      return 'Send email'
    case 'phone':
      return 'Make call'
    default:
      return ''
  }
})

const href = computed(() => {
  switch (props.type) {
    case 'whatsapp':
      return props.formatters?.whatsApp(props.value)
    case 'email':
      return `mailto:${props.value}`
    case 'phone':
      return `tel:${props.value}`
    default:
      return ''
  }
})

function navigateToContact() {
  if (href.value) {
    if (props.external || props.type === 'whatsapp') {
      window.open(href.value, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = href.value
    }
  }
}
</script>

<style scoped>
.contact-item {
  cursor: default;
  transition: background-color 0.2s ease;
  border-radius: 12px !important;
  margin: 4px 8px;
  padding: 12px 16px;
}

.contact-item:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.08);
}

.contact-content {
  cursor: pointer;
  padding: 4px 0;
  transition: transform 0.1s ease;
}

.contact-content:hover {
  transform: translateX(2px);
}

.copy-btn {
  transition: all 0.2s ease;
}

.copy-btn:hover {
  transform: scale(1.1);
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.3);
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .contact-item {
    margin: 2px 4px;
    padding: 8px 12px;
  }

  .contact-content:hover {
    transform: none;
  }

  .copy-btn:hover,
  .action-btn:hover {
    transform: none;
  }
}

/* Dark theme adjustments */
:deep(.v-theme--dark) {
  .contact-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
}
</style>
