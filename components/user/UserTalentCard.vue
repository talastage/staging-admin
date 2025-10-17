<template>
  <div
    class="talent-card"
    :class="[`talent-card--${size}`, `talent-card--${variant}`]"
  >
    <div class="talent-card__inner">
      <!-- Background Image -->
      <div class="talent-card__image-wrapper">
        <v-img
          :src="user.profile_photo"
          :alt="user.display_name"
          class="talent-card__image"
          cover
          :lazy-src="user.profile_photo"
        >
          <template v-slot:placeholder>
            <div class="talent-card__image-placeholder">
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

      <!-- Content Area with improved styling -->
      <div class="talent-card__content">
        <!-- Category/Status -->
        <div class="talent-card__category">
          <span class="category-text">{{ user.talent || 'Creator' }}</span>
        </div>

        <!-- Name -->
        <h3 class="talent-card__name">{{ user.display_name }}</h3>
        
        <!-- Action Slot -->
        <div v-if="$slots.action" class="talent-card__action">
          <slot name="action" />
        </div>
      </div>

      <!-- Click overlay for navigation -->
      <NuxtLink
        :to="`/${user.username}`"
        class="talent-card__link"
        @click="handleCardClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface User {
  id: number
  username: string
  display_name: string
  profile_photo: string
  talent: string
}

interface Props {
  user: User
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  variant?: 'default' | 'live' | 'connecting' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  variant: 'default',
})

const emit = defineEmits(['click'])

const sizeConfig = {
  small: {
    iconSize: 32,
  },
  medium: {
    iconSize: 40,
  },
  large: {
    iconSize: 48,
  },
  xlarge: {
    iconSize: 56,
  },
}

const iconSize = computed(() => sizeConfig[props.size].iconSize)

const handleCardClick = (event: Event) => {
  emit('click', event, props.user)
}
</script>

<style scoped lang="scss">
.talent-card {
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
  background: transparent;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  aspect-ratio: 3/4;

  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);

    .talent-card__image {
      transform: scale(1.05);
    }
  }

  &__inner {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 16px;
  }

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
    padding: 16px;
    color: white;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.85) 0%,
      rgba(0, 0, 0, 0.7) 60%,
      rgba(0, 0, 0, 0.4) 80%,
      rgba(0, 0, 0, 0) 100%
    );
    z-index: 2;
  }

  &__category {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 4px;

    .category-text {
      font-size: 10px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: white;
    margin: 0 0 8px 0;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__action {
    margin-top: 8px;
    position: relative;
    z-index: 3;
  }

  &__link {
    position: absolute;
    inset: 0;
    z-index: 1;
    text-decoration: none;
  }

  // Size variants adjusted with smaller text
  &--small {
    .talent-card__content {
      padding: 12px;
    }

    .talent-card__name {
      font-size: 12px;
    }

    .talent-card__category .category-text {
      font-size: 9px;
    }
  }

  &--large {
    .talent-card__content {
      padding: 18px;
    }

    .talent-card__name {
      font-size: 16px;
    }
  }

  &--xlarge {
    .talent-card__content {
      padding: 20px;
    }

    .talent-card__name {
      font-size: 18px;
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

.talent-card__image-placeholder {
  animation: pulse 2s infinite;
}
</style>
