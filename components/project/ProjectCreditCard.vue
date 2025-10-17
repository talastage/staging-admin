<template>
  <div
    class="project-credit-card"
    :class="[`project-credit-card--${size}`, `project-credit-card--${variant}`]"
  >
    <v-card
      :elevation="variant === 'compact' ? 2 : 8"
      class="project-credit-card__inner"
      :class="{
        'project-credit-card__inner--compact': variant === 'compact',
        'project-credit-card__inner--default': variant === 'default',
      }"
    >
      <!-- Default variant layout -->
      <template v-if="variant === 'default'">
        <!-- Background Image -->
        <div class="project-credit-card__image-wrapper">
          <v-img
            :src="credit.user?.profile_photo || defaultAvatar"
            :alt="credit.user?.display_name || 'Cast Member'"
            class="project-credit-card__image"
            cover
            :lazy-src="credit.user?.profile_photo || defaultAvatar"
          >
            <template v-slot:placeholder>
              <div class="project-credit-card__image-placeholder">
                <v-icon
                  icon="mdi-account"
                  :size="iconSize"
                  color="white"
                  class="placeholder-icon"
                />
              </div>
            </template>
          </v-img>
        </div>

        <!-- Content Area -->
        <div class="project-credit-card__content">
          <!-- Role -->
          <div class="project-credit-card__role">
            <span class="role-text">
              {{ credit.role?.name || 'Uncredited' }}
            </span>
          </div>

          <!-- Name -->
          <h3 class="project-credit-card__name">
            {{ credit.user?.display_name || 'Cast Member' }}
          </h3>
          
          <!-- Action Slot -->
          <div v-if="$slots.action" class="project-credit-card__action">
            <slot name="action" />
          </div>
        </div>
      </template>

      <!-- Compact variant layout -->
      <template v-else-if="variant === 'compact'">
        <div class="project-credit-card__compact-content">
          <!-- Avatar -->
          <div class="project-credit-card__avatar">
            <v-avatar :size="avatarSize" class="credit-avatar">
              <v-img
                :src="credit.user?.profile_photo || defaultAvatar"
                :alt="credit.user?.display_name || 'Cast Member'"
                cover
              >
                <template v-slot:placeholder>
                  <div class="avatar-placeholder">
                    <v-icon
                      icon="mdi-account"
                      :size="avatarSize * 0.6"
                      color="white"
                    />
                  </div>
                </template>
              </v-img>
            </v-avatar>
          </div>

          <!-- Text Content -->
          <div class="project-credit-card__text-content">
            <h3
              class="project-credit-card__name project-credit-card__name--compact"
            >
              {{ credit.user?.display_name || 'Cast Member' }}
            </h3>
            <div
              class="project-credit-card__role project-credit-card__role--compact"
            >
              <span class="role-text role-text--compact">
                {{ credit.role?.name || 'Uncredited' }}
              </span>
            </div>
          </div>

          <!-- Action Slot for Compact -->
          <div v-if="$slots.action && variant === 'compact'" class="project-credit-card__action-compact">
            <slot name="action" />
          </div>

          <!-- Edit/Delete Actions for Compact -->
          <div v-if="showActions && variant === 'compact'" class="project-credit-card__actions-compact">
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              color="primary"
              @click.stop="handleEdit"
              class="mr-1"
            >
              <v-icon size="18">mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click.stop="handleDelete"
            >
              <v-icon size="18">mdi-delete</v-icon>
            </v-btn>
          </div>

          <!-- Arrow indicator -->
          <div v-if="!showActions" class="project-credit-card__arrow">
            <v-icon icon="mdi-chevron-right" size="20" color="grey-darken-1" />
          </div>
        </div>
      </template>

      <!-- Click overlay for navigation -->
      <NuxtLink
        :to="`/${credit.user?.username || ''}`"
        class="project-credit-card__link"
        @click="handleCardClick"
      />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface User {
  id?: number
  username?: string
  display_name?: string
  profile_photo?: string
}

interface Role {
  id?: number
  name?: string
  is_custom?: boolean
}

interface Credit {
  id?: number
  user?: User
  role?: Role
}

interface Props {
  credit: Credit
  variant?: 'default' | 'compact'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  showActions: false,
})

const emit = defineEmits(['click', 'edit', 'delete'])

const sizeConfig = {
  sm: {
    iconSize: 32,
    avatarSize: 40,
  },
  md: {
    iconSize: 40,
    avatarSize: 48,
  },
  lg: {
    iconSize: 48,
    avatarSize: 56,
  },
  xl: {
    iconSize: 56,
    avatarSize: 64,
  },
}

const iconSize = computed(() => sizeConfig[props.size].iconSize)
const avatarSize = computed(() => sizeConfig[props.size].avatarSize)
const defaultAvatar = '/images/default-avatar.png'

