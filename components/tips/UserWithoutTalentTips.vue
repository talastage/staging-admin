<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <UserTipSearch />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <TipsList
          :items="items"
          :filters="filters"
          :selected-filter="selectedFilter"
          @update:selected-filter="selectedFilter = $event"
          :is-loading="isLoading"
          :current-user-id="getCurrentUserId()"
          :has-more="hasMore"
        />
      </v-col>
    </v-row>

    <v-snackbar v-model="showSnackbar" color="error" :timeout="5000">
      {{ scrollError?.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="scrollError = null">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'
import type { Tip, User } from '~/types/tips'

import { useAuthStore } from '~/stores/auth'

interface FilterOption {
  text: string
  value: string
}

const auth = useAuthStore()
const currentUser = computed<User | null>(() => auth.user)

const filters: FilterOption[] = [
  { text: 'All', value: 'all' },
  { text: 'Sent', value: 'sent' },
]

const selectedFilter = ref<string>('all')

const { $axios } = useNuxtApp()

const showSnackbar = computed<boolean>({
  get: () => !!scrollError.value,
  set: (val: boolean) => {
    if (!val) {
      scrollError.value = null
    }
  },
})

const fetchTips = async (page: number): Promise<Tip[]> => {
  try {
    const response = await $axios.get<{
      data: Tip[]
      meta: {
        current_page: number
        last_page: number
      }
    }>('/api/user/tips', {
      params: {
        page,
        per_page: 15,
        type: selectedFilter.value,
      },
    })
    return response.data.data
  } catch (err: any) {
    console.error('Failed to load tips:', err)
    throw err instanceof Error ? err : new Error('Failed to load tips')
  }
}

const {
  items,
  isLoading,
  error: scrollError,
  hasMore,
  reset,
  refresh,
} = useInfiniteScroll<Tip>(fetchTips, {
  threshold: 200,
  throttle: 300,
})

const getCurrentUserId = (): number | undefined => {
  return currentUser.value?.id
}

watch(selectedFilter, () => {
  reset()
  refresh()
})

onMounted(() => {
  refresh()
})
</script>

<style scoped>
.v-container {
  max-width: 1200px;
}
</style>
