// composables/useLayout.ts
import { ref } from 'vue'
import type { LayoutConfig } from '~/types/layout'
import { layoutConfigs } from '~/config/layout'

export const useAppLayout = () => {
  const currentLayout = ref<LayoutConfig>(layoutConfigs.default)

  const setLayout = (layoutKey: keyof typeof layoutConfigs) => {
    currentLayout.value = layoutConfigs[layoutKey]
  }

  return {
    currentLayout,
    setLayout,
  }
}
