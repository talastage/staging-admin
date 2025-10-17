<template>
  <v-card>
    <v-card-title>Notification Settings</v-card-title>
    <v-card-text>
      <v-switch
        v-model="localSettings.email_notifications"
        label="Email Notifications"
      ></v-switch>
      <v-switch
        v-model="localSettings.sms_notifications"
        label="SMS Notifications"
      ></v-switch>
      <v-switch
        v-model="localSettings.push_notifications"
        label="Push Notifications"
      ></v-switch>
      <v-select
        v-model="localSettings.notification_types"
        :items="notificationTypes"
        label="Notification Types"
        multiple
        chips
      ></v-select>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="saveSettings">Save Settings</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useNotificationSettingsStore } from "~/stores/notificationSettings";

const store = useNotificationSettingsStore();
const localSettings = ref({
  email_notifications: false,
  sms_notifications: false,
  push_notifications: false,
  notification_types: [],
});

const notificationTypes = [
  "Transfer Completed",
  "Wallet Activation",
  "Security Alerts",
  "Promotional Messages",
];

onMounted(async () => {
  await store.fetchSettings();
  if (store.settings) {
    localSettings.value = { ...store.settings };
  }
});

const saveSettings = async () => {
  await store.updateSettings(localSettings.value);
};
</script>
