<template>
  <v-btn
    :color="buttonConfig.color"
    :variant="buttonConfig.variant"
    block
    :loading="loading"
    @click="handleLogin"
    class="social-btn"
    :prepend-icon="buttonConfig.icon"
  >
    {{ buttonConfig.text }}
  </v-btn>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  provider: 'google' | 'facebook' | 'twitter' | 'instagram' | 'tiktok' | 'linkedin'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  (e: 'login', provider: string): void
}>()

const loading = ref(false)

const buttonConfig = computed(() => {
  const configs = {
    google: {
      color: '#4285f4',
      variant: 'flat' as const,
      icon: 'mdi-google',
      text: 'Continue with Google'
    },
    facebook: {
      color: '#1877f2',
      variant: 'flat' as const,
      icon: 'mdi-facebook',
      text: 'Continue with Facebook'
    },
    twitter: {
      color: '#1da1f2',
      variant: 'flat' as const,
      icon: 'mdi-twitter',
      text: 'Continue with Twitter'
    },
    instagram: {
      color: '#e4405f',
      variant: 'flat' as const,
      icon: 'mdi-instagram',
      text: 'Continue with Instagram'
    },
    tiktok: {
      color: '#000000',
      variant: 'flat' as const,
      icon: 'mdi-music-note',
      text: 'Continue with TikTok'
    },
    linkedin: {
      color: '#0077b5',
      variant: 'flat' as const,
      icon: 'mdi-linkedin',
      text: 'Continue with LinkedIn'
    }
  }
  return configs[props.provider]
})

const handleLogin = () => {
  emit('login', props.provider)
}
</script>

<style scoped>
.social-btn {
  margin-bottom: 8px;
  text-transform: none;
  font-weight: 500;
}

.social-btn :deep(.v-btn__content) {
  color: white;
}
</style>