<!-- components\user\UserCard.vue -->

<template>
  <v-card
    :class="[
      'user-talent-card',
      `user-talent-card--${size}`,
      { 'user-talent-card--compact': layout === 'compact' },
      customClass,
    ]"
    :elevation="layout === 'compact' ? 0 : 10"
    :hover="layout !== 'compact'"
    :flat="layout === 'compact'"
    :width="layout === 'standard' ? 280 : undefined"
    :style="[customStyle, cardStyle]"
  >
    <div v-if="layout === 'standard'" class="user-talent-card__image-container">
      <UserAvatar
        :username="user.username"
        :profile_photo="user.profile_photo"
        :size="280"
        class="user-talent-card__image"
      />
    </div>
    <v-card-item v-if="layout === 'standard'">
      <v-card-title :class="titleClass">
        {{ user.display_name }}
      </v-card-title>
      <v-card-subtitle :class="subtitleClass">
        {{ user.talent }}
      </v-card-subtitle>
      <slot name="action"></slot>
    </v-card-item>
    <v-list-item v-else class="pa-2">
      <template v-slot:prepend>
        <div class="user-talent-card__avatar-container mr-3">
          <UserAvatar
            :username="user.username"
            :profile_photo="user.profile_photo"
            :size="48"
            class="user-talent-card__avatar"
          />
        </div>
      </template>
      <v-list-item-title :class="titleClass">
        {{ user.display_name }}
      </v-list-item-title>
      <v-list-item-subtitle :class="subtitleClass">
        {{ user.talent }}
      </v-list-item-subtitle>
      <template v-slot:append>
        <slot name="action"></slot>
      </template>
    </v-list-item>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface User {
  id: number
  username: string
  display_name: string
  profile_photo: string
  talent: string
  is_fanning: boolean
}

const props = withDefaults(
  defineProps<{
    user: User
    size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'
    layout?: 'standard' | 'compact'
    customClass?: string
    customStyle?: string
  }>(),
  {
    size: 'medium',
    layout: 'standard',
    customClass: '',
    customStyle: '',
  }
)

const titleClass = computed(() => {
  const baseClass = 'font-weight-medium text-truncate'
  switch (props.size) {
    case 'xsmall':
      return `${baseClass} text-subtitle-2`
    case 'small':
      return `${baseClass} text-subtitle-1`
    case 'large':
      return `${baseClass} text-h5`
    case 'xlarge':
      return `${baseClass} text-h4`
    default:
      return `${baseClass} text-h6`
  }
})

const subtitleClass = computed(() => {
  const baseClass = 'text-truncate'
  switch (props.size) {
    case 'xsmall':
      return `${baseClass} text-caption`
    case 'small':
      return `${baseClass} text-body-2`
    case 'large':
    case 'xlarge':
      return `${baseClass} text-subtitle-1`
    default:
      return `${baseClass} text-body-1`
  }
})

const cardStyle = computed(() => ({
  transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
}))
</script>

<style scoped>
.user-talent-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.user-talent-card__image-container {
  position: relative;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  overflow: hidden;
  border-radius: 16px 16px 0 0;
}

.user-talent-card__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.user-talent-card:hover .user-talent-card__image {
  transform: scale(1.05);
}

.user-talent-card--compact {
  max-width: 100%;
  background-color: transparent !important;
}

.user-talent-card__avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
}

.user-talent-card__avatar {
  border-radius: 50%;
  object-fit: cover;
}

/* Size-specific styles */
.user-talent-card--xsmall {
  font-size: 0.8rem;
}
.user-talent-card--small {
  font-size: 0.9rem;
}
.user-talent-card--large {
  font-size: 1.1rem;
}
.user-talent-card--xlarge {
  font-size: 1.2rem;
}

.user-talent-card:not(.user-talent-card--compact):hover {
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22) !important;
}

.user-talent-card--compact .v-list-item {
  align-items: center;
  background-color: transparent;
  padding: 8px 16px;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.user-talent-card--compact .v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.user-talent-card--compact .v-list-item__prepend {
  margin-right: 16px;
}

.user-talent-card--compact .v-list-item__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
