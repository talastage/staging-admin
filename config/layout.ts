// config/layout.ts
import { PAGE_WIDTHS } from '~/constants/layouts'
import type { LayoutConfig } from '~/types/layout'

export const layoutConfigs = {
  full: {
    contentWidth: PAGE_WIDTHS.FULL,
    layoutOptions: {
      showDrawer: true,
      showCategories: true,
    },
  } as LayoutConfig,

  narrow: {
    contentWidth: PAGE_WIDTHS.NARROW,
    layoutOptions: {
      showDrawer: false,
      showCategories: false,
    },
  } as LayoutConfig,

  default: {
    contentWidth: PAGE_WIDTHS.DEFAULT,
    layoutOptions: {
      showDrawer: true,
      showCategories: false,
    },
  } as LayoutConfig,

  narrowWithDrawer: {
    contentWidth: PAGE_WIDTHS.NARROW,
    layoutOptions: {
      showDrawer: true, // Drawer is shown
      showCategories: false, // Categories remain hidden
    },
  } as LayoutConfig,
} as const
