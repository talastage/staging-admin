<!-- components/page/PageAvatar.vue -->
<template>
  <div
    class="page-avatar-link"
    :class="{ disabled: disableLink }"
    @click="handleClick"
  >
    <div class="avatar-wrapper">
      <v-avatar :size="avatarSize" :rounded="roundedShape" :class="avatarClass">
        <nuxt-img
          v-if="avatarUrl"
          :key="avatarUrl"
          :src="avatarUrl"
          :alt="imageAlt"
          :width="avatarSize"
          :height="avatarSize"
          :placeholder="defaultAvatarUrl"
          loading="lazy"
          format="webp"
          fit="cover"
          @error="handleImageError"
        />
        <v-img
          v-else
          :key="'default'"
          :src="defaultAvatarUrl"
          :width="avatarSize"
          :height="avatarSize"
          cover
        />
      </v-avatar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

interface Page {
  id: number
  slug: string
  name: string
  avatar_url?: string | null // Made avatar_url optional and nullable
  type: string
}

type AvatarSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | number

interface Props {
  page: Page
  size?: AvatarSize
  avatarClass?: string
  disableLink?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  avatarClass: '',
  disableLink: false,
})

const router = useRouter()
const imageError = ref(false)

const defaultAvatarUrl = '/images/profile/default.png'

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80,
  '2xl': 120,
  '3xl': 160,
  '4xl': 200,
  '5xl': 240,
} as const

const avatarSize = computed(() => {
  if (typeof props.size === 'number') return props.size
  return sizeMap[props.size] ?? sizeMap.md
})

const roundedShape = '50%'

const imageAlt = computed(() => `${props.page.name} (${props.page.type})`)

const avatarUrl = computed(() => {
  if (imageError.value) return null
  // Handle null or undefined avatar_url
  return props.page?.avatar_url || null
})

function handleImageError() {
  imageError.value = true
}

function handleClick() {
  if (!props.disableLink) {
    router.push(`/profile/${props.page.type}/${props.page.slug}`)
  }
}
</script>

<style scoped>
.page-avatar-link {
  display: inline-block;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.page-avatar-link:hover:not(.disabled) {
  transform: scale(1.05);
}

.page-avatar-link.disabled {
  cursor: default;
  pointer-events: none;
}

.avatar-wrapper {
  text-align: center;
}
</style>
