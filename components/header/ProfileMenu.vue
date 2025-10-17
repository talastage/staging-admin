<template>
  <div class="text-center profile-menu-container">
    <v-menu
      v-model="menu"
      :close-on-content-click="true"
      offset-y
      transition="slide-y-transition"
      :eager="false"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          class="profile-btn"
          variant="plain"
          :ripple="false"
        >
          <div class="d-flex align-center avatar-container">
            <UserAvatar
              :username="user?.username"
              :profile_photo="user?.profile_photo"
              size="small"
              :disableLink="true"
            />
            <div class="arrow-overlay">
              <v-icon
                size="x-small"
                color="grey-darken-2"
                :class="{ 'rotate-icon': menu }"
              >
                mdi-chevron-down
              </v-icon>
            </div>
          </div>
        </v-btn>
      </template>

      <v-card min-width="300" class="mt-2" :elevation="2">
        <v-list density="compact">
          <v-list-item>
            <UserCard :user="user" size="small" layout="compact" />
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item
            v-for="item in profileMenu.children"
            :key="item.title"
            :to="item.to"
            link
            @click="menu = false"
            :value="item.title"
          >
            <template v-slot:prepend>
              <component
                :is="item.icon"
                size="20"
                class="mr-2"
                aria-hidden="true"
              />
            </template>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item>
            <LogoutButton @click="handleLogoutClick" :disabled="isLoggingOut" />
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

    <ConfirmLogoutDialog
      v-model="showConfirmDialog"
      :loading="isLoggingOut"
      @confirm="performLogout"
      @cancel="handleDialogCancel"
      :eager="false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { profileMenu } from '@/components/navigation/menu/profile'

const authStore = useAuthStore()
const router = useRouter()
const menu = ref(false)
const showConfirmDialog = ref(false)
const isLoggingOut = ref(false)

// SSR-safe display detection
const isMobile = ref(false)

onMounted(() => {
  if (process.client) {
    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 600
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
  }
})

const user = computed(() => authStore.user)

const handleLogoutClick = () => {
  menu.value = false
  showConfirmDialog.value = true
}

const handleDialogCancel = () => {
  showConfirmDialog.value = false
}

const performLogout = async () => {
  if (isLoggingOut.value) return

  isLoggingOut.value = true
  try {
    await authStore.logout()
    showConfirmDialog.value = false
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<style scoped>
.profile-menu-container {
  margin-left: auto; /* Ensures it stays at the right edge */
}

.profile-btn {
  height: auto !important;
  padding: 0 !important;
  min-width: 0 !important;
  transition: opacity 0.2s ease;
}

.profile-btn:hover {
  opacity: 0.85;
}

.avatar-container {
  position: relative;
  cursor: pointer;
}

.arrow-overlay {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background-color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.rotate-icon {
  transform: rotate(180deg);
}

/* Optimize performance with hardware acceleration */
.v-menu-transition-enter-active,
.v-menu-transition-leave-active {
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
}

/* Remove unused styles */
.profile-button {
  text-transform: none;
  display: flex;
  align-items: center;
  padding: 0;
}

.profile-button .mr-2 {
  margin-right: 8px;
}

:deep(.v-list-item--density-compact) {
  min-height: 40px;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .arrow-overlay {
    width: 16px;
    height: 16px;
    bottom: -1px;
    right: -1px;
  }
}
</style>