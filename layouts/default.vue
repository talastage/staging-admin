<!-- layouts/default.vue -->
<template>
  <!-- Render layout on server. Only wrap client-only interactive pieces with ClientOnly. -->
  <v-locale-provider v-if="isClient">
    <v-app :theme="customizer.currentTheme">
      <ClientOnly>
        <AppHeader
          v-if="!customizer.setHorizontalLayout"
          :is-minimized="miniDrawerState"
          @toggle-sidebar="toggleSidebar"
        />

        <v-navigation-drawer
          v-if="showDrawer"
          v-model="drawerModel"
          :permanent="!isMobile"
          :temporary="isMobile"
          :rail="!isMobile && miniDrawerState"
          :rail-width="70"
          :width="280"
          class="app-drawer"
        >
          <AppDrawerLeft
            :mainMenu="menuItems"
            :bottomMenu="bottomMenuItems"
          />
        </v-navigation-drawer>
      </ClientOnly>

      <v-main :class="mainClasses">
        <div class="content-container">
          <NuxtPage />
        </div>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useCustomizerStore } from '@/stores/customizer'
import { useRoute } from 'vue-router'
import getHomeMenu from '@/components/navigation/menu/sidebar/homeMenu'
import getBottomMenu from '@/components/navigation/menu/sidebar/bottomMenu'
import type { Menu } from '~/types/navigationMenu/menu'

// Use looser typing to avoid TS errors during SSR compilation where some auto-import types
// may not be available. We'll keep runtime behavior intact.
const customizer = useCustomizerStore() as any
const route = useRoute() as any

// Use a ref for isMobile and only update it on the client.
// The server will render with the default (false), and the client will correct it.
const isMobile = ref(false)

// Expose whether we're running on client so template can conditionally render client-only wrappers
const isClient = ref(process.client)

const showDrawer = computed(() => {
  return (route.meta as any)?.layoutOptions?.showDrawer ?? true
})

const shouldUseMiniDrawer = computed(() => {
  return (route.meta as any)?.layoutOptions?.miniDrawer ?? false
})

const miniDrawerState = ref(false)

watch(
  [() => route.fullPath, shouldUseMiniDrawer, () => customizer.mini_sidebar],
  () => {
    if (showDrawer.value) {
      miniDrawerState.value = shouldUseMiniDrawer.value || customizer.mini_sidebar
    }
  },
  { immediate: true }
)

const drawerModel = computed({
  get: () => {
    if (isMobile.value) {
      return customizer.Sidebar_drawer
    }
    return showDrawer.value
  },
  set: (val) => {
    if (isMobile.value) {
      customizer.Sidebar_drawer = val
    }
  },
})

const mainClasses = computed(() => ({
  'main-layout': true,
  'main-layout--with-drawer': showDrawer.value && !isMobile.value,
  'main-layout--mini-drawer': miniDrawerState.value && !isMobile.value && showDrawer.value,
}))

const menuItems = ref<Menu[]>([])
const bottomMenuItems = ref<Menu[]>([])

const toggleSidebar = () => {
  if (isMobile.value) {
    customizer.Sidebar_drawer = !customizer.Sidebar_drawer
  } else {
    miniDrawerState.value = !miniDrawerState.value
    if (showDrawer.value) {
      customizer.SET_MINI_SIDEBAR(miniDrawerState.value)
    }
  }
}

onMounted(() => {
  // Set isClient to true after mount so server render remains unaffected
  isClient.value = true

  if (!process.client) return

  const { mobile } = useDisplay()
  watch(mobile, (value) => {
    isMobile.value = value
  }, { immediate: true })

  menuItems.value = getHomeMenu()
  bottomMenuItems.value = getBottomMenu()

  customizer.SET_BOXED_LAYOUT(true)
  customizer.INIT_LAYOUT()

  if (showDrawer.value) {
    miniDrawerState.value = shouldUseMiniDrawer.value || customizer.mini_sidebar
  }
})

</script>

<style lang="scss">
.layout-loading {
  min-height: 100vh;
  background-color: rgb(243, 244, 247);
  
  .content-container {
    padding-top: 20px;
  }
}

.main-layout {
  padding-top: 70px;
  background-color: rgb(243, 244, 247);
  transition: padding-left 0.3s ease;
  min-height: 100vh;

  &--with-drawer {
    @media (min-width: 960px) {
      padding-left: 280px;
    }
  }

  &--mini-drawer {
    @media (min-width: 960px) {
      padding-left: 70px;
    }
  }
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

.app-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  position: fixed !important;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  overflow: hidden;

  :deep(.v-navigation-drawer__content) {
    height: 100%;
    overflow: hidden;
    padding-top: 70px;
  }
}

@media (max-width: 959px) {
  .main-layout {
    padding-left: 0 !important;
  }
  
  .content-container {
    padding: 8px;
  }
}
</style>