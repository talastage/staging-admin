<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" offset-md="2">
        <v-card elevation="10">
          <v-card-title class="d-flex justify-space-between align-center pa-4">
            <span class="text-h5">Notifications</span>
            <v-btn
              v-if="unreadCount > 0"
              variant="text"
              @click="markAllAsRead"
              :disabled="loading"
            >
              Mark all as read
            </v-btn>
          </v-card-title>

          <v-divider></v-divider>

          <!-- Notifications List -->
          <v-card-text class="pa-0">
            <v-list v-if="!loading || page > 1">
              <template
                v-for="notification in notifications"
                :key="notification.id"
              >
                <notification-item
                  :notification="notification"
                  @action="handleNotificationAction"
                  @read="markAsRead"
                />
                <v-divider />
              </template>
            </v-list>

            <!-- Loading State -->
            <v-list v-if="loading && page === 1">
              <template v-for="n in 10" :key="n">
                <v-list-item>
                  <v-skeleton-loader type="list-item-avatar-two-line" />
                </v-list-item>
                <v-divider />
              </template>
            </v-list>

            <!-- Empty State -->
            <v-list v-if="!loading && notifications.length === 0">
              <v-list-item>
                <div class="text-center py-8">
                  <v-icon size="64" color="grey">mdi-bell-off</v-icon>
                  <div class="text-h6 mt-4">No notifications</div>
                  <div class="text-body-2 text-grey">You're all caught up!</div>
                </div>
              </v-list-item>
            </v-list>

            <!-- Loading More Indicator -->
            <div v-if="loading && page > 1" class="pa-4 text-center">
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
            </div>

            <!-- Infinite Scroll Sentinel -->
            <div ref="sentinelRef" class="sentinel" v-if="hasMorePages"></div>

            <!-- No More Notifications -->
            <div
              v-else-if="notifications.length > 0"
              class="pa-4 text-center text-grey"
            >
              No more notifications
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useInfiniteLoader } from '@/composables/useInfiniteLoader'

const store = useNotificationStore()
const { notifications, unreadCount, loading, hasMorePages } = storeToRefs(store)

// Fetch page handler for infinite loader
const fetchPage = async (page: number) => {
  await store.fetchNotifications(page)
}

// Initialize infinite loader
const { sentinelRef, page, isLoading, initLoader } = useInfiniteLoader(
  fetchPage,
  hasMorePages,
  { immediate: true }
)

// Action handlers
const markAsRead = async (notificationId: string) => {
  await store.markAsRead(notificationId)
}

const markAllAsRead = async () => {
  await store.markAllAsRead()
}

const handleNotificationAction = async (
  notificationId: string,
  action: string,
  payload: any
) => {
  await store.handleAction(notificationId, action, payload)
}
</script>

<style scoped>
.sentinel {
  height: 10px;
  margin: 16px 0;
}
</style>
