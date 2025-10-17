<!-- components\user\UserAvatar.vue -->

<template>
  <component
    :is="disableLink ? 'div' : 'NuxtLink'"
    :to="disableLink ? undefined : `/${username}`"
    :class="['user-avatar-link', { disabled: disableLink }]"
  >
    <div class="avatar-wrapper">
      <v-avatar :size="avatarSize" :rounded="roundedShape">
        <v-img
          :key="avatarUrl"
          :src="avatarUrl"
          :alt="`${username || 'User'} profile photo`"
          :width="avatarSize"
          :height="avatarSize"
          cover
          :error="defaultAvatarUrl"
        >
          <template v-slot:error>
            <v-img
              :src="defaultAvatarUrl"
              :width="avatarSize"
              :height="avatarSize"
              cover
            />
          </template>
        </v-img>
      </v-avatar>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type AvatarSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | number

interface Props {
  username?: string
  profile_photo?: string
  size?: AvatarSize
  disableLink?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  username: '',
  profile_photo: '',
  size: 'md',
  disableLink: false,
})

const defaultAvatarUrl = '/images/profile/default.png'

const avatarSize = computed(() => {
  if (typeof props.size === 'number') {
    return props.size
  }

  const sizesMap: Record<string, number> = {
    xs: 24, // Extra small
    sm: 32, // Small
    md: 48, // Medium (default)
    lg: 64, // Large
    xl: 80, // Extra large
    '2xl': 120, // 2x Extra large
    '3xl': 160, // 3x Extra large
    '4xl': 200, // 4x Extra large
    '5xl': 240, // 5x Extra large
  }

  return sizesMap[props.size] || 48 // Default to medium if size not found
})

const roundedShape = '50%'

const avatarUrl = computed(() => {
  if (!props.profile_photo) return defaultAvatarUrl

  // Handle relative paths by appending them to your base URL if needed
  if (props.profile_photo.startsWith('/images')) {
    return props.profile_photo
  }

  return props.profile_photo
})
</script>

<style scoped>
.user-avatar-link {
  text-decoration: none;
  display: inline-block;
}

.avatar-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

:deep(.v-img__img) {
  object-fit: cover;
}

:deep(.v-responsive__content) {
  background-color: #f5f5f5;
}

/* Add hover effect only when link is not disabled */
.user-avatar-link:not(.disabled) {
  transition: transform 0.2s ease;
  cursor: pointer;
}

.user-avatar-link:not(.disabled):hover {
  transform: scale(1.05);
}

/* Disabled state */
.user-avatar-link.disabled {
  cursor: default;
  pointer-events: none;
}

/* Responsive adjustments for larger sizes */
@media (max-width: 600px) {
  :deep(.v-avatar--size-5xl) {
    width: 180px !important;
    height: 180px !important;
  }

  :deep(.v-avatar--size-4xl) {
    width: 160px !important;
    height: 160px !important;
  }

  :deep(.v-avatar--size-3xl) {
    width: 120px !important;
    height: 120px !important;
  }
}
</style>
