<!-- components/UserProfileButton.vue -->
<template>
  <div v-if="isLoggedIn" class="user-profile-button px-4 py-3">
    <NuxtLink :to="`/${user?.username}`" class="profile-link">
      <div class="d-flex flex-column">
        <!-- User Basic Info -->
        <div class="d-flex align-center mb-2">
          <UserAvatar
            :username="user?.username"
            :profile_photo="user?.profile_photo"
            size="small"
            class="mr-3"
          />

          <div class="user-info">
            <div
              class="user-name text-subtitle-1 font-weight-medium text-truncate"
            >
              {{ user?.display_name || user?.username }}
            </div>
            <div class="username text-caption text-grey-darken-1 text-truncate">
              @{{ user?.username }}
            </div>
          </div>
        </div>

        <!-- Talent Info - Only shown if user has talent -->
        <div v-if="talentName" class="talent-info text-center">
          <div class="talent-badge">
            <v-icon size="14" color="primary" class="mr-1">mdi-star</v-icon>
            <span class="talent-name">{{ talentName }}</span>
          </div>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserTalentState } from '~/composables/useUserTalentState'

const authStore = useAuthStore()
const { talentName } = useUserTalentState()

// Guard access to user while being SSR-safe. `authStore.user` is a ref in the store.
const user = computed(() => {
  // If the store is not initialized during SSR, return null
  try {
    return (authStore.user && typeof authStore.user === 'object') ? authStore.user : null
  } catch (e) {
    return null
  }
})

const isLoggedIn = computed(() => {
  try {
    return !!(authStore.isLoggedIn)
  } catch (e) {
    return false
  }
})
</script>

<style lang="scss" scoped>
.user-profile-button {
  background: transparent;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  margin-bottom: 8px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  .profile-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .user-info {
    flex: 1;
    min-width: 0; // Enable text truncation
  }

  .user-name {
    color: #050505;
    line-height: 1.2;
    margin-bottom: 2px;
  }

  .username {
    line-height: 1.2;
  }

  .talent-info {
    margin-top: 8px;
    margin-bottom: 4px;
    display: flex;
    justify-content: center;
  }

  .talent-badge {
    display: inline-flex;
    align-items: center;
    background-color: rgba(var(--v-theme-primary), 0.1);
    padding: 4px 12px;
    border-radius: 12px;

    .talent-name {
      font-size: 0.75rem;
      color: rgb(var(--v-theme-primary));
      font-weight: 500;
    }
  }
}

// Responsive adjustments
@media (max-width: 960px) {
  .user-profile-button {
    .user-name {
      font-size: 0.9rem;
    }
  }
}
</style>
