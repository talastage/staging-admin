<template>
  <div class="notification-bell-wrapper">
    <v-menu
      v-model="menuOpen"
      :close-on-content-click="false"
      :activate-by-hover="false"
      :nudge-width="menuWidth"
      transition="scale-transition"
      :min-width="menuWidth"
      :max-width="menuWidth"
      content-class="notification-menu-content"
      :open-on-click="true"
    >
      <template v-slot:activator="{ props }">
        <div class="notification-bell-container">
          <v-badge
            :content="formattedUnreadCount"
            :model-value="unreadCount > 0"
            color="error"
            overlap
            :class="{ 'high-count': isHighCount }"
          >
            <v-btn
              icon
              v-bind="props"
              @click="handleBellClick"
              :loading="loading"
            >
              <v-icon>mdi-bell</v-icon>
              <div
                v-if="hasNewNotifications && !menuOpen"
                class="new-notification-indicator"
              ></div>
            </v-btn>
          </v-badge>
        </div>
      </template>

      <v-card elevation="10" class="notifications-menu">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span class="text-h6">Notifications</span>
          <div class="d-flex align-center">
            <v-btn
              v-if="unreadCount > 0"
              variant="text"
              size="small"
              class="me-2"
              @click="markAllAsRead"
              :loading="markingAllRead"
            >
              Mark all read
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              to="/notifications"
              @click="closeMenu"
            >
              See all
            </v-btn>
          </div>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="notifications-container pa-0">
          <v-list v-if="!loading && notifications.length">
            <template
              v-for="notification in previewNotifications"
              :key="notification.id"
            >
              <notification-item
                :notification="notification"
                @read="markAsRead"
              />
              <v-divider />
            </template>

            <v-list-item
              v-if="notifications.length > previewLimit"
              class="text-center"
            >
              <v-btn
                variant="text"
                block
                to="/notifications"
                @click="closeMenu"
              >
                View {{ notifications.length - previewLimit }} more
                notifications
              </v-btn>
            </v-list-item>
          </v-list>

          <v-list v-else-if="loading">
            <template v-for="n in 3" :key="n">
              <v-list-item>
                <v-skeleton-loader type="list-item-avatar-two-line" />
              </v-list-item>
              <v-divider />
            </template>
          </v-list>

          <v-list v-else>
            <v-list-item>
              <div class="text-center py-4">
                <v-icon size="40" color="grey">mdi-bell-off</v-icon>
                <div class="text-body-1 mt-2">No notifications</div>
              </div>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/useNotificationStore'
import type { Notification } from '@/types/notification'
import {
  formatNotificationCount,
  isHighNotificationCount,
} from '@/utils/formatters/notificationCount'

// Store setup
const store = useNotificationStore()
const { notifications, unreadCount, loading } = storeToRefs(store)

// Local state
const menuOpen = ref(false)
const markingAllRead = ref(false)
const previewLimit = 5

// SSR-safe display detection
const isMobile = ref(false)
const isSmall = ref(false)
const width = ref(400)

onMounted(() => {
  if (process.client) {
    const checkDisplay = () => {
      isMobile.value = window.innerWidth <= 960
      isSmall.value = window.innerWidth <= 600
      width.value = window.innerWidth
    }
    checkDisplay()
    window.addEventListener('resize', checkDisplay)
  }
})

const menuWidth = computed(() => {
  if (isMobile.value) {
    return Math.min(width.value - 32, 400) // Full width minus padding on mobile
  }
  return 400
})

const previewNotifications = computed((): Notification[] => {
  return notifications.value.slice(0, previewLimit)
})

const hasNewNotifications = computed((): boolean => {
  return store.hasNewNotifications
})

const formattedUnreadCount = computed((): string => {
  return formatNotificationCount(unreadCount.value)
})

const isHighCount = computed((): boolean => {
  return isHighNotificationCount(unreadCount.value)
})

// Methods
const handleBellClick = async (): Promise<void> => {
  if (!menuOpen.value) {
    await store.fetchNotifications(1)
  }
}

const closeMenu = (): void => {
  menuOpen.value = false
}

const markAsRead = async (notificationId: string): Promise<void> => {
  await store.markAsRead(notificationId)
}

const markAllAsRead = async (): Promise<void> => {
  try {
    markingAllRead.value = true
    await store.markAllAsRead()
    menuOpen.value = false
  } finally {
    markingAllRead.value = false
  }
}

// Fetch notifications on component mount
onMounted(async () => {
  // Always fetch notifications on component mount
  await store.fetchNotifications(1)
})
</script>

<style scoped lang="scss">
.notification-bell-wrapper {
  position: relative;
  display: inline-block;
}

.notification-bell-container {
  display: inline-block;
  position: relative;
}

.notifications-menu {
  max-height: 80vh;
  width: 100%;
}

.notifications-container {
  max-height: 60vh;
  overflow-y: auto;
}

.new-notification-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgb(var(--v-theme-error));
  border: 2px solid rgb(var(--v-theme-surface));
  animation: pulse 2s infinite;
}

:deep(.v-badge__badge) {
  font-weight: 600;
}

:deep(.high-count .v-badge__badge) {
  font-size: 10px;
  padding: 0 4px;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(var(--v-theme-error), 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0);
  }
}

:deep(.v-list-item) {
  min-height: unset !important;
  padding: 12px 16px;
}

:deep(.v-badge) {
  line-height: 1;
}

:deep(.notification-menu-content) {
  margin-top: 8px !important;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .notifications-menu {
    max-width: calc(100vw - 32px);
  }
  
  :deep(.v-card-title) {
    flex-wrap: wrap;
    gap: 8px;
    
    .text-h6 {
      font-size: 1rem !important;
    }
    
    .d-flex {
      flex-wrap: wrap;
      justify-content: flex-end;
    }
  }
}
</style>