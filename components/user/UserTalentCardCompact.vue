<template>
  <v-card
    :class="['user-talent-card-compact d-flex align-center', sizeClass]"
    elevation="10"
  >
    <div class="user-talent-card-compact__image-container">
      <NuxtLink :to="`/${user.username}`">
        <nuxt-img
          :src="user.profile_photo"
          :alt="user.display_name"
          class="user-talent-card-compact__image"
          :width="imageSize"
          :height="imageSize"
          fit="cover"
          loading="lazy"
          placeholder
        />
      </NuxtLink>
    </div>
    <div class="user-talent-card-compact__content flex-grow-1">
      <div :class="['font-weight-medium text-truncate', nameClass]">
        {{ user.display_name }}
      </div>
      <div :class="['text-truncate text-medium-emphasis', talentClass]">
        {{ user.talent }}
      </div>
    </div>
    <div class="user-talent-card-compact__action px-4">
      <slot name="action"></slot>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface User {
  id: number
  username?: string
  display_name?: string
  profile_photo?: string
  talent?: string
}

// Default values
const defaultProfilePhoto = '/images/default-avatar.png'
const defaultDisplayName = 'Unnamed User'
const defaultTalent = 'No talent specified'

const props = withDefaults(
  defineProps<{
    user: User
    size?: 'small' | 'medium' | 'large'
  }>(),
  {
    size: 'medium',
  }
)

// Computed properties with memoization
const profileLink = computed(() => {
  return props.user.username ? `/${props.user.username}` : '#'
})

const sizeClass = computed(() => `user-talent-card-compact--${props.size}`)

const imageSize = computed(() => {
  const sizes = {
    small: 56,
    medium: 64,
    large: 84,
  }
  return sizes[props.size] || sizes.medium
})

const nameClass = computed(() => {
  const classes = {
    small: 'text-subtitle-2',
    medium: 'text-h6',
    large: 'text-h5',
  }
  return classes[props.size] || classes.medium
})

const talentClass = computed(() => {
  const classes = {
    small: 'text-caption',
    medium: 'text-body-2',
    large: 'text-subtitle-1',
  }
  return classes[props.size] || classes.medium
})
</script>
<style scoped>
.user-talent-card-compact {
  border-radius: 8px;
  overflow: hidden;
}

.user-talent-card-compact__image-container {
  flex-shrink: 0;
}

.user-talent-card-compact__image {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  object-fit: cover;
}

.user-talent-card-compact__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-talent-card-compact__action {
  flex-shrink: 0;
}

/* Size-specific styles */
.user-talent-card-compact--small {
  height: 56px; /* Increased from 48px */
}

.user-talent-card-compact--small .user-talent-card-compact__content {
  padding: 0 10px; /* Slightly increased padding */
}

.user-talent-card-compact--medium {
  height: 64px; /* Increased from 56px */
}

.user-talent-card-compact--medium .user-talent-card-compact__content {
  padding: 0 14px; /* Slightly increased padding */
}

.user-talent-card-compact--large {
  height: 84px; /* Increased from 72px */
}

.user-talent-card-compact--large .user-talent-card-compact__content {
  padding: 0 18px; /* Slightly increased padding */
}
</style>
