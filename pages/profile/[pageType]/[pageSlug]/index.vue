<template>
  <div class="profile-redirect">
    <v-progress-circular indeterminate color="primary" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PAGE_DEFAULT_TAB } from '~/config/pageProfile'

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  try {
    const { pageType, pageSlug } = route.params
    // Redirect to the default tab
    await router.replace(`/profile/${pageType}/${pageSlug}/${PAGE_DEFAULT_TAB}`)
  } catch (error) {
    console.error('Navigation error:', error)
  }
})
</script>
