<template>
  <v-card class="current-talent-status pa-4" elevation="2">
    <div class="d-flex flex-column align-center text-center">
      <div class="status-header mb-6">
        <v-icon
          color="primary"
          size="48"
          icon="mdi-account-star"
          class="mb-2"
        ></v-icon>
        <h2 class="text-h5 font-weight-bold">Your Current Talent</h2>
      </div>

      <v-avatar v-if="user?.profile_photo" size="120" class="mb-4">
        <v-img :src="user.profile_photo" :alt="user.display_name"></v-img>
      </v-avatar>

      <div class="talent-info mb-6">
        <h3 class="text-h6 mb-2">{{ user?.display_name }}</h3>
        <v-chip color="primary" variant="tonal" size="large" class="mb-4">
          {{ user?.talent }}
        </v-chip>
        <p class="text-body-1 text-medium-emphasis mb-4">
          You're currently showcasing your talent as a {{ user?.talent }}
        </p>
        <!-- Added Profile Button -->
        <NuxtLink
          v-if="user?.username"
          :to="`/${user.username}`"
          class="text-decoration-none"
        >
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-account-edit"
            :loading="loading"
          >
            Edit Your Talent Profile
          </v-btn>
        </NuxtLink>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)

const user = computed(() => authStore.user?.value)

const emit = defineEmits(['change-talent'])
</script>

<style lang="scss" scoped>
.current-talent-status {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 12px;

  .status-header {
    background: linear-gradient(to right, #e8f5e9, #f5f5f5);
    padding: 16px;
    border-radius: 8px;
    width: 100%;
  }
}
</style>
