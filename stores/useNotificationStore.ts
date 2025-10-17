// stores\useNotificationStore.ts

import { defineStore } from 'pinia'
import type {
  Notification,
  NotificationState,
  NotificationResponse,
  ActionResponse,
  PaginationData,
} from '@/types/notification'

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    hasNewNotifications: false,
    lastFetchTime: 0,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
    },
    error: null,
  }),

  getters: {
    unreadNotifications(): Notification[] {
      return this.notifications.filter((notification) => !notification.is_read)
    },

    hasUnread(): boolean {
      return this.unreadCount > 0
    },

    hasMorePages(): boolean {
      return this.pagination.current_page < this.pagination.last_page
    },
  },

  actions: {
    async fetchNotifications(page: number = 1): Promise<void> {
      // Only apply the time check for first page refreshes
      if (page === 1 && Date.now() - this.lastFetchTime < 30000) {
        return
      }

      const { $axios } = useNuxtApp()
      this.loading = true
      this.error = null

      try {
        const response = await $axios.get<NotificationResponse>(
          '/api/notifications',
          {
            params: {
              page,
              per_page: 10,
            },
          }
        )

        const { notifications, unread_count, pagination } = response.data

        if (page === 1) {
          // Check for new notifications
          const hasNew =
            this.notifications.length > 0 &&
            notifications.some(
              (notification: Notification) =>
                !this.notifications.find((n) => n.id === notification.id)
            )

          this.hasNewNotifications = hasNew
          this.notifications = notifications
        } else {
          // Append new notifications for infinite scroll
          this.notifications = [...this.notifications, ...notifications]
        }

        this.unreadCount = unread_count
        this.pagination = pagination
        this.lastFetchTime = Date.now()
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : 'Failed to fetch notifications'
        console.error('Error fetching notifications:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchUnreadCount(): Promise<void> {
      const { $axios } = useNuxtApp()

      try {
        const response = await $axios.get<{ unread_count: number }>(
          '/api/notifications/unread-count'
        )
        this.unreadCount = response.data.unread_count
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    },

    async markAsRead(notificationId: string): Promise<void> {
      const { $axios } = useNuxtApp()

      try {
        const response = await $axios.post<ActionResponse>(
          `/api/notifications/${notificationId}/read`
        )

        // Update local state
        const notification = this.notifications.find(
          (n) => n.id === notificationId
        )
        if (notification) {
          notification.is_read = true
          notification.read_at = new Date().toISOString()
        }

        this.unreadCount = response.data.unread_count
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    },

    async markAllAsRead(): Promise<void> {
      const { $axios } = useNuxtApp()

      try {
        const response = await $axios.post<ActionResponse>(
          '/api/notifications/mark-all-read'
        )

        // Update local state
        this.notifications = this.notifications.map((notification) => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString(),
        }))

        this.unreadCount = response.data.unread_count
        this.hasNewNotifications = false
      } catch (error) {
        console.error('Error marking all notifications as read:', error)
      }
    },

    async handleAction(
      notificationId: string,
      actionType: string,
      payload: Record<string, any>
    ): Promise<void> {
      const { $axios } = useNuxtApp()

      try {
        await $axios.post(`/api/notifications/${notificationId}/action`, {
          action: actionType,
          payload,
        })

        // Optionally update local state based on action response
        await this.fetchNotifications(1)
      } catch (error) {
        console.error('Error handling notification action:', error)
      }
    },

    setHasNewNotifications(value: boolean): void {
      this.hasNewNotifications = value
    },

    clearError(): void {
      this.error = null
    },

    resetStore(): void {
      this.$reset()
    },
  },
})
