<template>
  <BaseCard>
    <div class="user-fanning">
      <!-- Header -->
      <BaseHeader :title="headerTitle"> </BaseHeader>

      <v-container fluid class="pa-0">
        <!-- Following List -->
        <div v-if="!isLoading && fanning.length > 0" class="following-grid">
          <UserTalentCard
            v-for="fan in fanning"
            :key="fan.id"
            :user="fan"
            :size="cardSize"
          >
            <template #action>
              <FanButton
                :username="fan.username"
                :initial-fanning-state="fan.is_fanned_by_auth_user"
                @fanning-updated="handleFanningUpdate(fan.id, $event)"
              />
            </template>
          </UserTalentCard>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="following-grid">
          <UserTalentSkeleton
            v-for="n in 6"
            :key="'skeleton-' + n"
          />
        </div>

        <!-- Infinite Scroll Trigger -->
        <div
          v-if="!isLoading && hasMorePages"
          ref="loadMoreTrigger"
          class="scroll-trigger"
        >
          <div v-if="isLoadingMore" class="following-grid mt-4">
            <UserTalentSkeleton
              v-for="n in 6"
              :key="'skeleton-more-' + n"
            />
          </div>
          <div v-if="isLoadingMore" class="text-center mt-4">
            <v-progress-circular
              indeterminate
              color="primary"
              size="24"
            />
          </div>
        </div>

        <!-- No Following Found -->
        <NoContentFound
          v-if="!isLoading && fanning.length === 0"
          message="You haven't followed anyone yet! Discover new people to connect with and follow their updates."
        />

        <!-- Error State -->
        <v-alert v-if="error" type="error" variant="tonal" class="mt-4">
          {{ error }}
        </v-alert>
      </v-container>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onActivated } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { useNuxtApp } from '#app'

// Define Props
const props = defineProps<{
  username: string
}>()

// Interface Definitions
interface User {
  id: number
  username: string
  display_name: string
  profile_photo: string
  talent: string
  is_fanned_by_auth_user: boolean
}

interface PaginationState {
  currentPage: number
  lastPage: number
  total: number
  perPage: number
}

// State Management
const fanning = ref<User[]>([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const error = ref<string | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const lastFetchTime = ref<number | null>(null)
const isFetched = ref(false)

const pagination = ref<PaginationState>({
  currentPage: 1,
  lastPage: 1,
  total: 0,
  perPage: 12,
})

// Computed Properties
const hasMorePages = computed(() => {
  return pagination.value.currentPage <= pagination.value.lastPage
})

const cardSize = computed(() => 'medium')

const headerTitle = computed(() => {
  if (!isLoading.value && fanning.value.length === 0) {
    return 'You Haven’t Followed Anyone Yet'
  }
  return 'Following'
})

const needsRefresh = computed(() => {
  if (!lastFetchTime.value) return true
  // Refresh if data is older than 5 minutes (adjust as needed)
  return Date.now() - lastFetchTime.value > 5 * 60 * 1000
})

// API Calls
const fetchFanning = async (reset = false) => {
  if (reset) {
    isLoading.value = true
    pagination.value.currentPage = 1
    fanning.value = []
  } else {
    if (isLoadingMore.value || !hasMorePages.value) return
    isLoadingMore.value = true
  }

  error.value = null

  const { $axios } = useNuxtApp()

  try {
    const response = await $axios.get(`/api/fans/${props.username}/fanning`, {
      params: {
        page: pagination.value.currentPage,
        per_page: pagination.value.perPage,
      },
    })

    const newFanning = response.data.fanning as User[]
    fanning.value = reset ? newFanning : [...fanning.value, ...newFanning]

    pagination.value = {
      currentPage: response.data.pagination.current_page + 1,
      lastPage: response.data.pagination.last_page,
      total: response.data.pagination.total,
      perPage: response.data.pagination.per_page,
    }

    lastFetchTime.value = Date.now()
    isFetched.value = true
  } catch (err) {
    error.value = 'Failed to fetch following users. Please try again later.'
    console.error('Error fetching following:', err)
  } finally {
    if (reset) {
      isLoading.value = false
    } else {
      isLoadingMore.value = false
    }
  }
}

// Event Handlers
const handleFanningUpdate = (fanId: number, newState: boolean) => {
  const fanIndex = fanning.value.findIndex((f) => f.id === fanId)
  if (fanIndex !== -1) {
    fanning.value[fanIndex].is_fanned_by_auth_user = newState
  }
}

// Infinite Scroll Setup
useIntersectionObserver(
  loadMoreTrigger,
  ([{ isIntersecting }]) => {
    if (
      isIntersecting &&
      !isLoading.value &&
      hasMorePages.value &&
      !isLoadingMore.value
    ) {
      fetchFanning(false)
    }
  },
  { threshold: 0.1 }
)

// Initial fetch only if not already fetched
onMounted(() => {
  if (!isFetched.value) {
    fetchFanning(true)
  }
})

// Handle cached component reactivation
onActivated(() => {
  if (needsRefresh.value) {
    fetchFanning(true)
  }
})

// Watchers
watch(
  () => props.username,
  () => {
    // Always fetch when username changes, regardless of cache
    fetchFanning(true)
  }
)
</script>

<style scoped>
.user-fanning {
  max-width: 1400px;
  margin: 0 auto;
}

.following-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

@media (max-width: 600px) {
  .following-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 400px) {
  .following-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

.scroll-trigger {
  min-height: 20px;
  margin: 20px 0;
}

/* Optional: Adjust the skeleton loader styles for better appearance */
.v-skeleton-loader {
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
}
</style>
