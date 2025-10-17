import { defineStore } from "pinia";
import { useNuxtApp } from "#app";

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_types: string[];
}

export const useNotificationSettingsStore = defineStore(
  "notificationSettings",
  {
    state: () => ({
      settings: null as NotificationSettings | null,
    }),
    actions: {
      async fetchSettings() {
        const { $axios } = useNuxtApp();
        try {
          const { data } = await $axios.get("/api/notification-settings");
          this.settings = data;
        } catch (error) {
          console.error("Error fetching notification settings:", error);
        }
      },
      async updateSettings(newSettings: NotificationSettings) {
        const { $axios } = useNuxtApp();
        try {
          const { data } = await $axios.put(
            "/api/notification-settings",
            newSettings
          );
          this.settings = data;
        } catch (error) {
          console.error("Error updating notification settings:", error);
        }
      },
    },
  }
);
