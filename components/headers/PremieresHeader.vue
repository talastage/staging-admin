<template>
  <div>
    <!-- Main Header Bar -->
    <v-app-bar
      app
      elevation="1"
      height="70"
      class="premieres-header"
      :class="{ 'header-hidden': !isVisible }"
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
        <SearchBar />
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

    <!-- SECOND BAR for Categories Carousel -->
    <!-- <v-app-bar
      app
      elevation="1"
      height="48"
      class="categories-bar"
      :class="{ 'header-hidden': !isVisible }"
    >
      <PremiereCategoriesChipCarousel
        :model-value="selectedCategory"
        @category-selected="handleCategorySelected"
      />
    </v-app-bar> -->

    <!-- If you have a login dialog -->
    <LoginDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useCustomizerStore } from '@/stores/customizer'
import { useAuthStore } from '@/stores/auth'
import { useLoginDialogStore } from '@/stores/loginDialog'

// Composables for categories
import { usePremieringCategories } from '~/composables/premiering/usePremieringCategories'
import { useRecommendedProjects } from '~/composables/useRecommendedProjects'
import type { PremieringCategoryBase } from '~/types/PremieringCategoryBase'

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
  (e: 'category-selected', category: PremieringCategoryBase | null): void
}>()

// Store instances
const customizer = useCustomizerStore()
const authStore = useAuthStore()
const loginDialogStore = useLoginDialogStore()
const { mobile } = useDisplay()

// Premiering categories
const { categories, fetchCategories } = usePremieringCategories()
const { selectedCategory } = useRecommendedProjects()

// Hide-on-scroll logic
const isVisible = ref(true)
let lastScrollPosition = 0

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  if (categories.value.length === 0) {
    await fetchCategories()
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  const currentScrollPosition = window.scrollY
  // Show bars if scrolling up or near top
  isVisible.value =
    currentScrollPosition < lastScrollPosition || currentScrollPosition < 70
  lastScrollPosition = currentScrollPosition
}

// Drawer toggles
const isMobile = computed(() => mobile.value)
function handleSidebarToggle() {
  if (props.isVideoLayout) {
    emit('toggle-sidebar')
  } else {
    customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)
  }
}
function handleMobileMenu() {
  if (props.isVideoLayout) {
    emit('toggle-sidebar')
  } else {
    customizer.HANDLE_MOBILE_DRAWER()
  }
}

// Theme + Auth
function toggleTheme() {
  customizer.SET_THEME(customizer.actTheme === 'light' ? 'dark' : 'light')
}
function onLoginClick() {
  loginDialogStore.show()
}

// Category selection
function handleCategorySelected(category: PremieringCategoryBase | null) {
  emit('category-selected', category)
}

// Icon for the sidebar toggle
const menuIcon = computed(() => {
  if (props.isVideoLayout) {
    return props.isMinimized ? 'mdi-menu' : 'mdi-menu-open'
  }
  return customizer.mini_sidebar ? 'mdi-menu-open' : 'mdi-menu'
})
</script>

<style scoped lang="scss">
.premieres-header,
.categories-bar {
  transition: transform 0.3s ease;
  z-index: 1000; /* Ensure bars are on top */
}

/* Hide both bars if isVisible is false */
.header-hidden {
  transform: translateY(-100%);
}

/* Example for the main bar */
.premieres-header {
  // Additional styling for your main bar
}

/* Example for the categories bar */
.categories-bar {
  // Additional styling for the categories row
  // e.g., background-color, border-bottom, etc.
}
</style>
