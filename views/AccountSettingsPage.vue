<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="3">
        <h2 class="text-h6 mb-4">Getting Started</h2>
        <v-list bg-color="grey-lighten-4" rounded="lg" class="settings-list">
          <v-list-item
            v-for="(tabItem, index) in tabsData"
            :key="index"
            :value="index"
            @click="activeTab = index"
            :active="activeTab === index"
            :prepend-icon="tabItem.icon"
            class="mb-2"
            :class="{ 'v-list-item--active': activeTab === index }"
            rounded="lg"
          >
            <v-list-item-title>{{ tabItem.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col cols="12" md="9">
        <v-card class="pa-6" elevation="1" rounded="lg">
          <v-window v-model="activeTab">
            <v-window-item
              v-for="(tabItem, index) in tabsData"
              :key="index"
              :value="index"
            >
              <component :is="tabItem.component" />
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import PersonalDetailSettings from '@/components/settings/PersonalDetailSettings.vue'
import PasswordAndSecuritySettings from '@/components/settings/PasswordAndSecuritySettings.vue'
import EmailSettings from '@/components/settings/EmailSettings.vue'
import TalentSettings from '@/components/settings/TalentSettings.vue'
//import NotificationSettings from "@/components/notification/NotificationSettings.vue"; // Added Notification Settings

const tabsData = [
  {
    icon: 'mdi-card-account-details',
    title: 'Personal Details',
    component: PersonalDetailSettings,
  },
  {
    icon: 'mdi-star',
    title: 'Creator Profile',
    component: TalentSettings,
  },
  {
    icon: 'mdi-email-outline',
    title: 'Email Settings',
    component: EmailSettings,
  },
  {
    icon: 'mdi-lock',
    title: 'Password & Security',
    component: PasswordAndSecuritySettings,
  },
  // {
  //   icon: "mdi-bell-ring-outline", // Added Icon
  //   title: "Notification Settings", // Added Title
  //   component: NotificationSettings, // Added Component
  // },
]

const activeTab = ref(0)
</script>

<style lang="scss" scoped>
.settings-list {
  .v-list-item {
    margin-bottom: 8px;
    transition: all 0.3s ease;
    border-radius: 8px;

    &--active {
      background-color: rgb(var(--v-theme-primary));
      color: white;

      .v-list-item-title {
        font-weight: 500;
      }

      .v-icon {
        color: white;
      }
    }

    &:hover:not(.v-list-item--active) {
      background-color: rgba(var(--v-theme-primary), 0.1);
      color: rgb(var(--v-theme-primary));
    }
  }
}
</style>
