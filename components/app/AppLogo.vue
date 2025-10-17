<template>
  <div
    :class="[
      'app-logo',
      `app-logo--${size}`,
      `app-logo--${layout}`,
      { 'app-logo--clickable': clickable },
    ]"
    :style="containerCustomProps"
    @click="handleClick"
  >
    <div class="logo-container">
      <!-- Skeleton loader -->
      <v-skeleton-loader
        v-if="isLoading"
        :type="skeletonType"
        :width="dimensions.width"
        :height="dimensions.height"
      />

      <!-- Error state -->
      <v-icon
        v-else-if="hasError"
        :size="dimensions.iconSize"
        :color="errorColor"
      >
        mdi-alert-circle
      </v-icon>

      <!-- Logo image -->
      <template v-else>
        <v-img
          v-if="logoUrl"
          :src="logoUrl"
          :width="dimensions.width"
          :height="dimensions.height"
          :alt="appName"
          :class="imageClasses"
          cover
          :eager="eager"
          @error="handleImageError"
        >
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate color="primary" size="20" />
            </v-row>
          </template>
        </v-img>

        <!-- Fallback text logo -->
        <div v-else class="text-logo" :style="textLogoStyles">
          {{ appName?.charAt(0) || 'A' }}
        </div>
      </template>

      <!-- Optional text -->
      <div
        v-if="showText && appName && !isMobile"
        :class="[
          'logo-text',
          `text-${textAlign}`,
          { 'mt-2': layout === 'vertical' },
        ]"
      >
        <h1 v-if="isHeading" :class="textClasses">{{ appName }}</h1>
        <span v-else :class="textClasses">{{ appName }}</span>
        <small v-if="showSlogan && appSlogan" class="slogan">
          {{ appSlogan }}
        </small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppsStore } from '~/stores/useApps'
import { useDisplay } from 'vuetify'

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'
  layout?: 'horizontal' | 'vertical' | 'icon'
  customSize?: number
  showText?: boolean
  showSlogan?: boolean
  clickable?: boolean
  isHeading?: boolean
  textAlign?: 'left' | 'center' | 'right'
  eager?: boolean
  errorColor?: string
  darkMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  layout: 'horizontal',
  customSize: 0,
  showText: true,
  showSlogan: false,
  clickable: true,
  isHeading: false,
  textAlign: 'left',
  eager: false,
  errorColor: 'error',
  darkMode: false,
})

// Store and router
const appsStore = useAppsStore()
const router = useRouter()
const { mobile, smAndDown } = useDisplay()

// Local state
const hasError = ref(false)

// Computed properties
const isLoading = computed(() => appsStore.loading)
const appName = computed(() => appsStore.talastageApp?.name)
const appSlogan = computed(() => appsStore.talastageApp?.slogan)
const isMobile = computed(() => mobile.value)

const logoUrl = computed(() => {
  return '/talastage_logo.png'
})

const dimensions = computed(() => {
  const sizes = {
    xs: { width: 16, height: 16, iconSize: 14 },
    sm: { width: 20, height: 20, iconSize: 18 },
    md: { width: 28, height: 28, iconSize: 24 },
    lg: { width: 36, height: 36, iconSize: 32 },
    xl: { width: 48, height: 48, iconSize: 40 },
    custom: {
      width: props.customSize,
      height: props.customSize,
      iconSize: props.customSize * 0.75,
    },
  }
  
  // Adjust size for mobile if needed
  if (isMobile.value && props.size === 'md') {
    return { width: 24, height: 24, iconSize: 20 }
  }
  
  return sizes[props.size]
})

const containerCustomProps = computed(() => ({
  '--logo-gap': props.layout === 'vertical' ? '0.5rem' : '1rem',
  '--logo-direction': props.layout === 'vertical' ? 'column' : 'row',
  '--logo-alignment': props.layout === 'icon' ? 'center' : 'flex-start',
}))

const textLogoStyles = computed(() => ({
  width: `${dimensions.value.width}px`,
  height: `${dimensions.value.height}px`,
  fontSize: `${dimensions.value.iconSize * 0.6}px`,
  backgroundColor: 'var(--v-primary-base)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  fontWeight: 'bold',
}))

const imageClasses = computed(() => [
  'logo-image',
  { rounded: props.layout === 'icon' },
])

const textClasses = computed(() => [
  'logo-title',
  `text-${props.size}`,
  { 'text-primary': !props.darkMode },
])

const skeletonType = computed(() =>
  props.layout === 'icon' ? 'avatar' : 'image'
)

// Methods
const handleClick = () => {
  if (props.clickable) {
    router.push('/')
  }
}

const handleImageError = () => {
  hasError.value = true
}

// Lifecycle
onMounted(async () => {
  if (!appsStore.talastageApp) {
    await appsStore.fetchTalaStageApp()
  }
})
</script>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
}

.app-logo--clickable {
  cursor: pointer;
}

.app-logo--clickable:hover {
  opacity: 0.8;
}

.logo-container {
  display: flex;
  flex-direction: var(--logo-direction, row);
  align-items: center;
  justify-content: var(--logo-alignment, flex-start);
  gap: var(--logo-gap, 1rem);
  width: 100%;
}

.logo-image {
  object-fit: contain;
  transition: transform 0.3s ease;
}

.logo-image.rounded {
  border-radius: 8px;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  margin: 0;
  font-weight: 600;
  line-height: 1.2;
}

.slogan {
  color: var(--v-secondary-base);
  font-size: 0.8em;
  margin-top: 0.2em;
}

/* Size variants */
.text-xs {
  font-size: 0.875rem;
}
.text-sm {
  font-size: 1rem;
}
.text-md {
  font-size: 1.25rem;
}
.text-lg {
  font-size: 1.5rem;
}
.text-xl {
  font-size: 2rem;
}

/* Layout specific styles */
.app-logo--vertical .logo-text {
  text-align: center;
  width: 100%;
}

.app-logo--icon .logo-text {
  display: none;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .app-logo--lg,
  .app-logo--xl {
    scale: 0.8;
  }

  .logo-text {
    font-size: 0.9em;
  }
  
  .app-logo {
    margin-right: 0;
  }
}

/* Ensure logo is properly sized on small screens */
@media (max-width: 480px) {
  .logo-container {
    gap: 0.5rem;
  }
}
</style>