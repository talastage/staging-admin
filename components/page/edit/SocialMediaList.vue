<!-- components/SocialMediaList.vue -->
<template>
  <v-list>
    <v-list-item
      v-for="(url, platform) in socialMediaLinks"
      :key="platform"
      v-if="url"
    >
      <template v-slot:prepend>
        <v-icon>{{ getSocialIcon(platform) }}</v-icon>
      </template>
      <v-list-item-title>
        <a :href="url" target="_blank" rel="noopener noreferrer">
          {{ capitalize(platform) }}
        </a>
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import type { Contact } from '~/types/page'

const props = defineProps<{
  socialMedia: Contact
}>()

const socialMediaLinks = computed(() => {
  const links: Partial<Record<string, string>> = {}
  const socialPlatforms = [
    'facebook_url',
    'instagram_url',
    'linkedin_url',
    'twitter_url',
  ]

  socialPlatforms.forEach((platform) => {
    const url = props.socialMedia[platform as keyof Contact]
    if (url) {
      links[platform] = url
    }
  })

  return links
})

const getSocialIcon = (platform: string): string => {
  const icons: Record<string, string> = {
    facebook_url: 'mdi-facebook',
    instagram_url: 'mdi-instagram',
    linkedin_url: 'mdi-linkedin',
    twitter_url: 'mdi-twitter',
  }
  return icons[platform] || 'mdi-link'
}

const capitalize = (str: string): string => {
  return str
    .replace(/_url$/, '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>
