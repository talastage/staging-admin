<!-- components/shared/SupportButton.vue -->
<template>
  <div class="support-button-wrapper">
    <v-btn
      :color="isOpen ? 'grey-lighten-3' : 'primary'"
      @click="handleSupportClick"
      class="support-fab"
      icon="mdi-message-question"
      size="large"
      elevation="4"
    >
    </v-btn>

    <v-card
      v-show="isOpen"
      class="support-dialog-card"
      elevation="8"
      :class="{ 'dialog-minimized': isMinimized }"
    >
      <!-- Header -->
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <div>
          <div class="text-h6">Need support?</div>
          <div class="text-subtitle-2">How can we help?</div>
        </div>
        <div class="d-flex align-center">
          <v-btn
            icon="mdi-minus"
            variant="text"
            density="comfortable"
            size="small"
            @click="toggleMinimize"
            class="mr-2"
          ></v-btn>
          <v-btn
            icon="mdi-close"
            variant="text"
            density="comfortable"
            size="small"
            @click="isOpen = false"
          ></v-btn>
        </div>
      </v-card-title>

      <!-- Content Area -->
      <div v-show="!isMinimized" class="support-dialog-body">
        <v-card-text class="pa-0 support-content">
          <v-window v-model="activeTab" class="fill-height">
            <v-window-item value="home">
              <support-home-tab @update:active-tab="activeTab = $event" />
            </v-window-item>

            <v-window-item value="messages">
              <support-messages-tab
                @message-sent="handleMessageSent"
                :loading="loading"
              />
            </v-window-item>
          </v-window>
        </v-card-text>

        <!-- Fixed Footer Navigation -->
        <div class="footer-container">
          <div class="custom-tabs">
            <div
              class="tab-item"
              :class="{ active: activeTab === 'home' }"
              @click="activeTab = 'home'"
            >
              <v-icon class="tab-icon">mdi-home</v-icon>
              <span class="tab-text">Home</span>
            </div>
            <div
              class="tab-item"
              :class="{ active: activeTab === 'messages' }"
              @click="activeTab = 'messages'"
            >
              <v-icon class="tab-icon">mdi-message</v-icon>
              <span class="tab-text">Messages</span>
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="5000"
      location="top"
    >
      {{ successMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLoginDialogStore } from '@/stores/loginDialog'

const isOpen = ref(false)
const isMinimized = ref(false)
const activeTab = ref('home')
const loading = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')

const authStore = useAuthStore()
const loginDialogStore = useLoginDialogStore()

const handleSupportClick = () => {
  if (!authStore.isLoggedIn) {
    loginDialogStore.setRequestedRoute(window.location.pathname)
    loginDialogStore.show()
    return
  }
  if (isMinimized.value) {
    isMinimized.value = false
  } else {
    isOpen.value = !isOpen.value
  }
}

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
}

const handleMessageSent = () => {
  showSuccess.value = true
  successMessage.value =
    'Your message has been sent successfully. We will respond within 24 hours.'
  activeTab.value = 'home'
}
</script>

<style scoped>
.support-button-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
}

.support-fab {
  border-radius: 50%;
}

/* Chat-style dialog positioning */
.support-dialog-card {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 360px;
  height: 600px;
  max-height: calc(100vh - 120px);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

/* Minimized state */
.dialog-minimized {
  height: auto !important;
}

/* Structured layout for the content area */
.support-dialog-body {
  display: flex;
  flex-direction: column;
  height: calc(100% - 76px); /* Total height - header height */
}

/* Content area */
.support-content {
  flex: 1;
  overflow-y: auto;
  margin-bottom: auto;
}

/* Footer container - fixes the footer at the bottom */
.footer-container {
  width: 100%;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

/* Custom tabs navigation */
.custom-tabs {
  display: flex;
  width: 100%;
  height: 56px;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px 0;
  transition: background-color 0.2s;
}

.tab-icon {
  margin-bottom: 2px;
}

.tab-text {
  font-size: 12px;
}

.tab-item.active {
  background-color: rgb(214, 232, 249);
  color: #1976d2;
}

.tab-item:not(.active) {
  background-color: white;
  color: rgba(0, 0, 0, 0.87);
}

/* Media queries for responsive design */
@media (max-width: 600px) {
  .support-dialog-card {
    width: calc(100vw - 40px);
    height: calc(100vh - 120px);
    bottom: 80px;
  }
}

/* Animation classes */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Transition for minimize/maximize */
.support-dialog-card {
  transition: height 0.3s ease;
}
</style>