const handleCardClick = (event: Event) => {
  emit('click', event, props.credit)
}

const handleEdit = () => {
  emit('edit', props.credit)
}

const handleDelete = () => {
  emit('delete', props.credit)
}
</script>

<style scoped lang="scss">
.project-credit-card {
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
  background: transparent;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  aspect-ratio: 2/3;

  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);

    .project-credit-card__image {
      transform: scale(1.05);
    }
  }

  &--compact {
    aspect-ratio: unset;
    height: auto;

    &:hover {
      transform: translateY(-2px) scale(1.005);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .project-credit-card__inner {
      border-radius: 12px;
    }
  }

  &__inner {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 16px;
  }

  // Default variant styles
  &__image-wrapper {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  &__image {
    width: 100%;
    height: 100%;
    transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    object-fit: cover;
  }

  &__image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .placeholder-icon {
      opacity: 0.7;
    }
  }

  &__content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    color: white;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(0, 0, 0, 0.8) 50%,
      rgba(0, 0, 0, 0.5) 75%,
      rgba(0, 0, 0, 0) 100%
    );
    z-index: 2;
  }

  // Compact variant styles
  &__compact-content {
    display: flex;
    align-items: center;
    padding: 18px;
    gap: 16px;
    min-height: 88px;
  }

  &__avatar {
    flex-shrink: 0;

    .credit-avatar {
      border: 2px solid rgba(var(--v-theme-primary), 0.1);
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
    }
  }

  &__text-content {
    flex: 1;
    min-width: 0; // Allows text truncation
  }

  &__arrow {
    flex-shrink: 0;
    opacity: 0.7;
  }

  &__role {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 4px;

    .role-text {
      font-size: 12px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    &--compact {
      margin-bottom: 0;
      margin-top: 0;

      .role-text--compact {
        font-size: 18px;
        color: rgba(var(--v-theme-on-surface), 0.65);
        text-transform: none;
        letter-spacing: 0;
        font-weight: 500;
      }
    }
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: white;
    margin: 0 0 8px 0;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--compact {
      font-size: 24px;
      font-weight: 600;
      color: rgba(var(--v-theme-on-surface), 0.87);
      margin: 0 0 4px 0;
      line-height: 1.3;
      -webkit-line-clamp: 1;
      white-space: nowrap;
    }
  }

  &__action {
    margin-top: 8px;
    position: relative;
    z-index: 3;
  }

  &__action-compact {
    flex-shrink: 0;
    margin-left: auto;
    position: relative;
    z-index: 3;
  }

  &__actions-compact {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    position: relative;
    z-index: 3;
  }

  &__link {
    position: absolute;
    inset: 0;
    z-index: 1;
    text-decoration: none;
  }

  // Size variants for default view
  &--sm {
    .project-credit-card__inner--default {
      min-height: 180px;
    }

    .project-credit-card__content {
      padding: 8px;
    }

    .project-credit-card__name {
      font-size: 10px;
    }

    .project-credit-card__role .role-text {
      font-size: 8px;
    }

    .project-credit-card__action {
      margin-top: 4px;
    }
  }

  &--md {
    .project-credit-card__inner--default {
      min-height: 220px;
    }

    .project-credit-card__content {
      padding: 10px;
    }

    .project-credit-card__name {
      font-size: 11px;
    }

    .project-credit-card__role .role-text {
      font-size: 8px;
    }
  }

  &--lg {
    .project-credit-card__inner--default {
      min-height: 260px;
    }

    .project-credit-card__content {
      padding: 14px;
    }

    .project-credit-card__name {
      font-size: 13px;
    }

    .project-credit-card__role .role-text {
      font-size: 9px;
    }
  }

  &--xl {
    .project-credit-card__inner--default {
      min-height: 300px;
    }

    .project-credit-card__content {
      padding: 16px;
    }

    .project-credit-card__name {
      font-size: 14px;
    }

    .project-credit-card__role .role-text {
      font-size: 10px;
    }
  }
}

// Responsive design
@media (max-width: 600px) {
  .project-credit-card {
    &__content {
      padding: 12px;
    }

    &__name {
      font-size: 12px;

      &--compact {
        font-size: 22px;
      }
    }

    &__role .role-text {
      font-size: 9px;

      &--compact {
        font-size: 16px;
      }
    }

    &__compact-content {
      padding: 12px;
      gap: 12px;
      min-height: 70px;
    }
  }
}

@media (max-width: 480px) {
  .project-credit-card {
    &__inner--default {
      min-height: 220px;
    }

    &__compact-content {
      padding: 10px;
      gap: 10px;
      min-height: 64px;
    }
  }
}

// Loading animation
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.project-credit-card__image-placeholder,
.avatar-placeholder {
  animation: pulse 2s infinite;
}

// Enhanced focus states for accessibility
.project-credit-card__link:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
  border-radius: 16px;
}
</style>
