// stores/customizer.ts
import { defineStore } from 'pinia'

// Define types for layout settings
interface LayoutSettings {
  Sidebar_drawer: boolean
  mini_sidebar: boolean
  Customizer_drawer: boolean
  setHorizontalLayout: boolean
  setRTLLayout: boolean
  actTheme: 'light' | 'dark'
  boxed: boolean
  setBorderCard: boolean
  isVideoLayout: boolean
  contentWidth: number
  previousLayoutState?: {
    mini_sidebar: boolean
    Sidebar_drawer: boolean
  }
}

// Define types for customizer actions
interface CustomizerActions {
  SET_SIDEBAR_DRAWER(value?: boolean): void
  SET_MINI_SIDEBAR(value: boolean): void
  SET_CUSTOMIZER_DRAWER(value: boolean): void
  SET_LAYOUT(value: boolean): void
  SET_THEME(value: 'light' | 'dark'): void
  SET_CARD_BORDER(value: boolean): void
  SET_BOXED_LAYOUT(value: boolean): void
  SET_VIDEO_LAYOUT(value: boolean): void
  TOGGLE_VIDEO_SIDEBAR(): void
  RESET_LAYOUT(): void
  HANDLE_MOBILE_DRAWER(value?: boolean): void
  INIT_LAYOUT(): void
}

// Helper: read persisted theme preference (module scope, server-safe)
function loadThemePreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  const savedTheme = localStorage.getItem('theme-preference') as
    | 'light'
    | 'dark'
    | null
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export const useCustomizerStore = defineStore({
  id: 'customizer',

  state: (): LayoutSettings => ({
    Sidebar_drawer: false,
    mini_sidebar: false,
    Customizer_drawer: false,
    setHorizontalLayout: false,
    setRTLLayout: false,
    actTheme: 'light',
    boxed: false,
    setBorderCard: false,
    isVideoLayout: false,
    contentWidth: 1280, // Default content width
    previousLayoutState: undefined,
  }),

  getters: {
    isMinimized: (state: LayoutSettings): boolean => {
      return state.isVideoLayout ? state.mini_sidebar : false
    },

    currentTheme: (state: LayoutSettings): string => {
      return state.actTheme
    },

    isMobileDrawerOpen: (state: LayoutSettings): boolean => {
      return state.Sidebar_drawer
    },

    isBoxedLayout: (state: LayoutSettings): boolean => {
      return state.boxed
    },

    getContentWidth: (state: LayoutSettings): number | undefined => {
      return state.boxed ? state.contentWidth : undefined
    },
  },

  actions: {
    SET_SIDEBAR_DRAWER(value?: boolean) {
      ;(this as any).Sidebar_drawer = value ?? !(this as any).Sidebar_drawer
    },

    SET_MINI_SIDEBAR(value: boolean) {
      ;(this as any).mini_sidebar = value
    },

    SET_CUSTOMIZER_DRAWER(value: boolean) {
      ;(this as any).Customizer_drawer = value
    },

    SET_LAYOUT(value: boolean) {
      ;(this as any).setHorizontalLayout = value
      if (value) {
        ;(this as any).boxed = false // Disable boxed layout when horizontal layout is enabled
      }
    },

    SET_THEME(value: 'light' | 'dark') {
      ;(this as any).actTheme = value
      if (process.client) {
        localStorage.setItem('theme-preference', value)
      }
    },

    SET_CARD_BORDER(value: boolean) {
      ;(this as any).setBorderCard = value
    },

    SET_BOXED_LAYOUT(value: boolean) {
      ;(this as any).boxed = value
      // Reset incompatible settings when entering boxed layout
      if (value) {
        ;(this as any).setHorizontalLayout = false
        ;(this as any).isVideoLayout = false
      }
    },

    SET_VIDEO_LAYOUT(value: boolean) {
      if (value && !(this as any).isVideoLayout) {
        // Entering video layout
        ;(this as any).previousLayoutState = {
          mini_sidebar: (this as any).mini_sidebar,
          Sidebar_drawer: (this as any).Sidebar_drawer,
        }
        ;(this as any).mini_sidebar = true
        ;(this as any).Sidebar_drawer = false
        ;(this as any).boxed = false // if you want to disable the 'boxed' layout in video mode
      } else if (!value && (this as any).isVideoLayout && (this as any).previousLayoutState) {
        // Leaving video layout
        ;(this as any).mini_sidebar = (this as any).previousLayoutState.mini_sidebar
        ;(this as any).Sidebar_drawer = (this as any).previousLayoutState.Sidebar_drawer
        ;(this as any).previousLayoutState = undefined
      }

      ;(this as any).isVideoLayout = value
    },

    TOGGLE_VIDEO_SIDEBAR() {
      if ((this as any).isVideoLayout) {
        ;(this as any).mini_sidebar = !(this as any).mini_sidebar
        if ((this as any).Sidebar_drawer) {
          ;(this as any).Sidebar_drawer = false
        }
      }
    },

    RESET_LAYOUT() {
      ;(this as any).Sidebar_drawer = false
      ;(this as any).mini_sidebar = false
      ;(this as any).Customizer_drawer = false
      ;(this as any).setHorizontalLayout = false
      ;(this as any).setRTLLayout = false
      ;(this as any).boxed = false
      ;(this as any).setBorderCard = false
      ;(this as any).isVideoLayout = false
      ;(this as any).contentWidth = 1280
      ;(this as any).previousLayoutState = undefined
    },

    HANDLE_MOBILE_DRAWER(value?: boolean) {
      if (!process.client) {
        ;(this as any).SET_SIDEBAR_DRAWER(value)
        return
      }
      
      const isDesktop = window.innerWidth > 960

      if ((this as any).isVideoLayout && isDesktop) {
        ;(this as any).TOGGLE_VIDEO_SIDEBAR()
      } else {
        ;(this as any).SET_SIDEBAR_DRAWER(value)
      }
    },

    INIT_LAYOUT() {
      if (!process.client) return
      
      // Load theme preference
      ;(this as any).actTheme = loadThemePreference()

      // Initialize boxed layout if needed
      if (this.boxed) {
        this.Sidebar_drawer = false
        this.mini_sidebar = false
        this.setHorizontalLayout = false
      }

      // Handle initial responsive state
      ;(this as any).handleInitialResponsiveState()
    },

    handleInitialResponsiveState() {
      if (!process.client) return
      
      const isMobile = window.innerWidth <= 960
      if (isMobile) {
        ;(this as any).Sidebar_drawer = false
        ;(this as any).mini_sidebar = false
      }
    },
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'customizer-settings',
        // localStorage is only available on client. Use a guarded accessor.
        storage: process.client ? localStorage : undefined,
        paths: [
          'actTheme',
          'boxed',
          'setBorderCard',
          'setHorizontalLayout',
          'setRTLLayout',
          'contentWidth',
        ],
      },
    ],
  },
})

// Type safety for component usage
export type CustomizerStore = ReturnType<typeof useCustomizerStore>
