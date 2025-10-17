// types/navigationMenu/menu.ts
import { Component } from 'vue'

export interface Menu {
  // Existing properties
  header?: string
  title?: string
  icon?: Component
  to?: string
  chip?: string
  chipBgColor?: string
  chipColor?: string
  chipVariant?: string
  chipIcon?: string
  children?: Menu[]
  disabled?: boolean
  type?: 'regular' | 'page' | 'divider' | 'section' | string
  subCaption?: string
  color?: string
  requiresTalent?: boolean
  hideIfTalent?: boolean
  visibilityCheck?: () => boolean

  // New properties for pages
  avatar?: string
  subtitle?: string
  slug?: string
  pageType?: string
}

// Additional types for better type safety
export type MenuType = 'regular' | 'page' | 'divider' | 'section' | string

export interface PageMenuItem extends Menu {
  type: 'page'
  avatar?: string
  subtitle?: string
  slug: string
  pageType: string
}

export interface DividerMenuItem extends Menu {
  type: 'divider' | 'section'
  title: string
}

export interface RegularMenuItem extends Menu {
  type?: 'regular'
  icon: Component
  title: string
}

// Type guard functions
export const isPageMenuItem = (item: Menu): item is PageMenuItem => {
  return item.type === 'page'
}

export const isDividerMenuItem = (item: Menu): item is DividerMenuItem => {
  return item.type === 'divider' || item.type === 'section'
}

export const isRegularMenuItem = (item: Menu): item is RegularMenuItem => {
  return !item.type || item.type === 'regular'
}
