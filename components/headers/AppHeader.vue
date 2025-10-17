<!-- components/headers/AppHeader.vue -->
<template>
  <v-app-bar
    elevation="10"
    height="70"
    class="app-header px-4"
    :class="{
      'video-layout': isVideoLayout,
      'header-hidden': !isVisible,
      'search-expanded': hasExpandedSearch,
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
    <div
      class="header-center"
      :class="{ 'search-hidden': hasExpandedSearch && isMobile }"
    >
      <SearchBar
        v-if="!isMobile || !authStore.isLoggedIn"
        @search-expanded="handleSearchExpanded"
      />
    </div>

    <!-- Right Section -->
    <div
      class="header-right d-flex align-center"
      :class="{ 'actions-hidden': hasExpandedSearch && isMobile }"
    >
      <!-- Mobile Search Button (Only when authenticated) -->
      <div
        v-if="isMobile && authStore.isLoggedIn"
        class="mobile-search-container"
      >
        <SearchBar @search-expanded="handleSearchExpanded" />
      </div>

      <!-- Authenticated User Actions -->
      <template v-if="authStore.isLoggedIn">
        <PremieringButton class="premiering-btn mr-2" />
        <NotificationBell class="mr-2" />
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
            @click="handleLoginClick"
          >
            <v-icon start>mdi-login</v-icon>
            Login
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="register-btn"
            height="36"
            @click="handleRegisterClick"
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
import { useCustomizerStore } from '@/stores/customizer'
import { useAuthStore } from '@/stores/auth'
import { useCookie } from '#imports'

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
const tokenFromCookie = !process.client ? useCookie<string | null>('auth_token').value : null

// SSR-safe display detection
const isMobile = ref(false)
const isSmall = ref(false)

// Initialize display detection on client
onMounted(() => {
  if (process.client) {
    // Use window.innerWidth for SSR-safe mobile detection
    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 960
      isSmall.value = window.innerWidth <= 600
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      if (process.client) {
        window.removeEventListener('resize', checkMobile)
      }
    }
  }
})

// Reactive refs
const isVisible = ref(true)
const hasExpandedSearch = ref(false)
let lastScrollPosition = 0

const menuIcon = computed(() => {
  if (props.isVideoLayout) {
    return props.isMinimized ? 'mdi-menu' : 'mdi-menu-open'
  }
  return props.isMinimized ? 'mdi-menu-open' : 'mdi-menu'
})

// Methods
const handleScroll = () => {
  if (!process.client) return
  const currentScrollPosition = window.scrollY

  // Show header when scrolling up or at top
  isVisible.value =
    currentScrollPosition < lastScrollPosition || currentScrollPosition < 70 // header height

  lastScrollPosition = currentScrollPosition
}

const handleSidebarToggle = () => {
  emit('toggle-sidebar')
}

const handleMobileMenu = () => {
  if (props.isVideoLayout) {
    emit('toggle-sidebar')
  } else {
    // Simple toggle for mobile drawer
    if (process.client) {
      // Use the store method directly
      (customizer as any).SET_SIDEBAR_DRAWER()
    }
  }
}

const handleSearchExpanded = (expanded: boolean) => {
  hasExpandedSearch.value = expanded
}

const handleLoginClick = async () => {
  if (process.client) {
    console.log('Login button clicked')
    try {
      await navigateTo('/login')
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback to window.location
      window.location.href = '/login'
    }
  }
}

const handleRegisterClick = async () => {
  if (process.client) {
    console.log('Register button clicked')
    try {
      await navigateTo('/register')
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback to window.location
      window.location.href = '/register'
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  if (process.client) {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('scroll', handleScroll)
  }
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

  &.search-expanded {
    @media (max-width: 599px) {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
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
    min-width: 100px;
    margin-right: 8px;

    @media (max-width: 599px) {
      min-width: 80px;
      margin-right: 4px;
    }

    .search-expanded & {
      @media (max-width: 599px) {
        display: none !important;
      }
    }
  }

  // Center section (Search)
  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    max-width: 700px;
    margin: 0 8px;
    min-width: 0; // Important for flex layout

    &.search-hidden {
      opacity: 0;
      pointer-events: none;
    }

    @media (max-width: 959px) {
      justify-content: flex-start;
    }

    @media (max-width: 599px) {
      margin: 0 2px;
      max-width: unset;
      flex: 0 1 auto; // Allow shrinking on small screens
    }
  }

  // Right section
  .header-right {
    flex: 0 0 auto;
    min-width: 150px;
    justify-content: flex-end;
    gap: 12px;

    &.actions-hidden {
      opacity: 0;
      pointer-events: none;
    }

    .mobile-search-container {
      flex: 0 0 auto;
      margin-right: 8px;
    }

    @media (max-width: 959px) {
      gap: 8px;
      min-width: auto;
    }

    @media (max-width: 599px) {
      gap: 4px;
      flex: 0 0 auto;
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
          font-size: 0.75rem;
          padding: 0 12px;
          min-width: auto;

          .v-icon {
            margin-right: 2px;
            font-size: 16px;
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

// Ensure ProfileMenu is always visible
.header-right {
  .premiering-btn {
    @media (max-width: 599px) {
      margin-right: 4px !important;
    }
  }
}

// Improve spacing on small screens
@media (max-width: 599px) {
  .app-header:not(.search-expanded) {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}
</style>
