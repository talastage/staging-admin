<!-- components/UserDisplay.vue -->
<template>
  <component
    :is="wrapperComponent"
    :class="[
      'user-display',
      `user-display--${size}`,
      `user-display--${layout}`,
    ]"
    :elevation="elevation"
    :rounded="rounded"
    :width="containerWidth"
  >
    <!-- Horizontal Layout -->
    <div v-if="layout === 'horizontal'" class="d-flex align-center">
      <v-avatar
        :size="avatarSizes[size]"
        :image="user.profile_photo"
        :class="{ 'mr-3': !compact }"
      >
        <v-icon v-if="!user.profile_photo" :size="avatarSizes[size] / 2">
          mdi-account
        </v-icon>
      </v-avatar>

      <div v-if="!compact" class="user-info">
        <v-card-title class="pa-0">{{ user.display_name }}</v-card-title>
        <v-card-subtitle class="pa-0">@{{ user.username }}</v-card-subtitle>
      </div>
    </div>

    <!-- Vertical Layout -->
    <div v-else-if="layout === 'vertical'" class="text-center">
      <v-avatar
        :size="avatarSizes[size]"
        :image="user.profile_photo"
        class="mb-3"
      >
        <v-icon v-if="!user.profile_photo" :size="avatarSizes[size] / 2">
          mdi-account
        </v-icon>
      </v-avatar>

      <div v-if="!compact" class="user-info">
        <v-card-title class="justify-center pa-0">{{
          user.display_name
        }}</v-card-title>
        <v-card-subtitle class="justify-center pa-0"
          >@{{ user.username }}</v-card-subtitle
        >
      </div>
    </div>

    <!-- Grid Layout -->
    <div v-else-if="layout === 'grid'" class="grid-layout">
      <v-avatar
        :size="avatarSizes[size]"
        :image="user.profile_photo"
        class="grid-avatar"
      >
        <v-icon v-if="!user.profile_photo" :size="avatarSizes[size] / 2">
          mdi-account
        </v-icon>
      </v-avatar>

      <div v-if="!compact" class="user-info overlay-info">
        <div class="text-subtitle-1">{{ user.display_name }}</div>
        <div class="text-caption">@{{ user.username }}</div>
      </div>
    </div>
  </component>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true,
    validator: (user) => {
      return user.id && user.username && user.display_name
    },
  },
  layout: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical', 'grid'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
  },
  compact: {
    type: Boolean,
    default: false,
  },
  elevation: {
    type: [Number, String],
    default: 0,
  },
  rounded: {
    type: [Boolean, String],
    default: 'lg',
  },
})

// Computed properties
const wrapperComponent = computed(() =>
  props.elevation > 0 ? 'v-card' : 'div'
)

const avatarSizes = {
  xs: 32,
  sm: 40,
  md: 48,
  lg: 64,
  xl: 96,
}

const containerWidth = computed(() => {
  const widths = {
    xs: '120px',
    sm: '160px',
    md: '200px',
    lg: '280px',
    xl: '320px',
  }
  return props.layout !== 'horizontal' ? widths[props.size] : 'auto'
})

// Error handling for image load
const handleImageError = (event) => {
  event.target.src = '' // This will trigger the fallback icon
}
</script>

<style scoped>
.user-display {
  position: relative;
  transition: all 0.3s ease;
}

.user-display:hover {
  transform: translateY(-2px);
}

.grid-layout {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1;
}

.grid-avatar {
  width: 100%;
  height: 100%;
}

.overlay-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.grid-layout:hover .overlay-info {
  opacity: 1;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .user-display--xl {
    max-width: 100%;
  }

  .user-info {
    font-size: 0.9em;
  }
}
</style>
