<template>
  <div class="drawer-content">
    <div class="drawer-scrollable" :class="{ 'mini-drawer': isMiniVariant }">
      <UserProfileButton v-if="isLoggedIn" />

      <v-list class="navigation-list px-3" nav density="comfortable">
        <v-list-item
          v-for="item in mainMenu"
          :key="item.title"
          :to="item.to"
          :value="item.title"
          rounded="lg"
          class="nav-item"
          :class="{
            'active-route': isActiveRoute(item.to),
            'mini-item': isMiniVariant,
          }"
        >
          <template #prepend>
            <div class="icon-wrapper">
              <component
                :is="item.icon"
                :size="isMiniVariant ? 20 : 24"
                :style="{ color: item.color }"
              />
            </div>
          </template>
          <v-list-item-title class="nav-text" :item-title="item.title">{{
            item.title
          }}</v-list-item-title>

          <v-tooltip
            v-if="isMiniVariant"
            activator="parent"
            location="right"
            :open-delay="200"
          >
            {{ item.title }}
          </v-tooltip>
        </v-list-item>
      </v-list>

      <v-divider
        class="my-3"
        :class="{ 'mx-2': isMiniVariant, 'mx-4': !isMiniVariant }"
      ></v-divider>

      <v-list class="navigation-list px-3" nav density="comfortable">
        <template v-if="bottomMenu.length > 0">
          <v-list-item
            v-for="item in bottomMenu"
            :key="item.title"
            :to="item.to"
            :value="item.title"
            rounded="lg"
            class="nav-item"
            :class="{
              'active-route': isActiveRoute(item.to),
              'mini-item': isMiniVariant,
            }"
          >
            <template #prepend>
              <div class="icon-wrapper">
                <component
                  :is="item.icon"
                  :size="isMiniVariant ? 20 : 24"
                  :style="{ color: item.color }"
                />
              </div>
            </template>
            <v-list-item-title class="nav-text" :item-title="item.title">{{
              item.title
            }}</v-list-item-title>

            <v-tooltip
              v-if="isMiniVariant"
              activator="parent"
              location="right"
              :open-delay="200"
            >
              {{ item.title }}
            </v-tooltip>
          </v-list-item>
        </template>
      </v-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import { useCustomizerStore } from '@/stores/customizer'

const authStore = useAuthStore()
const route = useRoute()
const customizer = useCustomizerStore()

// SSR-safe mobile detection
const isMobile = ref(false)

onMounted(() => {
  if (process.client) {
    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 960
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
  }
})

const isLoggedIn = computed(() => {
  try {
    return !!authStore.isLoggedIn
  } catch (e) {
    return false
  }
})
const isMiniVariant = computed(() => customizer.mini_sidebar && !isMobile.value)

const props = defineProps({
  mainMenu: { type: Array, required: true },
  bottomMenu: { type: Array, required: true },
})

const isActiveRoute = (path: string) => {
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<style lang="scss" scoped>
.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-scrollable {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    transition: opacity 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
}

.navigation-list {
  .nav-item {
    height: 44px;
    padding: 0 12px;
    margin-bottom: 2px;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    &.active-route {
      background-color: #e5e5e5;
      .nav-text {
        font-weight: 500;
      }
    }

    &.mini-item {
      padding: 0 8px;
      justify-content: center;

      .icon-wrapper {
        margin-right: 0;
      }

      .nav-text {
        display: none;
      }
    }

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      margin-right: 24px;
      transition: margin 0.3s ease;
    }

    .nav-text {
      font-size: 14px;
      font-weight: 400;
      color: #0f0f0f;
      transition: opacity 0.3s ease;
    }
  }
}

.version-info {
  text-align: center;
  opacity: 0.7;
  font-size: 12px;
  margin-top: auto;
  padding-bottom: env(safe-area-inset-bottom) !important;
}

.mini-item {
  .version-info {
    display: none;
  }
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .navigation-list {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

.nav-item {
  &:hover {
    .icon-wrapper {
      transform: scale(1.1);
      transition: transform 0.2s ease;
    }
  }
}

/* Dark mode specific styles */
:deep(.v-theme--dark) {
  .drawer-scrollable {
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent; /* For Firefox */

    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }

  .nav-item {
    &:hover {
      background-color: rgba(255, 255, 255, 0.04);
    }

    &.active-route {
      background-color: #333;
    }

    .nav-text {
      color: #f0f0f0;
    }
  }
}

/* Medium and small screen adjustments */
@media (max-width: 960px) {
  .navigation-list .nav-item {
    height: 48px;

    .icon-wrapper {
      margin-right: 16px;
    }
  }

  /* Ensure touch targets are larger on mobile */
  .drawer-scrollable {
    padding-bottom: 20px; /* Extra space at bottom for scrolling */
  }
}
</style>
