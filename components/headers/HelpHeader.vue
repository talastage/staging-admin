<!-- components/AppHeader.vue -->
<template>
  <v-app-bar
    elevation="1"
    height="70"
    class="app-header px-4"
    :class="{
      'video-layout': isVideoLayout,
      'header-hidden': !isVisible,
    }"
  >
    <!-- Left Section -->
    <div class="header-left d-flex align-center">
      <!-- Mobile Menu Button -->
      <v-btn
        v-if="isMobile"
        icon
        variant="text"
        @click.stop="handleMobileMenu"
        class="mobile-menu-btn"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <!-- Desktop Sidebar Toggle -->
      <v-btn
        v-else
        icon
        variant="text"
        class="sidebar-toggle"
        @click.stop="handleSidebarToggle"
      >
        <v-icon>{{ menuIcon }}</v-icon>
      </v-btn>

      <!-- Logo -->
      <AppLogo
        class="ml-2"
        :width="40"
        :height="40"
        :class="{ 'mini-logo': !isMobile && isMinimized }"
      />
    </div>

    <!-- Center Section (Search) -->
    <div class="header-center">
      <HelpSearchBar />
    </div>

    <!-- Right Section -->
    <div class="header-right d-flex align-center">
      <!-- Authenticated User Actions -->
      <template v-if="authStore.isLoggedIn">
        <PremieringButton />
        <NotificationBell />
        <ProfileMenu />
      </template>

      <!-- Unauthenticated User Actions -->
      <template v-else>
        <div class="auth-buttons d-flex align-center gap-3">
          <v-btn
            color="primary"
            variant="outlined"
            class="login-btn"
            height="36"
            @click="onLoginClick"
          >
            <v-icon start>mdi-login</v-icon>
            <span class="hidden-sm-and-down">Login</span>
          </v-btn>
          <v-btn
            v-if="$vuetify.display.mdAndUp"
            color="primary"
            variant="elevated"
            class="register-btn"
            height="36"
            to="/register"
          >
            <v-icon start>mdi-account-plus</v-icon>
            Register
          </v-btn>
        </div>
      </template>
    </div>
  </v-app-bar>

  <LoginDialog />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useCustomizerStore } from '@/stores/customizer'
import { useAuthStore } from '@/stores/auth'
import { useLoginDialogStore } from '@/stores/loginDialog'

// Define props
interface Props {
  isVideoLayout?: boolean
  isMinimized?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isVideoLayout: false,
  isMinimized: false,
})

// Define emits
const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

// Store instances
const customizer = useCustomizerStore()
const authStore = useAuthStore()
const loginDialogStore = useLoginDialogStore()
const { mobile, mdAndDown } = useDisplay()

// Reactive refs
const isVisible = ref(true)
let lastScrollPosition = 0

// Computed properties
const isMobile = computed(() => mobile.value)

const menuIcon = computed(() => {
  if (props.isVideoLayout) {
    return props.isMinimized ? 'mdi-menu' : 'mdi-menu-open'
  }
  return customizer.mini_sidebar ? 'mdi-menu-open' : 'mdi-menu'
})

// Methods
const handleScroll = () => {
  const currentScrollPosition = window.scrollY

  // Show header when scrolling up or at top
  isVisible.value =
    currentScrollPosition < lastScrollPosition || currentScrollPosition < 70 // header height

  lastScrollPosition = currentScrollPosition
}

const handleSidebarToggle = () => {
  if (props.isVideoLayout) {
    emit('toggle-sidebar')
  } else {
    customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)
  }
}

const handleMobileMenu = () => {
  if (props.isVideoLayout) {
    emit('toggle-sidebar')
  } else {
    customizer.HANDLE_MOBILE_DRAWER()
  }
}

const toggleTheme = () => {
  customizer.SET_THEME(customizer.actTheme === 'light' ? 'dark' : 'light')
}

const onLoginClick = () => {
  loginDialogStore.show()
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
.app-header {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 1000;
  transition: transform 0.3s ease;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background-color: rgb(var(--v-theme-background)) !important;
  backdrop-filter: blur(10px);

  &.header-hidden {
    transform: translateY(-100%);
  }

  :deep(.v-toolbar__content) {
    padding: 0;
    height: 70px !important;
    display: flex;
    justify-content: space-between;
  }

  // Left section
  .header-left {
    flex: 0 0 auto;
    min-width: 120px;
    margin-right: 16px;

    @media (max-width: 599px) {
      min-width: 100px;
      margin-right: 8px;
    }
  }

  // Center section (Search)
  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    max-width: 800px;
    margin: 0 16px;
    min-width: 0; // Important for flex layout

    @media (max-width: 959px) {
      margin: 0 8px;
      justify-content: flex-start;
    }

    @media (max-width: 599px) {
      margin: 0 4px;
      max-width: unset;
    }
  }

  // Right section
  .header-right {
    flex: 0 0 auto;
    min-width: 180px;
    justify-content: flex-end;
    gap: 12px;

    @media (max-width: 959px) {
      min-width: 150px;
      gap: 8px;
    }

    @media (max-width: 599px) {
      min-width: 120px;
      gap: 4px;
    }

    .auth-buttons {
      .login-btn,
      .register-btn {
        letter-spacing: 0.0178571429em;
        font-size: 0.875rem;
        font-weight: 500;

        .v-icon {
          margin-right: 4px;
        }

        @media (max-width: 599px) {
          min-width: 40px;
          padding: 0 8px;

          .v-icon {
            margin-right: 0;
          }
        }
      }
    }
  }
}

// Handle content padding
:deep(.v-main) {
  padding-top: 70px !important;
}

// Utility classes
.gap-3 {
  gap: 12px;

  @media (max-width: 599px) {
    gap: 8px;
  }
}

// Transitions
.mobile-menu-btn,
.sidebar-toggle {
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
}
</style>
